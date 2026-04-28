import { useCallback, useEffect, useState } from "react";
import { listVisits, VisitDTO } from "../api/visits";

// ─────────────────────────────────────────────────────────────────────────────
// Visits for a single patient. Fetches once on mount (and whenever
// `patientId` changes), exposes a `refetch()` so the PrescriptionPage can
// reload after Save / Add new visit.
// ─────────────────────────────────────────────────────────────────────────────

type UseVisitsResult = {
  visits: VisitDTO[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
};

export function useVisits(patientId: string | null): UseVisitsResult {
  const [visits, setVisits] = useState<VisitDTO[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    if (!patientId) {
      setVisits([]);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      setVisits(await listVisits(patientId));
    } catch (e) {
      setError((e as Error).message);
      setVisits([]);
    } finally {
      setLoading(false);
    }
  }, [patientId]);

  useEffect(() => {
    void refetch();
  }, [refetch]);

  return { visits, loading, error, refetch };
}
