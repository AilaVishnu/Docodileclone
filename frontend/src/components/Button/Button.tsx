import React, { useState } from "react";
import { styles, variants } from "./Button.styles";


type ButtonProps = {
  children?: React.ReactNode;
  variant?: "dark" | "light" | "primary" | "primaryLight" | "secondary" | "secondaryLight" | "dangerLight";
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

  const variantStyles = variants[variant];

  const mergedStyle: React.CSSProperties = {
    ...styles.base,
    ...styles[size],
    ...variantStyles.default,
    ...(hovered && !disabled ? variantStyles.hover : {}),
    ...(disabled ? variantStyles.disabled : {}),
    ...style,
  };

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={mergedStyle}
    >
      {iconLeft}
      {children && <span>{children}</span>}
      {iconRight}
    </button>
  );
}
