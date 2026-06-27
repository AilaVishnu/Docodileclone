import { useEffect, useState } from "react";
import { breakpoints } from "../styles/theme";

// Reactive media-query hook. Returns true when the current viewport
// matches the query string. Re-renders on threshold cross.
//
// Use SPARINGLY — only for genuinely categorical render decisions
// (render component A vs B, show or hide an element). For property-by-
// property style swaps prefer CSS variables in globals.css consumed via
// `var(--name)` from inline styles. That path runs in the browser's
// compositor, no React re-renders.
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState<boolean>(() => {
    if (typeof window === "undefined" || typeof window.matchMedia !== "function") return false;
    return window.matchMedia(query).matches;
  });

  useEffect(() => {
    if (typeof window === "undefined" || typeof window.matchMedia !== "function") return;
    const mql = window.matchMedia(query);
    const onChange = (e: MediaQueryListEvent) => setMatches(e.matches);
    setMatches(mql.matches);
    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  }, [query]);

  return matches;
}

// Convenience helpers — keep names semantic so JSX reads like English.
// "Compact" means anything below the comfortable-desktop baseline; this
// is the bucket where the side nav auto-collapses, split panes stack, etc.
export const useIsCompact = () => useMediaQuery(`(max-width: ${breakpoints.lg - 1}px)`);
export const useIsNarrow  = () => useMediaQuery(`(max-width: ${breakpoints.md - 1}px)`);
