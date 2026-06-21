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
