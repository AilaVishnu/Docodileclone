import { useEffect, useState } from "react";
import { API_BASE_URL } from "../apiConfig";

// ─────────────────────────────────────────────────────────────────────────────
// Patients in the current clinic (with last-visit-date attached). Used by
// the Prescription-page patient picker. Filtered server-side by the JWT's
// clinicId — same multi-tenant pattern as useDoctors.
// ─────────────────────────────────────────────────────────────────────────────

export type Patient = {
  id: string;
  name: string;
  phone: string | null;
  gender: string | null;
  dob: string | null;          // ISO yyyy-MM-dd
  age: number | null;
  lastVisitDate: string | null;
};

type UsePatientsResult = {
  data: Patient[];
  loading: boolean;
  error: string | null;
};

export function usePatients(): UsePatientsResult {
  const [data, setData] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem("docodile_token");
        const res = await fetch(`${API_BASE_URL}/api/patients`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
          signal: controller.signal,
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        setData(await res.json());
      } catch (e) {
        if ((e as Error).name === "AbortError") return;
        setError((e as Error).message);
        setData([]);
      } finally {
        setLoading(false);
      }
    })();
    return () => controller.abort();
  }, []);

  return { data, loading, error };
}
