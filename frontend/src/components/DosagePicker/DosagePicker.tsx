import React, { CSSProperties, useEffect, useRef, useState } from "react";
import { colors, fonts, radii, spacing, strokes } from "../../styles/theme";

type MedicineType =
  | "tablet" | "capsule" | "syrup" | "drops" | "cream"
  | "injection" | "sachet" | "inhaler" | "insulin" | "unknown";

function detectType(medicineName: string, genericName: string): MedicineType {
  const s = `${medicineName} ${genericName}`.toLowerCase();
  if (/insulin/.test(s)) return "insulin";
  if (/injec|inj\b|vial|ampoule/.test(s)) return "injection";
  if (/syrup|suspension|solution|linctus|elixir/.test(s)) return "syrup";
  if (/drop|eye\s*drop|ear\s*drop|nasal\s*drop/.test(s)) return "drops";
  if (/cream|ointment|gel|lotion|balm/.test(s)) return "cream";
  if (/inhaler|puff|rotacap|turbuhaler|accuhaler/.test(s)) return "inhaler";
  if (/sachet|powder|granule/.test(s)) return "sachet";
  if (/capsule|cap\b/.test(s)) return "capsule";
  if (/tablet|tab\b/.test(s)) return "tablet";
  return "unknown";
}

// Primary units per medicine type used for dynamic number suggestions.
const TYPE_UNITS: Record<MedicineType, string[]> = {
  tablet:    ["Tablet"],
  capsule:   ["Capsule"],
  syrup:     ["ml", "Teaspoon (5ml)", "Tablespoon (15ml)"],
  drops:     ["Drop"],
  cream:     [],
  injection: ["ml"],
  sachet:    ["Sachet"],
  inhaler:   ["Puff", "Rotacap"],
  insulin:   ["Unit"],
  unknown:   ["Tablet", "Capsule", "ml"],
};

// Singular → plural map for common units.
const PLURALS: Record<string, string> = {
  Tablet:    "Tablets",
  Capsule:   "Capsules",
  Drop:      "Drops",
  Puff:      "Puffs",
  Unit:      "Units",
  Sachet:    "Sachets",
  Teaspoon:  "Teaspoons",
  Tablespoon: "Tablespoons",
  Rotacap:   "Rotacaps",
  Scoop:     "Scoops",
};

function formatDose(num: number, unit: string): string {
  // Units that don't pluralise (ml, etc.)
  const base = unit.split(" ")[0]; // e.g. "Teaspoon" from "Teaspoon (5ml)"
  const plural = PLURALS[base];
  const displayUnit = num === 1 || !plural ? unit : unit.replace(base, plural);
  return `${num} ${displayUnit}`;
}

// Static fallback suggestions when the input is empty.
const STATIC_SUGGESTIONS: Record<MedicineType, string[]> = {
  tablet:    ["1 Tablet", "2 Tablets", "3 Tablets", "1/2 Tablet"],
  capsule:   ["1 Capsule", "2 Capsules"],
  syrup:     ["5 ml", "10 ml", "15 ml", "1 Teaspoon (5ml)", "1 Tablespoon (15ml)"],
  drops:     ["1 Drop", "2 Drops", "3 Drops", "4 Drops", "5 Drops"],
  cream:     ["Apply thin layer", "Pea-sized amount", "As directed"],
  injection: ["0.5 ml", "1 ml", "2 ml", "5 ml"],
  sachet:    ["1 Sachet", "2 Sachets"],
  inhaler:   ["1 Puff", "2 Puffs", "1 Rotacap"],
  insulin:   ["4 Units", "6 Units", "8 Units", "10 Units", "16 Units", "20 Units"],
  unknown:   ["1 Tablet", "2 Tablets", "1 Capsule", "5 ml", "10 ml"],
};

function buildSuggestions(value: string, type: MedicineType): string[] {
  const trimmed = value.trim();

  // If value is a pure number (integers, decimals, fractions like 0.5), generate
  // dynamic suggestions for that number + all units of this medicine type.
  const numMatch = trimmed.match(/^(\d+\.?\d*|\d*\.?\d+)$/);
  if (numMatch) {
    const num = parseFloat(numMatch[1]);
    if (!isNaN(num)) {
      const units = TYPE_UNITS[type];
      if (units.length > 0) return units.map((u) => formatDose(num, u));
    }
  }

  // Otherwise filter static suggestions by what's typed.
  if (!trimmed) return STATIC_SUGGESTIONS[type];
  return STATIC_SUGGESTIONS[type].filter((s) =>
    s.toLowerCase().includes(trimmed.toLowerCase())
  );
}

type Props = {
  value: string;
  onChange: (v: string) => void;
  medicineName?: string;
  genericName?: string;
};

export function DosagePicker({ value, onChange, medicineName = "", genericName = "" }: Props) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  const type = detectType(medicineName, genericName);
  const suggestions = buildSuggestions(value, type);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const clear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange("");
  };

  return (
    <div ref={wrapRef} style={styles.wrap}>
      <div style={styles.inputWrap}>
        <input
          style={styles.input}
          placeholder="Dosage"
          value={value}
          onChange={(e) => { onChange(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
        />
        {value && (
          <button type="button" style={styles.clearBtn} onMouseDown={clear} tabIndex={-1}>
            ×
          </button>
        )}
      </div>

      {open && suggestions.length > 0 && (
        <div style={styles.menu} role="listbox">
          {suggestions.map((opt) => (
            <button
              key={opt}
              type="button"
              role="option"
              aria-selected={value === opt}
              style={{ ...styles.menuItem, ...(value === opt ? styles.menuItemActive : {}) }}
              onMouseDown={(e) => { e.preventDefault(); onChange(opt); setOpen(false); }}
              onMouseEnter={(e) => { if (value !== opt) e.currentTarget.style.backgroundColor = colors.primary100; }}
              onMouseLeave={(e) => { if (value !== opt) e.currentTarget.style.backgroundColor = "transparent"; }}
            >
              {opt}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

const styles: Record<string, CSSProperties> = {
  wrap: { position: "relative", minWidth: 0, width: "100%" },
  inputWrap: {
    display: "flex",
    alignItems: "center",
    height: 28,
    borderRadius: radii.m,
    backgroundColor: colors.primary100,
    padding: `0 ${spacing["2xs"]}`,
    gap: spacing["3xs"],
  },
  input: {
    flex: 1,
    minWidth: 0,
    border: "none",
    outline: "none",
    backgroundColor: "transparent",
    fontSize: fonts.size.s,
    lineHeight: fonts.lineHeight.s,
    fontFamily: fonts.family.primary,
    color: colors.neutral900,
    textAlign: "center" as const,
  },
  clearBtn: {
    flexShrink: 0,
    width: 16,
    height: 16,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 14,
    lineHeight: 1,
    color: colors.neutral500,
    background: "transparent",
    border: "none",
    cursor: "pointer",
    padding: 0,
  },
  menu: {
    position: "absolute" as const,
    top: "calc(100% + 4px)",
    left: 0,
    minWidth: 180,
    backgroundColor: colors.neutral100,
    border: `${strokes.xs} solid ${colors.primary300}`,
    borderRadius: radii.m,
    padding: spacing["2xs"],
    boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
    zIndex: 1200,
    display: "flex",
    flexDirection: "column",
    gap: 2,
    maxHeight: 200,
    overflowY: "auto" as const,
  },
  menuItem: {
    width: "100%",
    textAlign: "left" as const,
    padding: `${spacing.xs} ${spacing.s}`,
    fontSize: fonts.size.s,
    lineHeight: fonts.lineHeight.s,
    fontFamily: fonts.family.primary,
    color: colors.neutral900,
    background: "transparent",
    border: "none",
    cursor: "pointer",
    borderRadius: radii.xs,
    transition: "background-color 0.1s ease",
  },
  menuItemActive: {
    backgroundColor: colors.primary100,
    color: colors.primary700,
  },
};
