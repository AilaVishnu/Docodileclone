import { useEffect, useState } from "react";
import { API_BASE_URL } from "../apiConfig";

// ─────────────────────────────────────────────────────────────────────────────
// Patients in the current clinic (with last-visit-date attached). Used by
// the Prescription-page patient picker and the Patient Files page. Filtered
// server-side by the JWT's clinicId — same multi-tenant pattern as useDoctors.
//
// A module-level cache makes leaving the page and coming back instant: the
// cached rows render immediately while a fresh fetch revalidates in the
// background (stale-while-revalidate). The cache is keyed by token so a
// different logged-in user never briefly sees another session's patients.
// ─────────────────────────────────────────────────────────────────────────────

export type Patient = {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
  gender: string | null;
  dob: string | null;          // ISO yyyy-MM-dd
  age: number | null;
  // Sequential per-clinic patient number, rendered as the "T###" code.
  // Null only for legacy rows predating the backend backfill.
  displayNo: number | null;
  lastVisitDate: string | null;
  // Distinct doctors this patient has been seen by (from visits). Drives
  // the doctor/department filter in Patient Files without per-row fetches.
  treatingDoctorIds: string[];
  // Department names of those treating doctors, resolved server-side.
  treatingDepartments: string[];
  // Backend follow-up: add `photo_url` column on the patients table and
  // return it here. Used by the avatar in PatientFilesPage right pane.
  photoUrl?: string | null;
};

type UsePatientsResult = {
  data: Patient[];
  loading: boolean;
  error: string | null;
};

let cache: { token: string | null; data: Patient[] } | null = null;

export function usePatients(refreshKey?: number): UsePatientsResult {
  const token = localStorage.getItem("docodile_token");
  const cached = cache && cache.token === token ? cache.data : null;

  const [data, setData] = useState<Patient[]>(cached ?? []);
  const [loading, setLoading] = useState(cached === null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    (async () => {
      // Only surface the loading state when there's nothing cached to show;
      // otherwise revalidate quietly behind the rows already on screen.
      const hasCache = cache !== null && cache.token === token;
      if (!hasCache) setLoading(true);
      setError(null);
      try {
        const res = await fetch(`${API_BASE_URL}/api/patients`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
          signal: controller.signal,
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json: Patient[] = await res.json();
        cache = { token, data: json };
        setData(json);
      } catch (e) {
        if ((e as Error).name === "AbortError") return;
        setError((e as Error).message);
        if (cache === null || cache.token !== token) setData([]);
      } finally {
        setLoading(false);
      }
    })();
    return () => controller.abort();
  }, [refreshKey, token]);

  return { data, loading, error };
}
