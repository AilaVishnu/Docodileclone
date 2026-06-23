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
