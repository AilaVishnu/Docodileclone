import React from "react";
import { colors, fonts, radii, shadows } from "../../styles/theme";

/**
 * BookletCover — a single guide/booklet "cover" for the Docs library shelf.
 * Editorial book look in Docodile's style: a coloured cover with a soft spine,
 * an illustration zone up top, a serif (Libertinus) title and a small kicker.
 * Fixed-aspect graphic (≈3:4), so type is sized in px like the avatar/Croc art.
 */
export type BookletCoverProps = {
  title: string;
  /** Small uppercase category label, e.g. "Guide". */
  kicker?: string;
  /** Cover background (a theme colour). Defaults to cream primary-100. */
  bg?: string;
  /** Title colour. Defaults to ink; use a light tone on dark covers. */
  fg?: string;
  /** Spine + kicker accent. */
  accent?: string;
  /** Illustration/motif shown in the upper zone. */
  art?: React.ReactNode;
  /** Cover width in px (height derives at ~3:4). */
  width?: number;
  onClick?: () => void;
};

export function BookletCover({
  title,
  kicker,
  bg = colors.primary100,
  fg = colors.neutral900,
  accent = colors.primary600,
  art,
  width = 150,
  onClick,
}: BookletCoverProps) {
  const height = Math.round(width * 1.34);
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={title}
      style={{
        width,
        height,
        flexShrink: 0,
        position: "relative",
        cursor: onClick ? "pointer" : "default",
        border: "none",
        padding: 0,
        textAlign: "left",
        // Book-ish: tight radius on the spine edge, rounded on the fore-edge.
        borderRadius: `${radii.xs}px ${radii.l}px ${radii.l}px ${radii.xs}px`,
        background: bg,
        overflow: "hidden",
        boxShadow: shadows.card,
        fontFamily: fonts.family.primary,
        display: "flex",
        flexDirection: "column",
      }}
    >
      <span style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 5, background: accent, opacity: 0.85 }} aria-hidden />
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "16px 14px 4px 18px", minHeight: 0 }}>
        {art}
      </div>
      <div style={{ padding: "0 14px 15px 18px" }}>
        {kicker && (
          <div style={{ fontSize: 9, letterSpacing: 1.1, textTransform: "uppercase", color: accent, fontWeight: 700, marginBottom: 5 }}>
            {kicker}
          </div>
        )}
        <div style={{ fontFamily: fonts.family.secondary, fontSize: 16.5, lineHeight: 1.12, color: fg, fontWeight: 500 }}>
          {title}
        </div>
      </div>
    </button>
  );
}
