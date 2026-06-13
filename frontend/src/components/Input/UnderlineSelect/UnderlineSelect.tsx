import React, { useState, useRef, useEffect } from "react";
import { colors, fonts, radii, shadows, zIndex } from "../../../styles/theme";
import { ChevronDown } from "../../icons/ChevronDown";

// ─────────────────────────────────────────────────────────────────────────────
// UnderlineSelect — an inline "chip" dropdown: a compact outline pill
// (primary400 border) with a label + chevron, opening the canonical menu. Used
// inline inside titles (e.g. the booking header "Book an appointment for […]").
//
// Named UnderlineSelect for history; the old serif "underline" variant was
// removed (it was unused everywhere). Chevron is state-driven + menu items use
// control text, to stay consistent with Select / SuggestionInput.
// ─────────────────────────────────────────────────────────────────────────────
type ChipOption = { label: string; value: string };

type UnderlineSelectProps = {
  options: (string | ChipOption)[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  /** Trigger label size. Defaults to the control/button size (--btn-fs). */
  fontSize?: string;
};

export function UnderlineSelect({
  options,
  value,
  onChange,
  placeholder = "Select...",
  fontSize = "var(--btn-fs)",
}: UnderlineSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) setIsOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  const opts: ChipOption[] = options.map((o) => (typeof o === "string" ? { label: o, value: o } : o));
  const selected = opts.find((o) => o.value === value);

  return (
    <div ref={containerRef} style={{ position: "relative", display: "inline-block" }}>
      <span
        onClick={() => setIsOpen(!isOpen)}
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 6,
          cursor: "pointer",
          userSelect: "none",
          backgroundColor: "transparent",
          border: `1px solid ${colors.primary400}`,
          borderRadius: radii.m,
          padding: "4px 12px",
        }}
      >
        <span style={{ fontFamily: fonts.family.primary, fontSize, fontWeight: fonts.weight.semibold, color: colors.neutral900 }}>
          {selected ? selected.label : placeholder}
        </span>
        <ChevronDown open={isOpen} color={isOpen ? colors.neutral900 : colors.neutral300} />
      </span>

      {isOpen && (
        <div
          style={{
            // Canonical menu surface (shared with Select / SuggestionInput).
            position: "absolute",
            top: "calc(100% + 8px)",
            left: 0,
            backgroundColor: colors.neutral100,
            border: `1px solid ${colors.primary300}`,
            borderRadius: radii.m,
            boxShadow: shadows.menu,
            zIndex: zIndex.popover,
            minWidth: "200px",
            maxHeight: "260px",
            overflowY: "auto",
            padding: "12px 8px",
            display: "flex",
            flexDirection: "column",
            gap: "4px",
          }}
        >
          {opts.map((o) => (
            <div
              key={o.value}
              onClick={() => {
                onChange(o.value);
                setIsOpen(false);
              }}
              style={{
                padding: "10px 16px",
                cursor: "pointer",
                borderRadius: radii.m,
                fontFamily: fonts.family.primary,
                fontSize: fonts.control.sm,
                color: colors.neutral900,
                backgroundColor: "transparent",
                transition: "background-color 0.15s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = colors.active.shade100;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "transparent";
              }}
            >
              {o.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
