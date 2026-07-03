import { API_BASE_URL } from "../apiConfig";
import type { Patient } from "../hooks/usePatients";

export type CreatePatientRequest = {
  name: string;
  phone: string | null;
  email: string | null;
  gender: string | null;
  dob: string | null; // ISO yyyy-MM-dd
  age: number | null; // months
};

// Create (or find, by phone + name) a patient. Mirrors the appointment
// booking's find-or-create, so billing a walk-in from the New Bill page
// resolves to the same record instead of duplicating it.
export async function createPatient(req: CreatePatientRequest): Promise<Patient> {
  const token = localStorage.getItem("docodile_token");
  const res = await fetch(`${API_BASE_URL}/api/patients`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(req),
  });
  if (!res.ok) {
    const raw = await res.text();
    let msg = `HTTP ${res.status}`;
    try { msg = raw ? (JSON.parse(raw).error || msg) : msg; } catch { msg = raw || msg; }
    throw new Error(msg);
  }
  return res.json();
}
