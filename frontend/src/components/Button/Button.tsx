import React, { useState } from "react";
import { styles, variants } from "./Button.styles";


type ButtonProps = {
  children?: React.ReactNode;
  variant?: "dark" | "light" | "primary" | "primaryLight" | "secondary" | "secondaryLight" | "danger";
  size?: "sm" | "md" | "smIcon" | "mdIcon";
  iconLeft?: React.ReactNode;
  iconRight?: React.ReactNode;
  disabled?: boolean;
  onClick?: () => void;
  style?: React.CSSProperties;
};

export function Button({
  children,
  variant = "primary",
  size = "md",
  iconLeft,
  iconRight,
  disabled = false,
  onClick,
  style,
}: ButtonProps) {
  const [hovered, setHovered] = useState(false);
  const [pressed, setPressed] = useState(false);

  const variantStyles = variants[variant];

  const mergedStyle: React.CSSProperties = {
    ...styles.base,
    ...styles[size],
    ...variantStyles.default,
    ...(hovered && !disabled ? variantStyles.hover : {}),
    ...(disabled ? variantStyles.disabled : {}),
    // Press microinteraction — a "key-press": the button pushes down slightly and
    // an inset shadow darkens it, like a physical key. Explicit unpressed values so
    // it animates both ways. Works across every variant (the inset shadow reads on
    // any fill). Transition tokenised in Button.styles; reduced-motion-safe.
    ...(!disabled ? {
      transform: pressed ? "translateY(1.5px)" : "translateY(0)",
      boxShadow: pressed ? "inset 0 2px 5px rgba(0,0,0,0.22)" : "inset 0 0 0 rgba(0,0,0,0)",
    } : {}),
    ...style,
  };

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => { setHovered(false); setPressed(false); }}
      onPointerDown={() => setPressed(true)}
      onPointerUp={() => setPressed(false)}
      style={mergedStyle}
    >
      {iconLeft}
      {children && <span>{children}</span>}
      {iconRight}
    </button>
  );
}
