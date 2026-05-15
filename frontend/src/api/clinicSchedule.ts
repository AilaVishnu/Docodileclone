import { API_BASE_URL } from "../apiConfig";

// Clinic-wide weekly availability schedule. The backend stores the entire
// shape (default week + date-keyed overrides + configured flag) as opaque
// JSON, so this client just round-trips a string.

function authHeaders(): HeadersInit {
  const token = localStorage.getItem("docodile_token");
  return token
    ? { "Content-Type": "application/json", Authorization: `Bearer ${token}` }
    : { "Content-Type": "application/json" };
}

export async function getClinicSchedule(): Promise<string> {
  const res = await fetch(`${API_BASE_URL}/api/tenant/clinic-schedule`, { headers: authHeaders() });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const body = await res.json();
  return body.schedule ?? "{}";
}

export async function putClinicSchedule(scheduleJson: string): Promise<void> {
  const res = await fetch(`${API_BASE_URL}/api/tenant/clinic-schedule`, {
    method: "PUT",
    headers: authHeaders(),
    body: JSON.stringify({ schedule: scheduleJson }),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
}
