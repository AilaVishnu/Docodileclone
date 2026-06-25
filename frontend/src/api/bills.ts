import { API_BASE_URL } from "../apiConfig";

// One invoice in the Recent Bills history. `items` is the JSON line-item
// snapshot taken at Charge & Bill (parse to re-open / print).
export type Bill = {
  id: string;
  invoiceNo: string;
  billDate: string; // ISO date (yyyy-mm-dd)
  billed: number;
  paid: number;
  due: number;
  refund: number;
  depositApplied: number | null;
  payStatus: string | null;
  paymentMethod: string | null;
  items: string | null;
  appointmentId: string | null;
  createdAt: string;
};

export type CreateBillPayload = {
  appointmentId?: string;
  billDate?: string;
  billed: number;
  paid: number;
  due: number;
  refund?: number;
  depositApplied?: number;
  payStatus?: string;
  paymentMethod?: string;
  items?: string;
};

function authHeaders(): Record<string, string> {
  const token = localStorage.getItem("docodile_token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function listBills(patientId: string): Promise<Bill[]> {
  const res = await fetch(`${API_BASE_URL}/api/patients/${patientId}/bills`, {
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

export async function createBill(patientId: string, payload: CreateBillPayload): Promise<Bill> {
  const res = await fetch(`${API_BASE_URL}/api/patients/${patientId}/bills`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

// One atomic Charge & Bill. The client sends the line items + method; the server
// recomputes totals, writes payment, creates the invoice, auto-covers from the
// deposit and deducts stock — all in one transaction.
export type ChargeLine = {
  name: string;
  qty: number;
  unit: number;
  gst: number;
  disc: number;
  discUnit: string;   // "%" or "₹"
  kind: string;       // "service" | "medicine"
  inStock: boolean;
};
export type ChargeResult = {
  bill: Bill;
  depositApplied: number;
  patientDeposit: number;
  stock: { applied: { name: string; requested: number; deducted: number }[]; missing: string[] };
};
export async function chargeAppointment(
  appointmentId: string,
  payload: { method: string; discountAmount?: number; billDate?: string; items: ChargeLine[] },
): Promise<ChargeResult> {
  const res = await fetch(`${API_BASE_URL}/api/tenant/appointments/${appointmentId}/charge`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}
