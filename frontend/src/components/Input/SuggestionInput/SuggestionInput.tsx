import React, { CSSProperties, useEffect, useRef, useState } from "react";
import { colors, fonts, radii, shadows, spacing, strokes, zIndex } from "../../../styles/theme";
import { ChevronDown } from "../../icons/ChevronDown";
import { ClearButton } from "../ClearButton";

// ─────────────────────────────────────────────────────────────────────────────
// SuggestionInput — the shared "editable trigger + filtered suggestion menu +
// outside-click-to-close" combobox primitive behind every dosing picker
// (Duration / Frequency / FrequencyInterval / When). Filled-box look (cream
// primary100, borderless, radii.m) matching <Field variant="box" fill="filled">,
// over the canonical popover surface (primary300 border, shadows.menu, popover
// z-index, primary100 hover, primary100+primary700 active).
//
// Two shapes, selected by `chevron`:
//   • chevron = false (default) — an EDITABLE input you type into. The menu
//     opens on focus/typing and filters `suggestions` by case-insensitive
//     substring of the current value. Clicking a suggestion sets it. A clear
//     (×) button appears when there's a value. (Duration / Frequency.)
//   • chevron = true — a READ-ONLY trigger that shows the value (or
//     placeholder), with a chevron that rotates on open. The menu lists every
//     suggestion (no filtering); clicking the active one again clears it
//     (toggle). (FrequencyInterval / When.)
//
// `filter` (default true) lets a caller that has ALREADY computed/filtered the
// list (e.g. DurationPicker's number → "N Days/Weeks…" generation) pass it
// through verbatim.
// ─────────────────────────────────────────────────────────────────────────────
type SuggestionInputProps = {
  value: string;
  onChange: (v: string) => void;
  suggestions: string[];
  placeholder?: string;
  /** Read-only trigger + rotating chevron (vs. editable input). Default false. */
  chevron?: boolean;
  /** Substring-filter `suggestions` by the current value. Default true. */
  filter?: boolean;
  inputMode?: React.HTMLAttributes<HTMLInputElement>["inputMode"];
  ariaLabel?: string;
  style?: CSSProperties;
};

export function SuggestionInput({
  value,
  onChange,
  suggestions,
  placeholder,
  chevron = false,
  filter = true,
  inputMode,
  ariaLabel,
  style,
}: SuggestionInputProps) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Editable mode filters by the current value; the read-only (chevron) trigger
  // always lists the full set. `filter={false}` opts a caller out (pre-built list).
  const visible =
    filter && !chevron && value.trim()
      ? suggestions.filter((s) => s.toLowerCase().includes(value.toLowerCase()))
      : suggestions;

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  return (
    <div ref={wrapRef} style={{ ...styles.wrap, ...style }}>
      {chevron ? (
        <div
          role="button"
          style={styles.trigger}
          onClick={() => setOpen((v) => !v)}
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-label={ariaLabel}
        >
          <span style={{ ...styles.triggerText, ...(value ? { color: colors.neutral900 } : {}) }}>
            {value || placeholder}
          </span>
          <span style={styles.chevron}>
            <ChevronDown open={open} size={16} />
          </span>
        </div>
      ) : (
        <div style={styles.inputWrap}>
          <input
            ref={inputRef}
            style={styles.input}
            placeholder={placeholder}
            value={value}
            inputMode={inputMode}
            aria-label={ariaLabel}
            onChange={(e) => { onChange(e.target.value); setOpen(true); }}
            onFocus={() => setOpen(true)}
          />
          {value && (
            <ClearButton onClear={() => { onChange(""); inputRef.current?.focus(); }} />
          )}
        </div>
      )}

      {open && visible.length > 0 && (
        <div style={styles.menu} role="listbox">
          {visible.map((opt) => (
            <button
              key={opt}
              type="button"
              role="option"
              aria-selected={value === opt}
              style={{ ...styles.menuItem, ...(value === opt ? styles.menuItemActive : {}) }}
              onMouseDown={(e) => {
                e.preventDefault();
                // Read-only trigger toggles the active option off; editable
                // input just commits the chosen text.
                onChange(chevron && value === opt ? "" : opt);
                setOpen(false);
              }}
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
  // Editable (Duration / Frequency) — filled cream box, centered text.
  inputWrap: {
    display: "flex",
    alignItems: "center",
    height: "var(--input-h, 40px)",
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
    fontSize: fonts.control.sm,
    lineHeight: fonts.lineHeight.s,
    fontFamily: fonts.family.primary,
    color: colors.neutral900,
    textAlign: "center" as const,
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
  // Read-only (FrequencyInterval / When) — filled cream box + rotating chevron.
  trigger: {
    position: "relative" as const,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    height: "var(--input-h, 40px)",
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
  // Canonical popover surface — shared by both shapes.
  menu: {
    position: "absolute" as const,
    top: "calc(100% + 4px)",
    left: 0,
    minWidth: 180,
    backgroundColor: colors.neutral100,
    border: `${strokes.xs} solid ${colors.primary300}`,
    borderRadius: radii.m,
    padding: spacing["2xs"],
    boxShadow: shadows.menu,
    zIndex: zIndex.popover,
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
