import { useEffect, useState } from "react";
import { API_BASE_URL } from "../apiConfig";

// ─────────────────────────────────────────────────────────────────────────────
// Doctors of the current user's clinic. Backed by GET /api/doctors which is
// filtered server-side by currentUser.clinicId() — same multi-tenant pattern
// as the patient list. Used by the Prescription "Refer to" dropdown.
// ─────────────────────────────────────────────────────────────────────────────

export type Doctor = {
  id: string;
  name: string;
  speciality: string | null;
  registrationNo: string | null;
};

type UseDoctorsResult = {
  data: Doctor[];
  loading: boolean;
  error: string | null;
};

export function useDoctors(): UseDoctorsResult {
  const [data, setData] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem("docodile_token");
        const res = await fetch(`${API_BASE_URL}/api/doctors`, {
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
