import React, { useState, useRef, useEffect } from "react";
import { colors, fonts } from "../../../styles/theme";

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
        onMouseEnter={() => {}}
        onMouseLeave={() => {}}
        style={{
          fontFamily: fonts.family.secondary,
          fontSize,
          fontWeight: 400,
          color: colors.neutral900,
          textDecoration: "underline",
          textUnderlineOffset: "4px",
          cursor: "pointer",
          userSelect: "none",
          transition: "opacity 0.15s",
        }}
      >
        {selectedOption ? selectedOption.label : placeholder}
      </span>

      {isOpen && (
        <div
          style={{
            // Unified menu spec — see TopNav.dropdown, actionMenu, StatusDropdown.
            position: "absolute",
            top: "calc(100% + 8px)",
            left: "50%",
            transform: "translateX(-50%)",
            backgroundColor: colors.neutral100,
            borderRadius: "12px",
            boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
            zIndex: 1000,
            minWidth: "200px",
            maxHeight: "240px",
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
                borderRadius: "8px",
                fontFamily: fonts.family.primary,
                fontSize: fonts.size.s,
                color: colors.neutral900,
                backgroundColor: "transparent",
                transition: "background-color 0.15s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = colors.active.shade200;
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
