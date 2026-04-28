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
  /**
   * The patientId we last successfully fetched for, or `null` if we
   * haven't completed a fetch yet. Callers (e.g. auto-create-today's-draft
   * logic) should gate on this matching the current patientId — otherwise
   * the empty initial `visits = []` looks indistinguishable from "patient
   * really has zero visits" and triggers spurious POSTs.
   */
  loadedFor: string | null;
  refetch: () => Promise<void>;
};

export function useVisits(patientId: string | null): UseVisitsResult {
  const [visits, setVisits] = useState<VisitDTO[]>([]);
  // Start in `loading` state if a patientId was provided so the first
  // render doesn't claim "no visits" before the fetch even begins.
  const [loading, setLoading] = useState<boolean>(patientId !== null);
  const [error, setError] = useState<string | null>(null);
  const [loadedFor, setLoadedFor] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    if (!patientId) {
      setVisits([]);
      setLoadedFor(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const data = await listVisits(patientId);
      setVisits(data);
      setLoadedFor(patientId);
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

  return { visits, loading, error, loadedFor, refetch };
}
