import React, { CSSProperties, useEffect, useRef, useState } from "react";
import { colors, fonts, radii, spacing, strokes } from "../../styles/theme";
import { ReactComponent as ChevronIcon } from "../../assets/icons/chevron-up.svg";

const OPTIONS = [
  "Before Food",
  "After Food",
  "Before Breakfast",
  "After Breakfast",
  "Before Lunch",
  "After Lunch",
  "Before Dinner",
  "After Dinner",
  "Empty Stomach",
  "Bed Time",
  "SoS",
];

type Props = { value: string; onChange: (v: string) => void };

export function WhenPicker({ value, onChange }: Props) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  return (
    <div ref={wrapRef} style={styles.wrap}>
      <div
        role="button"
        style={styles.trigger}
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span style={{ ...styles.triggerText, ...(value ? { color: colors.neutral900 } : {}) }}>
          {value || "When"}
        </span>
        <span style={styles.chevron}>
          <ChevronIcon
            width={16}
            height={16}
            style={{ transform: open ? "rotate(0deg)" : "rotate(180deg)" }}
          />
        </span>
      </div>

      {open && (
        <div style={styles.menu} role="listbox">
          {OPTIONS.map((opt) => (
            <button
              key={opt}
              type="button"
              role="option"
              aria-selected={value === opt}
              style={{ ...styles.menuItem, ...(value === opt ? styles.menuItemActive : {}) }}
              onMouseDown={(e) => { e.preventDefault(); onChange(value === opt ? "" : opt); setOpen(false); }}
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
  trigger: {
    position: "relative" as const,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    height: 40,
    borderRadius: radii.m,
    overflow: "hidden",
    cursor: "pointer",
    backgroundColor: colors.primary100,
    padding: `0 ${spacing.m}`,
  },
  triggerText: {
    fontSize: fonts.control.sm,
    lineHeight: fonts.lineHeight.s,
    fontFamily: fonts.family.primary,
    color: colors.neutral400,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap" as const,
    textAlign: "center" as const,
  },
  chevron: {
    position: "absolute" as const,
    right: spacing.xs,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    color: colors.neutral700,
    lineHeight: 1,
  },
  menu: {
    position: "absolute" as const,
    top: "calc(100% + 4px)",
    left: 0,
    minWidth: 200,
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
