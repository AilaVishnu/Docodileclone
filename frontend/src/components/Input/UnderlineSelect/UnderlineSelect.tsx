import React, { useState, useRef, useEffect } from "react";
import { colors, fonts, radii } from "../../../styles/theme";

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
};

export function UnderlineSelect({
  options,
  value,
  onChange,
  placeholder = "Select...",
  fontSize = fonts.size.h4,
}: UnderlineSelectProps) {
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
        }}
      >
        <span
          style={{
            fontFamily: fonts.family.secondary,
            fontSize,
            fontWeight: 400,
            color: colors.neutral900,
            textDecoration: "underline",
            textUnderlineOffset: "4px",
          }}
        >
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <svg
          width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={colors.neutral600}
          strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
          style={{ transform: isOpen ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 160ms", flexShrink: 0 }}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </span>

      {isOpen && (
        <div
          style={{
            position: "absolute",
            top: "calc(100% + 8px)",
            left: 0,
            backgroundColor: colors.neutral100,
            border: `1px solid ${colors.neutral200}`,
            borderRadius: radii.m,
            boxShadow: "2px 2px 12px 0px rgba(0,0,0,0.08)",
            zIndex: 1000,
            minWidth: "200px",
            maxHeight: "260px",
            overflowY: "auto",
            padding: 4,
            display: "flex",
            flexDirection: "column",
            gap: 2,
          }}
        >
          {normalizedOptions.map((option) => {
            const isSelected = option.value === value;
            return (
              <div
                key={option.value}
                onClick={() => {
                  onChange(option.value);
                  setIsOpen(false);
                }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 8,
                  padding: "8px 12px",
                  cursor: "pointer",
                  borderRadius: radii.s,
                  fontFamily: fonts.family.primary,
                  fontSize: fonts.size.m,
                  color: colors.neutral900,
                  fontWeight: isSelected ? 600 : 400,
                  backgroundColor: isSelected ? colors.active.shade100 : "transparent",
                  transition: "background-color 0.15s",
                }}
                onMouseEnter={(e) => {
                  if (!isSelected) e.currentTarget.style.backgroundColor = colors.neutral150;
                }}
                onMouseLeave={(e) => {
                  if (!isSelected) e.currentTarget.style.backgroundColor = "transparent";
                }}
              >
                <span>{option.label}</span>
                {isSelected && (
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={colors.active.shade700}
                    strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
