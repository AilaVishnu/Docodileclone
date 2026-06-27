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

// Tiny, recognisable "stock" illustrations. Every form has its OWN silhouette so
// a row of tiles reads instantly — blister strip / tall bottle / jar / spray /
// bar / dropper / eye-drop bottle / squeeze tube. Stock level fills the body
// from the bottom up (clipped to the silhouette); the cap/top stays solid.
export function MedIllustration({ med, width = 56, height = 80 }: Props) {
  const palette = FORM_PALETTE[med.form];
  const fillPct = Math.max(0, Math.min(1, med.unitsInStock / capacityFor(med)));
  const filledBg = palette.body;
  const emptyBg = "rgba(255, 255, 255, 0.6)";
  const stroke = { stroke: palette.label, strokeOpacity: 0.2 };
  const cid = `med-${med.id}`;

  const svgProps = {
    width,
    height,
    viewBox: "0 0 56 80",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg",
  } as const;

  switch (med.form) {
    // ── Tablet — 2×4 blister strip ──────────────────────────────────────────
    case "tablet":
      return (
        <svg {...svgProps}>
          <rect x={6} y={8} width={44} height={64} rx={6} fill={emptyBg} {...stroke} />
          <rect x={6} y={8 + 64 * (1 - fillPct)} width={44} height={64 * fillPct} rx={6} fill={filledBg} />
          {[0, 1, 2, 3].map((row) =>
            [0, 1].map((col) => (
              <circle key={`${row}-${col}`} cx={18 + col * 20} cy={18 + row * 14} r={4.5} fill={palette.cap} opacity={0.7} />
            ))
          )}
        </svg>
      );

    // ── Syrup — tall labelled medicine bottle ───────────────────────────────
    case "syrup":
      return (
        <svg {...svgProps}>
          <rect x={21} y={3} width={14} height={9} rx={2} fill={palette.cap} />
          <rect x={17} y={12} width={22} height={6} rx={2} fill={palette.cap} opacity={0.85} />
          <clipPath id={cid}><rect x={12} y={18} width={32} height={58} rx={9} /></clipPath>
          <rect x={12} y={18} width={32} height={58} rx={9} fill={emptyBg} {...stroke} />
          <rect x={12} y={18 + 58 * (1 - fillPct)} width={32} height={58 * fillPct} fill={filledBg} clipPath={`url(#${cid})`} />
          <rect x={16} y={40} width={24} height={16} rx={2} fill="#FFFFFF" opacity={0.45} />
        </svg>
      );

    // ── Cream — squat jar / tub with a wide lid ─────────────────────────────
    case "cream":
      return (
        <svg {...svgProps}>
          <rect x={14} y={9} width={28} height={9} rx={3} fill={palette.cap} />
          <rect x={12} y={18} width={32} height={4} rx={1.5} fill={palette.cap} opacity={0.8} />
          <clipPath id={cid}><rect x={11} y={22} width={34} height={48} rx={7} /></clipPath>
          <rect x={11} y={22} width={34} height={48} rx={7} fill={emptyBg} {...stroke} />
          <rect x={11} y={22 + 48 * (1 - fillPct)} width={34} height={48 * fillPct} fill={filledBg} clipPath={`url(#${cid})`} />
        </svg>
      );

    // ── Spray — trigger sprayer with a mist puff ────────────────────────────
    case "spray":
      return (
        <svg {...svgProps}>
          <rect x={16} y={10} width={16} height={8} rx={2} fill={palette.cap} />
          <rect x={32} y={12} width={6} height={3.5} rx={1} fill={palette.cap} />
          <rect x={22} y={18} width={11} height={6} fill={palette.cap} opacity={0.85} />
          <circle cx={42} cy={10} r={1.5} fill={palette.cap} opacity={0.6} />
          <circle cx={45} cy={13.5} r={1.5} fill={palette.cap} opacity={0.6} />
          <circle cx={42} cy={17} r={1.5} fill={palette.cap} opacity={0.6} />
          <clipPath id={cid}><rect x={14} y={24} width={28} height={52} rx={6} /></clipPath>
          <rect x={14} y={24} width={28} height={52} rx={6} fill={emptyBg} {...stroke} />
          <rect x={14} y={24 + 52 * (1 - fillPct)} width={28} height={52 * fillPct} fill={filledBg} clipPath={`url(#${cid})`} />
        </svg>
      );

    // ── Soap — bar with lather bubbles ──────────────────────────────────────
    case "soap":
      return (
        <svg {...svgProps}>
          <circle cx={18} cy={30} r={4} fill={palette.cap} opacity={0.5} />
          <circle cx={31} cy={23} r={5} fill={palette.cap} opacity={0.55} />
          <circle cx={41} cy={31} r={3.5} fill={palette.cap} opacity={0.45} />
          <clipPath id={cid}><rect x={8} y={42} width={40} height={30} rx={11} /></clipPath>
          <rect x={8} y={42} width={40} height={30} rx={11} fill={emptyBg} {...stroke} />
          <rect x={8} y={42 + 30 * (1 - fillPct)} width={40} height={30 * fillPct} fill={filledBg} clipPath={`url(#${cid})`} />
          <path d="M16 49 Q22 46 28 49" stroke="#FFFFFF" strokeOpacity={0.5} strokeWidth={2} fill="none" strokeLinecap="round" />
        </svg>
      );

    // ── Serum — dropper bottle, rubber bulb on a short neck ─────────────────
    case "serum":
      return (
        <svg {...svgProps}>
          <rect x={22} y={4} width={12} height={8} rx={4} fill={palette.cap} />
          <rect x={20} y={12} width={16} height={5} rx={1.5} fill={palette.cap} opacity={0.85} />
          <clipPath id={cid}><rect x={15} y={17} width={26} height={59} rx={6} /></clipPath>
          <rect x={15} y={17} width={26} height={59} rx={6} fill={emptyBg} {...stroke} />
          <rect x={15} y={17 + 59 * (1 - fillPct)} width={26} height={59 * fillPct} fill={filledBg} clipPath={`url(#${cid})`} />
        </svg>
      );

    // ── Drops — small eye-drop bottle with a rounded dropper cap ────────────
    case "drops":
      return (
        <svg {...svgProps}>
          <rect x={23} y={6} width={10} height={12} rx={5} fill={palette.cap} />
          <rect x={21} y={18} width={14} height={4} rx={1.5} fill={palette.cap} opacity={0.85} />
          <clipPath id={cid}><rect x={16} y={22} width={24} height={46} rx={8} /></clipPath>
          <rect x={16} y={22} width={24} height={46} rx={8} fill={emptyBg} {...stroke} />
          <rect x={16} y={22 + 46 * (1 - fillPct)} width={24} height={46 * fillPct} fill={filledBg} clipPath={`url(#${cid})`} />
        </svg>
      );

    // ── Ointment — squeeze tube inverted: crimped seal on top, cap below ────
    case "ointment": {
      const tube = "M16 16L40 16L40 56Q40 68 33 68L23 68Q16 68 16 56Z";
      return (
        <svg {...svgProps}>
          {/* crimped flat seal at the top */}
          <rect x={15} y={10} width={26} height={6} rx={1.5} fill={palette.cap} opacity={0.5} />
          <path d="M21 10L21 16M27 10L27 16M33 10L33 16" stroke={palette.label} strokeOpacity={0.3} strokeWidth={1.2} />
          {/* tube body — full width up top, tapering to the neck below */}
          <clipPath id={cid}><path d={tube} /></clipPath>
          <path d={tube} fill={emptyBg} {...stroke} />
          <rect x={16} y={16 + 52 * (1 - fillPct)} width={24} height={52 * fillPct} fill={filledBg} clipPath={`url(#${cid})`} />
          {/* screw cap at the bottom */}
          <rect x={24} y={68} width={8} height={9} rx={1.5} fill={palette.cap} />
        </svg>
      );
    }
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
