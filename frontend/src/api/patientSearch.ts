import { API_BASE_URL } from "../apiConfig";

// One "notes / prescriptions" hit from the Patient Files keyword search.
// `type` is "Rx" or "Visit"; `snippet` is a windowed excerpt containing the
// keyword (highlighted client-side).
export type PatientContentMatch = {
  patientId: string;
  patientName: string;
  patientGender: string | null;
  patientAge: number | null;        // months
  patientDisplayNo: number | null;
  type: string;
  snippet: string;
};

export async function searchPatientContent(q: string): Promise<PatientContentMatch[]> {
  const token = localStorage.getItem("docodile_token");
  const res = await fetch(
    `${API_BASE_URL}/api/patients/content-search?q=${encodeURIComponent(q)}`,
    { headers: token ? { Authorization: `Bearer ${token}` } : {} },
  );
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

// Bill-modal footer: when the patient was registered + their most recent
// payment. `lastPaymentAt` is the scheduled time of the latest PAID/WAIVED
// appointment; null when they've never paid.
export type BillFooter = {
  registeredAt: string | null;     // ISO instant
  lastPaymentAt: string | null;    // ISO local date-time
  lastPaymentMethod: string | null;
};

export async function getBillFooter(patientId: string): Promise<BillFooter> {
  const token = localStorage.getItem("docodile_token");
  const res = await fetch(
    `${API_BASE_URL}/api/patients/${patientId}/bill-footer`,
    { headers: token ? { Authorization: `Bearer ${token}` } : {} },
  );
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

// Patient advance/deposit — a running credit drawn against future bills. The
// `deposit` is the current net; `ledger` is every movement newest-first.
export type DepositLedgerEntry = {
  id: string;
  type: "DEPOSIT" | "REFUND" | "BILL_DEDUCTION" | string;
  amount: number;
  mode: string | null;
  details: string | null;
  balanceAfter: number;
  appointmentId: string | null;
  createdAt: string;
};
export type PatientDeposit = { deposit: number; ledger: DepositLedgerEntry[] };

export async function getPatientDeposit(patientId: string): Promise<PatientDeposit> {
  const token = localStorage.getItem("docodile_token");
  const res = await fetch(`${API_BASE_URL}/api/patients/${patientId}/deposit`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

// Record a deposit or refund. `amount` is the non-negative magnitude; `type`
// gives the direction; mode/details are kept in the ledger. Returns the updated
// net + history.
export async function recordPatientDeposit(
  patientId: string,
  amount: number,
  type: "DEPOSIT" | "REFUND",
  mode?: string,
  details?: string,
): Promise<PatientDeposit> {
  const token = localStorage.getItem("docodile_token");
  const res = await fetch(`${API_BASE_URL}/api/patients/${patientId}/deposit`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ amount, type, mode, details }),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}
