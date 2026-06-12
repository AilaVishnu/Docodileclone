import React, { useState } from "react";
import { colors, radii } from "../../styles/theme";

// ─────────────────────────────────────────────────────────────────────────────
// IconButton — the canonical icon-only button (CLOSE-canon). A 32px circular
// hit target, neutral700 glyph, with a subtle neutralAlphaBlack tint on hover.
// Defaults to a ✕ close glyph; pass `children` for any other icon.
//
// Replaces the ~12 hand-rolled close (✕) buttons that previously diverged in
// shape (circle / square / bare glyph), size and colour.
// ─────────────────────────────────────────────────────────────────────────────
type IconButtonProps = {
  /** Required for accessibility, e.g. "Close". Also used as the title tooltip. */
  ariaLabel: string;
  onClick?: (e: React.MouseEvent) => void;
  /** The icon. Defaults to a ✕ close glyph. */
  children?: React.ReactNode;
  /** Square hit target in px. Default 32. */
  size?: number;
  /** Glyph colour. Default neutral700. */
  color?: string;
  title?: string;
  disabled?: boolean;
  style?: React.CSSProperties;
};

const CloseGlyph = ({ s = 24 }: { s?: number }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth={2} strokeLinecap="round" aria-hidden>
    <path d="M18 6L6 18M6 6l12 12" />
  </svg>
);

export function IconButton({
  ariaLabel, onClick, children, size = 32, color = colors.neutral700, title, disabled, style,
}: IconButtonProps) {
  const [hover, setHover] = useState(false);
  return (
    <button
      type="button"
      aria-label={ariaLabel}
      title={title ?? ariaLabel}
      onClick={onClick}
      disabled={disabled}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        width: size, height: size, borderRadius: radii.full,
        display: "inline-flex", alignItems: "center", justifyContent: "center",
        border: "none", padding: 0, cursor: disabled ? "default" : "pointer",
        color,
        background: hover && !disabled ? colors.neutralAlphaBlack : "transparent",
        transition: "background-color 0.15s ease", flexShrink: 0,
        opacity: disabled ? 0.5 : 1,
        ...style,
      }}
    >
      {children ?? <CloseGlyph />}
    </button>
  );
}
