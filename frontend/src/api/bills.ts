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
  note: string | null;
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
  note?: string;
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

// Clinic-wide bills (joined with patient name + a today flag) for the Bills
// page. Optional ISO yyyy-mm-dd from/to bound the period filter.
export type ClinicBill = Bill & { patientName: string; today: boolean };
export async function listClinicBills(from?: string, to?: string): Promise<ClinicBill[]> {
  const params = new URLSearchParams();
  if (from) params.set("from", from);
  if (to) params.set("to", to);
  const qs = params.toString();
  const res = await fetch(`${API_BASE_URL}/api/tenant/bills${qs ? `?${qs}` : ""}`, {
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

// Refund a settled bill: the full received amount is returned and the invoice
// flips to REFUNDED. Returns the updated bill.
export async function refundBill(billId: string): Promise<ClinicBill> {
  const res = await fetch(`${API_BASE_URL}/api/tenant/bills/${billId}/refund`, {
    method: "POST",
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

// Record a payment against a bill ("Mark paid" / "Pay ₹X" / "Record payment").
// Adds to what's collected and re-settles due/payStatus. Returns the updated bill.
export async function payBill(billId: string, payload: { paidAmount: number; method?: string; note?: string }): Promise<ClinicBill> {
  const res = await fetch(`${API_BASE_URL}/api/tenant/bills/${billId}/pay`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify(payload),
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
  payload: { method: string; discountAmount?: number; paidAmount?: number; billDate?: string; items: ChargeLine[]; note?: string },
): Promise<ChargeResult> {
  const res = await fetch(`${API_BASE_URL}/api/tenant/appointments/${appointmentId}/charge`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}
