import React, { useState, useRef, useEffect } from "react";
import { styles } from "./Select.styles";
import { colors } from "../../../styles/theme";

type SelectOption = {
  label: string;
  value: string;
};

type SelectProps = {
  options: (string | SelectOption)[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  iconLeft?: React.ReactNode;
  error?: boolean;
};

export function Select({
  options,
  value,
  onChange,
  placeholder = "Select...",
  iconLeft,
  error = false,
}: SelectProps) {
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

  const normalizedOptions: SelectOption[] = options.map((opt) =>
    typeof opt === "string" ? { label: opt, value: opt } : opt
  );

  const selectedOption = normalizedOptions.find((opt) => opt.value === value);

  return (
    <div 
      style={{ 
        display: "flex", 
        alignItems: "center", 
        gap: "8px", 
        paddingLeft: "8px", // Align with TextInput padding
        width: "100%", 
        position: "relative" 
      }}
    >
      {iconLeft && <span style={{ display: "flex", alignItems: "center", opacity: 0.8 }}>{iconLeft}</span>}
      
      <div
        ref={containerRef}
        style={{
          ...styles.container,
          flex: 1,
          border: selectedOption ? `1.5px solid ${colors.neutral900}` : `1px solid ${colors.neutral300}`,
          ...(error ? styles.errorContainer : {})
        }}
        onClick={() => setIsOpen(!isOpen)}
      >
        <div style={styles.select}>
          {selectedOption ? (
            selectedOption.label
          ) : (
            <span style={{ opacity: 0.5 }}>{placeholder}</span>
          )}
        </div>

        <div style={{ ...styles.arrow, transform: isOpen ? "rotate(180deg)" : "rotate(0)" }}>
          <svg width="12" height="8" viewBox="0 0 12 8" fill="none">
            <path d="M1 1.5L6 6.5L11 1.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>

        {isOpen && (
          <div className="select-dropdown-scroll" style={{
            position: "absolute",
            top: "calc(100% + 4px)",
            left: 0,
            right: 0,
            backgroundColor: "#fff",
            border: "1px solid #c7c7c7",
            borderRadius: "8px",
            boxShadow: "2px 2px 12px rgba(0,0,0,0.08)",
            zIndex: 100,
            maxHeight: "178px",
            overflowY: "auto",
            padding: "4px",
            scrollbarWidth: "none" as const,
            msOverflowStyle: "none" as const,
          }}>
            <style>{`
              .select-dropdown-scroll::-webkit-scrollbar { display: none; }
            `}</style>
            {normalizedOptions.map((option) => (
              <div
                key={option.value}
                onClick={(e) => {
                  e.stopPropagation();
                  onChange(option.value);
                  setIsOpen(false);
                }}
                style={{
                  padding: "8px",
                  cursor: "pointer",
                  borderRadius: "4px",
                  fontSize: "14px",
                  textAlign: "left",
                  backgroundColor: value === option.value ? "#f5f5f5" : "transparent",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#fafafa")}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = value === option.value ? "#f5f5f5" : "transparent")}
              >
                {option.label}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
