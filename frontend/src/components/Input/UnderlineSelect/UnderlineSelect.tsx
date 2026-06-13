import React, { useState, useRef, useEffect } from "react";
import { colors, fonts, radii, shadows, zIndex } from "../../../styles/theme";
import { ChevronDown } from "../../icons/ChevronDown";

type UnderlineSelectOption = {
  label: string;
  value: string;
};

type UnderlineSelectProps = {
  options: (string | UnderlineSelectOption)[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  fontSize?: string;
  /**
   * "underline" (default): serif label with an underline.
   * "chip": sans label inside an outline pill — matches the header date chips
   * in the queues. Same chevron either way.
   */
  variant?: "underline" | "chip";
};

export function UnderlineSelect({
  options,
  value,
  onChange,
  placeholder = "Select...",
  fontSize = fonts.size.h4,
  variant = "underline",
}: UnderlineSelectProps) {
  const isChip = variant === "chip";
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const normalizedOptions: UnderlineSelectOption[] = options.map((opt) =>
    typeof opt === "string" ? { label: opt, value: opt } : opt
  );

  const selectedOption = normalizedOptions.find((opt) => opt.value === value);

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
          ...(isChip
            ? {
                backgroundColor: "transparent",
                border: `1px solid ${colors.primary400}`,
                borderRadius: radii.m,
                padding: "4px 12px",
              }
            : {}),
        }}
      >
        <span
          style={{
            fontFamily: isChip ? fonts.family.primary : fonts.family.secondary,
            fontSize,
            fontWeight: isChip ? fonts.weight.semibold : 400,
            color: colors.neutral900,
            ...(isChip ? {} : { textDecoration: "underline", textUnderlineOffset: "4px" }),
          }}
        >
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown open={isOpen} />
      </span>

      {isOpen && (
        <div
          style={{
            // Unified menu spec — see TopNav.dropdown, actionMenu, StatusDropdown.
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
          {normalizedOptions.map((option) => (
            <div
              key={option.value}
              onClick={() => {
                onChange(option.value);
                setIsOpen(false);
              }}
              style={{
                padding: "10px 16px",
                cursor: "pointer",
                borderRadius: radii.m,
                fontFamily: fonts.family.primary,
                fontSize: fonts.size.s,
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
              {option.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
