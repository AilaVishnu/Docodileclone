import { useEffect, useState } from "react";
import { API_BASE_URL } from "../apiConfig";

// ─────────────────────────────────────────────────────────────────────────────
// Generic per-clinic autocomplete suggestions hook. Backed by
// GET /api/suggestions?field=&q= which returns the top-N suggestions for the
// current user's clinic, ranked by use_count.
//
// Reused by every suggestion-driven field on the page (Family History,
// Allergies, medicines, diagnoses, …) — caller just passes a different
// `field` string.
// ─────────────────────────────────────────────────────────────────────────────

export type Suggestion = {
  id: string;
  field: string;
  value: string;
  useCount: number;
};

type UseSuggestionsResult = {
  data: Suggestion[];
  loading: boolean;
  error: string | null;
};

/**
 * Debounced fetch (default 200ms). Returns top suggestions for `field`
 * whenever `query` changes; an empty query returns the most-used items so
 * the dropdown can show on focus before the user types anything.
 */
export function useSuggestions(
  field: string,
  query: string,
  options: { debounceMs?: number; limit?: number } = {}
): UseSuggestionsResult {
  const { debounceMs = 200, limit = 500 } = options;
  const [data, setData] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!field) {
      setData([]);
      return;
    }
    const controller = new AbortController();
    const timer = setTimeout(async () => {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem("docodile_token");
        const params = new URLSearchParams({ field, q: query, limit: String(limit) });
        const res = await fetch(`${API_BASE_URL}/api/suggestions?${params}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
          signal: controller.signal,
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json: Suggestion[] = await res.json();
        setData(json);
      } catch (e) {
        if ((e as Error).name === "AbortError") return;
        setError((e as Error).message);
        setData([]);
      } finally {
        setLoading(false);
      }
    }, debounceMs);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [field, query, debounceMs, limit]);

  return { data, loading, error };
}
