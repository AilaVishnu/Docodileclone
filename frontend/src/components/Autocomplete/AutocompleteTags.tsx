import React, { CSSProperties, useEffect, useMemo, useRef, useState } from "react";
import { useSuggestions } from "../../hooks/useSuggestions";
import { colors, fonts, radii, spacing, strokes } from "../../styles/theme";

// ─────────────────────────────────────────────────────────────────────────────
// Multi-tag variant of Autocomplete. Selecting a suggestion (or pressing
// Enter / "," on free text) adds the value as a chip; chips can be removed
// via ✕ or by Backspacing at an empty input. Used by the four History
// fields where a patient may have several conditions, mirroring the chip
// picker on the BuildYourClinic specialty row.
//
// `value` is an array of trimmed tag strings; the host is responsible for
// (de)serializing to whatever string format the backend column expects.
// ─────────────────────────────────────────────────────────────────────────────

type AutocompleteTagsProps = {
  field: string;
  value: string[];
  onChange: (next: string[]) => void;
  placeholder?: string;
  ariaLabel?: string;
  /** Style applied to the outer chip + input container. */
  containerStyle?: CSSProperties;
};

export function AutocompleteTags({
  field,
  value,
  onChange,
  placeholder,
  ariaLabel,
  containerStyle,
}: AutocompleteTagsProps) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [input, setInput] = useState("");
  const [open, setOpen] = useState(false);
  const { data: suggestions, error } = useSuggestions(field, input);

  // Hide already-selected tags from the dropdown.
  const lowerSelected = useMemo(
    () => new Set(value.map((v) => v.toLowerCase())),
    [value]
  );
  const filtered = suggestions.filter(
    (s) => !lowerSelected.has(s.value.toLowerCase())
  );

  const addTag = (raw: string) => {
    const trimmed = raw.trim();
    if (!trimmed) return;
    if (lowerSelected.has(trimmed.toLowerCase())) return;
    onChange([...value, trimmed]);
    setInput("");
    inputRef.current?.focus();
  };

  const removeTag = (idx: number) => {
    onChange(value.filter((_, i) => i !== idx));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && input.trim()) {
      e.preventDefault();
      addTag(input);
    } else if (e.key === ",") {
      e.preventDefault();
      addTag(input);
    } else if (e.key === "Backspace" && !input && value.length > 0) {
      removeTag(value.length - 1);
    }
  };

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

  return (
    <div ref={wrapRef} style={styles.wrap}>
      <div
        style={{ ...styles.tagBox, ...containerStyle }}
        onClick={() => inputRef.current?.focus()}
      >
        {value.map((tag, i) => (
          <span key={`${tag}-${i}`} style={styles.tag}>
            {tag}
            <button
              type="button"
              style={styles.tagRemove}
              onClick={(e) => {
                e.stopPropagation();
                removeTag(i);
              }}
              aria-label={`Remove ${tag}`}
            >
              ✕
            </button>
          </span>
        ))}
        <input
          ref={inputRef}
          style={styles.input}
          value={input}
          onChange={(e) => {
            setInput(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={value.length === 0 ? placeholder : ""}
          aria-label={ariaLabel}
          aria-autocomplete="list"
          aria-expanded={open}
        />
      </div>

      {open && filtered.length > 0 && (
        <div style={styles.menu}>
          {filtered.map((s) => (
            <button
              key={s.id}
              type="button"
              style={styles.item}
              onMouseDown={(e) => {
                e.preventDefault();
                addTag(s.value);
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
    </div>
  );
}

const styles: Record<string, CSSProperties> = {
  wrap: {
    position: "relative",
    width: "100%",
  },
  // Chip container — looks like the History input it replaces (cream bg,
  // rounded), but flex-wraps to fit any number of chips and the typing input.
  tagBox: {
    display: "flex",
    flexWrap: "wrap",
    alignItems: "center",
    gap: 6,
    minHeight: 36,
    padding: spacing.xs,
    backgroundColor: colors.primary100,
    borderRadius: radii.m,
    cursor: "text",
    boxSizing: "border-box",
  },
  // Chip — sage 300 pill with white label + ✕, mirrors the Build Your Clinic
  // specialty chip styling (ClinicInfoCard.styles.ts `tag`).
  tag: {
    display: "inline-flex",
    alignItems: "center",
    gap: 4,
    backgroundColor: colors.secondary300,
    color: colors.neutral100,
    borderRadius: radii.full,
    padding: "3px 10px",
    fontSize: fonts.size.xs,
    fontFamily: fonts.family.primary,
    fontWeight: fonts.weight.medium,
    whiteSpace: "nowrap" as const,
  },
  tagRemove: {
    background: "none",
    border: "none",
    color: colors.neutral100,
    cursor: "pointer",
    padding: 0,
    fontSize: fonts.size.xs,
    lineHeight: 1,
    display: "flex",
    alignItems: "center",
  },
  input: {
    flex: 1,
    minWidth: 80,
    border: "none",
    outline: "none",
    background: "transparent",
    fontFamily: fonts.family.primary,
    fontSize: fonts.size.s,
    lineHeight: fonts.lineHeight.s,
    color: colors.neutral900,
    padding: 0,
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
    boxShadow: "0 4px 16px rgba(0, 0, 0, 0.08)",
    zIndex: 1000,
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
  errorState: {
    padding: `${spacing.xs} ${spacing.s}`,
    fontFamily: fonts.family.primary,
    fontSize: fonts.size.xs,
    lineHeight: fonts.lineHeight.xs,
    color: colors.red200,
  },
};
