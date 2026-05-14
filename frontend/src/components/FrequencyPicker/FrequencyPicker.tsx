import React, { CSSProperties, useEffect, useRef, useState } from "react";
import { colors, fonts, radii, spacing, strokes } from "../../styles/theme";

const ALL_OPTIONS = [
  "1-0-0",
  "0-0-1",
  "1-0-1",
  "1-1-1",
  "0-1-0",
  "Once a day",
  "Twice a day",
  "Thrice a day",
  "Once a week",
  "Twice a week",
  "Alternate days",
  "Every 6h",
  "Every 8h",
  "Every 12h",
  "Once in 10 days",
  "Once in every 15 days",
  "Once in 20 days",
  "Once in 45 days",
  "Once a month",
  "Once in 2 months",
  "Once in 3 months",
];

type Props = { value: string; onChange: (v: string) => void };

export function FrequencyPicker({ value, onChange }: Props) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const filtered = value.trim()
    ? ALL_OPTIONS.filter((o) => o.toLowerCase().includes(value.toLowerCase()))
    : ALL_OPTIONS;

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const select = (opt: string) => {
    onChange(opt);
    setOpen(false);
  };

  const clear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange("");
    inputRef.current?.focus();
  };

  return (
    <div ref={wrapRef} style={styles.wrap}>
      <div style={styles.inputWrap}>
        <input
          ref={inputRef}
          style={styles.input}
          placeholder="e.g 1-0-1"
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

      {open && filtered.length > 0 && (
        <div style={styles.menu} role="listbox">
          {filtered.map((opt) => (
            <button
              key={opt}
              type="button"
              role="option"
              aria-selected={value === opt}
              style={{ ...styles.menuItem, ...(value === opt ? styles.menuItemActive : {}) }}
              onMouseDown={(e) => { e.preventDefault(); select(opt); }}
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
  wrap: {
    position: "relative",
    minWidth: 0,
    width: "100%",
  },
  inputWrap: {
    display: "flex",
    alignItems: "center",
    height: 40,
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
    textAlign: "center" as const,
    backgroundColor: "transparent",
    fontSize: fonts.control.sm,
    lineHeight: fonts.lineHeight.s,
    fontFamily: fonts.family.primary,
    color: colors.neutral900,
    fontVariantNumeric: "tabular-nums" as const,
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
    maxHeight: 220,
    overflowY: "auto" as const,
  },
  menuItem: {
    width: "100%",
    textAlign: "left" as const,
    padding: `${spacing.xs} ${spacing.s}`,
    fontSize: fonts.control.sm,
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
