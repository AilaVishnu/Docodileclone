import React, { CSSProperties, useEffect, useRef, useState } from "react";
import { useSuggestions } from "../../hooks/useSuggestions";
import { colors, fonts, radii, spacing, strokes, shadows, zIndex } from "../../styles/theme";

// ─────────────────────────────────────────────────────────────────────────────
// Generic per-clinic autocomplete input. Pulls suggestions from the backend
// via `useSuggestions(field, query)`. Shows the top items on focus (empty
// query) and prefix-filters as the user types. Selecting an item fills the
// input and fires onChange.
// ─────────────────────────────────────────────────────────────────────────────

type AutocompleteProps = {
  /** Suggestion bucket name on the server, e.g. "family_history". */
  field: string;
  value: string;
  onChange: (next: string) => void;
  placeholder?: string;
  inputStyle?: CSSProperties;
  /** Optional aria-label on the input. */
  ariaLabel?: string;
  /** Render as a multi-line textarea instead of single-line input. */
  multiline?: boolean;
  /** Trailing slot rendered after the input (e.g. mic / dictate icons). */
  trailingSlot?: React.ReactNode;
};

export function Autocomplete({
  field,
  value,
  onChange,
  placeholder,
  inputStyle,
  ariaLabel,
  multiline = false,
  trailingSlot,
}: AutocompleteProps) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const { data: suggestions, loading, error } = useSuggestions(field, value);

  // Close on outside click.
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const handleSelect = (s: string) => {
    onChange(s);
    setOpen(false);
  };

  const commonProps = {
    value,
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      onChange(e.target.value);
      setOpen(true);
    },
    onFocus: () => setOpen(true),
    placeholder,
    "aria-label": ariaLabel,
    "aria-expanded": open,
    "aria-autocomplete": "list" as const,
  };

  return (
    <div ref={wrapRef} style={styles.wrap}>
      {multiline ? (
        <textarea style={{ ...styles.input, ...inputStyle }} {...commonProps} />
      ) : (
        <input style={{ ...styles.input, ...inputStyle }} {...commonProps} />
      )}
      {trailingSlot}
      {open && suggestions.length > 0 && (
        <div style={styles.menu}>
          {suggestions.map((s) => (
            <button
              key={s.id}
              type="button"
              style={styles.item}
              onMouseDown={(e) => {
                // Fire before the input blurs so the click registers.
                e.preventDefault();
                handleSelect(s.value);
              }}
            >
              {s.value}
            </button>
          ))}
        </div>
      )}
      {open && error && (
        <div style={styles.menu}>
          <div style={styles.errorState}>API error: {error}</div>
        </div>
      )}
      {open && !error && !loading && suggestions.length === 0 && value.trim() !== "" && (
        <div style={styles.menu}>
          <div style={styles.empty}>No matches — your entry will be saved as new</div>
        </div>
      )}
    </div>
  );
}

const styles: Record<string, CSSProperties> = {
  wrap: {
    position: "relative",
    width: "100%",
    // Flex row so a `trailingSlot` (e.g. mic + rewind icons) sits to the
    // right of the input instead of wrapping below it. The dropdown menu
    // is `position: absolute` so it's unaffected by the flex layout.
    display: "flex",
    alignItems: "center",
  },
  input: {
    // No explicit width — caller-provided `inputStyle` decides whether the
    // input fills the wrap (`width: 100%`) or shares space with a trailing
    // slot (`flex: 1`). Keep box-sizing predictable for both modes.
    boxSizing: "border-box",
  },
  menu: {
    position: "absolute",
    top: "calc(100% + 4px)",
    left: 0,
    right: 0,
    minWidth: 200,
    backgroundColor: colors.neutral100,
    border: `${strokes.xs} solid ${colors.primary300}`,
    borderRadius: radii.m,
    padding: spacing["2xs"],
    display: "flex",
    flexDirection: "column",
    boxShadow: shadows.menu,
    zIndex: zIndex.popover,
    maxHeight: "min(50vh, 480px)",
    overflowY: "auto",
  },
  item: {
    display: "block",
    width: "100%",
    textAlign: "left",
    padding: `${spacing.xs} ${spacing.s}`,
    background: "transparent",
    border: "none",
    cursor: "pointer",
    fontFamily: fonts.family.primary,
    fontSize: fonts.size.s,
    lineHeight: fonts.lineHeight.s,
    color: colors.neutral900,
    borderRadius: radii.xs,
  },
  empty: {
    padding: `${spacing.xs} ${spacing.s}`,
    fontFamily: fonts.family.primary,
    fontSize: fonts.size.xs,
    lineHeight: fonts.lineHeight.xs,
    color: colors.neutral500,
    fontStyle: "italic",
  },
  errorState: {
    padding: `${spacing.xs} ${spacing.s}`,
    fontFamily: fonts.family.primary,
    fontSize: fonts.size.xs,
    lineHeight: fonts.lineHeight.xs,
    color: colors.red200,
  },
};
