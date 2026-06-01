import { API_BASE_URL } from "../apiConfig";

// Slim shape of a past prescription used to autofill an Rx row.
export type RxLatestDTO = {
  medicine: string | null;
  medicineNote: string | null;
  dosage: string | null;
  whenToTake: string | null;
  frequency: string | null;
  frequencyInterval: string | null;
  duration: string | null;
  notes: string | null;
};

const authHeaders = (): HeadersInit => {
  const token = localStorage.getItem("docodile_token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

/**
 * Latest prescription of `medicine` across the clinic (optionally excluding
 * the visit being edited). Returns `null` when no past prescription exists.
 */
export async function fetchLatestRxForMedicine(
  medicine: string,
  excludeVisitId?: string | null,
): Promise<RxLatestDTO | null> {
  const params = new URLSearchParams({ medicine });
  if (excludeVisitId) params.set("excludeVisitId", excludeVisitId);
  const res = await fetch(`${API_BASE_URL}/api/tenant/rx-history/latest?${params.toString()}`, {
    headers: authHeaders(),
  });
  if (res.status === 204) return null;
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json() as Promise<RxLatestDTO>;
}
