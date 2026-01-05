import React, { useState } from "react";
import { styles, variants } from "./Button.styles";


type ButtonProps = {
  children?: React.ReactNode;
  variant?: "dark" | "light" | "primary" | "primaryLight" | "secondary" | "secondaryLight";
  size?: "sm" | "md";
  iconLeft?: React.ReactNode;
  iconRight?: React.ReactNode;
  disabled?: boolean;
  onClick?: () => void;
};

export function Button({
  children,
  variant = "primary",
  size = "md",
  iconLeft,
  iconRight,
  disabled = false,
  onClick,
}: ButtonProps) {
  const [hovered, setHovered] = useState(false);

  const variantStyles = variants[variant];

  const style: React.CSSProperties = {
    ...styles.base,
    ...styles[size],
    ...variantStyles.default,
    ...(hovered && !disabled ? variantStyles.hover : {}),
    ...(disabled ? variantStyles.disabled : {}),
  };

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={style}
    >
      {iconLeft && <span>{iconLeft}</span>}
      {children && <span>{children}</span>}
      {iconRight && <span>{iconRight}</span>}
    </button>
  );
}
