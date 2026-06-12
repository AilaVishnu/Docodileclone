import React, { useEffect, useRef, useState } from "react";
import { ChevronDown } from "../icons/ChevronDown";
import { RangeCalendar } from "../DatePicker/RangeCalendar";
import { colors, fonts, radii, spacing, strokes } from "../../styles/theme";

// DateRangeDropdown — a header pill ("[range] ▾") that opens a list of range
// presets; the special `customId` preset opens an in-place RangeCalendar to
// pick a start + end. Shared so any page (Stats today) can offer date-range
// filtering with one component. The parent owns the active range + data; this
// just renders the control and calls back.
export type RangePreset = { id: string; label: string };

const MONTHS_SHORT = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const fmtIso = (iso: string) => {
  if (!iso) return "";
  const [, m, d] = iso.split("-").map(Number);
  return `${d} ${MONTHS_SHORT[m - 1]}`;
};
const parseIso = (iso: string): Date | null => {
  if (!iso) return null;
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d);
};
const toIso = (x: Date) => `${x.getFullYear()}-${String(x.getMonth() + 1).padStart(2, "0")}-${String(x.getDate()).padStart(2, "0")}`;

const s: Record<string, React.CSSProperties> = {
  trigger: {
    display: "inline-flex", alignItems: "center", gap: 6, cursor: "pointer",
    color: colors.neutral900, backgroundColor: "transparent",
    border: `${strokes.xs} solid ${colors.primary400}`, borderRadius: radii.m,
    padding: "4px 12px", position: "relative", whiteSpace: "nowrap",
  },
  menu: {
    position: "absolute", top: "calc(100% + 8px)", left: 0, zIndex: 1200,
    backgroundColor: colors.neutral100, border: `${strokes.xs} solid ${colors.neutral200}`,
    borderRadius: radii.l, padding: spacing["2xs"], minWidth: 188,
    boxShadow: "2px 2px 12px 0px rgba(0,0,0,0.08)", textAlign: "left",
  },
  item: {
    display: "flex", width: "100%", alignItems: "center", justifyContent: "space-between",
    border: "none", background: "transparent", textAlign: "left", cursor: "pointer",
    fontSize: fonts.size.s, fontFamily: fonts.family.primary, color: colors.neutral900,
    padding: `${spacing.xs} ${spacing.s}`, borderRadius: radii.m, whiteSpace: "nowrap",
  },
  itemActive: { backgroundColor: colors.neutral150 },
  calWrap: { position: "absolute", top: "calc(100% + 8px)", left: 0, zIndex: 1200 },
};

export function DateRangeDropdown({
  presets, valueId, customId = "custom", customStart = "", customEnd = "",
  onSelectPreset, onSelectCustom,
}: {
  presets: RangePreset[];
  valueId: string;
  customId?: string;
  customStart?: string;
  customEnd?: string;
  onSelectPreset: (id: string) => void;
  onSelectCustom: (startIso: string, endIso: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [view, setView] = useState<"menu" | "cal">("menu");
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

  const label = valueId === customId
    ? (customStart && customEnd ? `${fmtIso(customStart)} – ${fmtIso(customEnd)}` : (presets.find((p) => p.id === customId)?.label ?? "Custom range"))
    : (presets.find((p) => p.id === valueId)?.label ?? presets[0]?.label ?? "");

  return (
    <span ref={ref} style={s.trigger} onClick={(e) => { e.stopPropagation(); setView("menu"); setOpen((o) => !o); }}>
      {label}
      <ChevronDown open={open} />

      {open && view === "menu" && (
        <div style={s.menu} onClick={(e) => e.stopPropagation()}>
          {presets.map((p) => (
            <button
              key={p.id}
              style={{ ...s.item, ...(p.id === valueId ? s.itemActive : null) }}
              onClick={() => { if (p.id === customId) { setView("cal"); } else { onSelectPreset(p.id); setOpen(false); } }}
            >
              {p.label}{p.id === customId && <span style={{ color: colors.neutral400 }}>›</span>}
            </button>
          ))}
        </div>
      )}

      {open && view === "cal" && (
        <div style={s.calWrap} onClick={(e) => e.stopPropagation()}>
          <RangeCalendar
            initialStart={parseIso(customStart)}
            initialEnd={parseIso(customEnd)}
            onApply={(start, end) => { onSelectCustom(toIso(start), toIso(end)); setOpen(false); }}
          />
        </div>
      )}
    </span>
  );
}
