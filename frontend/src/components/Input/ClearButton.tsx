import React from "react";
import { colors } from "../../styles/theme";

// ─────────────────────────────────────────────────────────────────────────────
// ClearButton — the one legible "clear" (✕) affordance for inputs. A crisp
// 1.5px-stroke SVG ✕ in neutral900 (matches the canonical IconButton close
// glyph), so every clearable field shows the SAME ✕ instead of a tiny "×"
// character or the browser's native search clear.
// ─────────────────────────────────────────────────────────────────────────────
export const ClearButton: React.FC<{ onClear: () => void; ariaLabel?: string }> = ({
  onClear,
  ariaLabel = "Clear",
}) => (
  <button
    type="button"
    aria-label={ariaLabel}
    tabIndex={-1}
    // onMouseDown (not onClick) so the field doesn't blur/close before clearing.
    onMouseDown={(e) => {
      e.preventDefault();
      e.stopPropagation();
      onClear();
    }}
    style={{
      flexShrink: 0,
      width: 20,
      height: 20,
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      background: "transparent",
      border: "none",
      padding: 0,
      cursor: "pointer",
      color: colors.neutral900,
    }}
  >
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" aria-hidden>
      <path d="M18 6L6 18M6 6l12 12" />
    </svg>
  </button>
);
