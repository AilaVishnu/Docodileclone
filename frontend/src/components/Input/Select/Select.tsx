import React, { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { styles } from "./Select.styles";
import { ChevronDown } from "../../icons/ChevronDown";
import { colors, zIndex } from "../../../styles/theme";

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
  /** "outline" (border + white, default) or "filled" (cream, borderless). */
  fill?: "outline" | "filled";
  /** Show the dropdown chevron. Default true. */
  chevron?: boolean;
};

export function Select({
  options,
  value,
  onChange,
  placeholder = "Select...",
  iconLeft,
  error = false,
  disabled = false,
  fill = "outline",
  chevron = true,
}: SelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  // Trigger position drives the portaled menu's screen coordinates. Recomputed
  // on open + on scroll/resize so the menu stays anchored as the page moves.
  const [menuRect, setMenuRect] = useState<{ top: number; left: number; width: number } | null>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const t = event.target as Node;
      if (containerRef.current && !containerRef.current.contains(t) &&
          menuRef.current && !menuRef.current.contains(t)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Recompute the portaled menu's position whenever it opens, the container
  // moves (scroll/resize), or the parent's layout shifts.
  useEffect(() => {
    if (!isOpen) return;
    const updateRect = () => {
      const el = containerRef.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      setMenuRect({ top: r.bottom + 4, left: r.left, width: r.width });
    };
    updateRect();
    window.addEventListener("scroll", updateRect, true);
    window.addEventListener("resize", updateRect);
    return () => {
      window.removeEventListener("scroll", updateRect, true);
      window.removeEventListener("resize", updateRect);
    };
  }, [isOpen]);

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
    // "filled" = cream surface, borderless (border kept transparent so the height
    // matches the outlined look). Error still shows the red border.
    ...(fill === "filled"
      ? { backgroundColor: colors.primary100, borderColor: error ? colors.red200 : "transparent" }
      : {}),
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

      {chevron && (
        <div style={{ ...styles.arrow, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <ChevronDown open={isOpen} color="currentColor" size={16} strokeWidth={1.5} />
        </div>
      )}

      {isOpen && !disabled && menuRect && createPortal(
        <div
          ref={menuRef}
          className="select-dropdown-scroll"
          style={{
            ...styles.menu,
            // Fixed positioning anchored to the trigger's current rect lets
            // the menu escape any clipping ancestor (modal body, scroll
            // container, table cell, etc.).
            position: "fixed",
            top: menuRect.top,
            left: menuRect.left,
            width: menuRect.width,
            right: "auto",
            // Above modals (4000/4100) — the menu portals to <body>, so a low
            // z-index would render it behind any modal it was opened from.
            zIndex: zIndex.popover,
          }}
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
        </div>,
        document.body,
      )}
    </div>
  );
}
