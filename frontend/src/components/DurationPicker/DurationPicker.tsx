import React, { CSSProperties, useEffect, useRef, useState } from "react";
import { colors, fonts, radii, spacing, strokes } from "../../styles/theme";

const UNITS = ["Days", "Weeks", "Months", "Years"];

const STATIC_SUGGESTIONS = [
  "3 Days", "5 Days", "7 Days", "10 Days", "14 Days",
  "1 Month", "2 Months", "3 Months",
  "As directed",
];

function buildSuggestions(value: string): string[] {
  const trimmed = value.trim();

  // Pure number → generate "N Days / N Weeks / N Months / N Years"
  const numMatch = trimmed.match(/^(\d+\.?\d*|\d*\.?\d+)$/);
  if (numMatch) {
    const num = parseFloat(numMatch[1]);
    if (!isNaN(num)) {
      return UNITS.map((u) => {
        // singular for 1
        const unit = num === 1 ? u.replace(/s$/, "") : u;
        return `${num} ${unit}`;
      });
    }
  }

  if (!trimmed) return STATIC_SUGGESTIONS;
  return STATIC_SUGGESTIONS.filter((s) =>
    s.toLowerCase().includes(trimmed.toLowerCase())
  );
}

type Props = { value: string; onChange: (v: string) => void };

export function DurationPicker({ value, onChange }: Props) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  const suggestions = buildSuggestions(value);

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
          placeholder="Duration"
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
    border: `${strokes.xs} solid ${colors.primary300}`,
    borderRadius: radii.m,
    backgroundColor: colors.neutral100,
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
    minWidth: 160,
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
