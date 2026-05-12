import React, { useState, useRef, useEffect } from "react";
import { styles } from "./Select.styles";

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
  disabled?: boolean;
};

export function Select({
  options,
  value,
  onChange,
  placeholder = "Select...",
  iconLeft,
  error = false,
  disabled = false,
}: SelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
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

  // Active = any "interacting" or "has value" state. All of these unify the
  // border + arrow + iconLeft color to neutral900 via inherited `color`.
  //   isOpen    → Figma "Typing/Open"
  //   isHovered → Figma "Hover"
  //   has value → Figma "Typed"
  const active = !disabled && (isOpen || isHovered || !!selectedOption);

  // Style priority (last wins): error > disabled > active > default
  const containerStyle: React.CSSProperties = {
    ...styles.container,
    ...(active ? styles.containerActive : {}),
    ...(disabled ? styles.containerDisabled : {}),
    ...(error ? styles.errorContainer : {}),
  };

  return (
    <div
      ref={containerRef}
      style={containerStyle}
      onClick={() => { if (!disabled) setIsOpen(!isOpen); }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {iconLeft && <span style={styles.iconLeft}>{iconLeft}</span>}

      <div style={styles.select}>
        {selectedOption ? (
          selectedOption.label
        ) : (
          <span style={styles.placeholder}>{placeholder}</span>
        )}
      </div>

      <div style={{ ...styles.arrow, transform: isOpen ? "rotate(180deg)" : "rotate(0)" }}>
        <svg width="14" height="6" viewBox="0 0 14 6" fill="none">
          <path
            d="M1 1L7 5L13 1"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>

      {isOpen && !disabled && (
        <div
          className="select-dropdown-scroll"
          style={styles.menu}
          onClick={(e) => e.stopPropagation()}
        >
          <style>{`
            .select-dropdown-scroll::-webkit-scrollbar { display: none; }
          `}</style>
          {normalizedOptions.map((option, i) => {
            const isSelected = value === option.value;
            const isItemHovered = hoverIndex === i;
            return (
              <div
                key={option.value}
                onClick={() => {
                  onChange(option.value);
                  setIsOpen(false);
                }}
                onMouseEnter={() => setHoverIndex(i)}
                onMouseLeave={() => setHoverIndex((prev) => (prev === i ? null : prev))}
                style={{
                  ...styles.menuItem,
                  ...(isSelected ? styles.menuItemSelected : {}),
                  ...(isItemHovered && !isSelected ? styles.menuItemHovered : {}),
                }}
              >
                {option.label}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
