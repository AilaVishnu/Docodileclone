import React from "react";
import { Med, MedForm } from "./types";

const FORM_PALETTE: Record<MedForm, { body: string; cap: string; label: string }> = {
  tablet:   { body: "#F4E7CF", cap: "#E48647", label: "#5A4A2C" },
  syrup:    { body: "#CBE3D8", cap: "#E48647", label: "#1E5A3F" },
  cream:    { body: "#F1E0E6", cap: "#C97B8B", label: "#7A2C3F" },
  spray:    { body: "#D6E0F1", cap: "#456BBF", label: "#1F3A78" },
  soap:     { body: "#EDDFBA", cap: "#AE561A", label: "#6B3811" },
  serum:    { body: "#E6DFEE", cap: "#7A4FB0", label: "#3B1E66" },
  drops:    { body: "#DFE9E6", cap: "#2C9F8F", label: "#1B5A52" },
  ointment: { body: "#EFE6D6", cap: "#A07832", label: "#5C411A" },
};

type Props = {
  med: Med;
  width?: number;
  height?: number;
};

// Tiny, recognisable "stock" illustrations. Stock level fills the body
// from the bottom up; the cap stays solid. Form picks the silhouette so
// a row of tiles reads instantly as bottles / strips / tubes / jars.
export function MedIllustration({ med, width = 56, height = 80 }: Props) {
  const palette = FORM_PALETTE[med.form];
  const fillPct = Math.max(0, Math.min(1, med.unitsInStock / capacityFor(med)));
  const filledBg = palette.body;
  const emptyBg = "rgba(255, 255, 255, 0.6)";

  // Common SVG building blocks. Each silhouette uses two layers:
  //   - "empty" rect/path painted in `emptyBg`
  //   - "filled" rect/path clipped to fillPct from the bottom
  // This way the same shape conveys both identity and stock level.
  switch (med.form) {
    case "tablet":
      return (
        <svg width={width} height={height} viewBox="0 0 56 80" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Blister strip — 2x4 grid of pills */}
          <rect x={6} y={8} width={44} height={64} rx={6} fill={emptyBg} stroke={palette.label} strokeOpacity={0.2} />
          <rect
            x={6}
            y={8 + 64 * (1 - fillPct)}
            width={44}
            height={64 * fillPct}
            rx={6}
            fill={filledBg}
          />
          {/* Pills overlay */}
          {[0, 1, 2, 3].map((row) =>
            [0, 1].map((col) => (
              <circle
                key={`${row}-${col}`}
                cx={18 + col * 20}
                cy={18 + row * 14}
                r={4.5}
                fill={palette.cap}
                opacity={0.7}
              />
            ))
          )}
        </svg>
      );

    case "syrup":
    case "drops":
      return (
        <svg width={width} height={height} viewBox="0 0 56 80" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Bottle silhouette */}
          <rect x={20} y={4} width={16} height={10} rx={2} fill={palette.cap} />
          <rect x={14} y={14} width={28} height={6} rx={2} fill={palette.cap} opacity={0.8} />
          <rect x={10} y={20} width={36} height={56} rx={8} fill={emptyBg} stroke={palette.label} strokeOpacity={0.2} />
          <rect
            x={10}
            y={20 + 56 * (1 - fillPct)}
            width={36}
            height={56 * fillPct}
            rx={8}
            fill={filledBg}
          />
        </svg>
      );

    case "cream":
    case "ointment":
      return (
        <svg width={width} height={height} viewBox="0 0 56 80" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Tube with screw cap, lying upright */}
          <rect x={20} y={4} width={16} height={12} rx={3} fill={palette.cap} />
          <path
            d="M14 16 L42 16 L46 24 L46 70 Q46 76 40 76 L16 76 Q10 76 10 70 L10 24 Z"
            fill={emptyBg}
            stroke={palette.label}
            strokeOpacity={0.2}
          />
          <clipPath id={`tube-${med.id}`}>
            <path d="M14 16 L42 16 L46 24 L46 70 Q46 76 40 76 L16 76 Q10 76 10 70 L10 24 Z" />
          </clipPath>
          <rect
            x={10}
            y={16 + 60 * (1 - fillPct)}
            width={36}
            height={60 * fillPct}
            clipPath={`url(#tube-${med.id})`}
            fill={filledBg}
          />
        </svg>
      );

    case "spray":
      return (
        <svg width={width} height={height} viewBox="0 0 56 80" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Trigger spray bottle */}
          <path d="M28 4 L40 4 L40 14 L36 14 L36 18 L28 18 Z" fill={palette.cap} />
          <rect x={12} y={18} width={32} height={58} rx={6} fill={emptyBg} stroke={palette.label} strokeOpacity={0.2} />
          <rect
            x={12}
            y={18 + 58 * (1 - fillPct)}
            width={32}
            height={58 * fillPct}
            rx={6}
            fill={filledBg}
          />
        </svg>
      );

    case "soap":
      return (
        <svg width={width} height={height} viewBox="0 0 56 80" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Pump-bottle / facewash */}
          <rect x={22} y={2} width={12} height={6} rx={2} fill={palette.cap} />
          <rect x={26} y={8} width={4} height={6} fill={palette.cap} />
          <rect x={18} y={14} width={20} height={4} rx={1} fill={palette.cap} opacity={0.8} />
          <rect x={10} y={18} width={36} height={58} rx={8} fill={emptyBg} stroke={palette.label} strokeOpacity={0.2} />
          <rect
            x={10}
            y={18 + 58 * (1 - fillPct)}
            width={36}
            height={58 * fillPct}
            rx={8}
            fill={filledBg}
          />
        </svg>
      );

    case "serum":
      return (
        <svg width={width} height={height} viewBox="0 0 56 80" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Dropper-style serum bottle */}
          <rect x={22} y={2} width={12} height={4} rx={1} fill={palette.cap} />
          <rect x={20} y={6} width={16} height={8} rx={2} fill={palette.cap} />
          <rect x={26} y={14} width={4} height={10} fill={palette.cap} opacity={0.7} />
          <rect x={12} y={22} width={32} height={54} rx={6} fill={emptyBg} stroke={palette.label} strokeOpacity={0.2} />
          <rect
            x={12}
            y={22 + 54 * (1 - fillPct)}
            width={32}
            height={54 * fillPct}
            rx={6}
            fill={filledBg}
          />
        </svg>
      );
  }
}

// Reference capacity by form for the fill bar. Tablets count by units (per
// strip ~10), bottles by single units — pick a "full shelf" reference so a
// well-stocked item looks visibly full.
function capacityFor(med: Med): number {
  switch (med.form) {
    case "tablet": return 500;
    default: return 20;
  }
}
