import React from "react";
import { Icon } from "../Icon";
import { styles } from "./FloatingBar.styles";

// ─────────────────────────────────────────────────────────────────────────────
// FloatingBar — a floating pill of actions (matches the prescription page's
// bottom action bar). Use FloatingBarButton + FloatingBarDivider inside it.
// Position defaults to absolute (centered at the bottom of a positioned parent);
// pass position="fixed" to pin it to the viewport like the prescription bar.
// ─────────────────────────────────────────────────────────────────────────────

export type FloatingBarProps = {
  children: React.ReactNode;
  position?: "absolute" | "fixed";
  /** Distance from the bottom edge. Defaults to 20px. */
  bottom?: number | string;
  zIndex?: number;
  style?: React.CSSProperties;
};

export function FloatingBar({
  children,
  position = "absolute",
  bottom = 20,
  zIndex = 1090,
  style,
}: FloatingBarProps) {
  return (
    <div
      style={{
        ...styles.bar,
        position,
        bottom,
        left: "50%",
        transform: "translateX(-50%)",
        zIndex,
        ...style,
      }}
    >
      {children}
    </div>
  );
}

export type FloatingBarButtonProps = {
  label?: React.ReactNode;
  iconName?: string;
  onClick?: () => void;
  variant?: "default" | "primary" | "danger";
  /** Highlights the button (e.g. a toggle that's currently on). */
  active?: boolean;
  disabled?: boolean;
  title?: string;
  ariaLabel?: string;
};

export function FloatingBarButton({
  label,
  iconName,
  onClick,
  variant = "default",
  active = false,
  disabled = false,
  title,
  ariaLabel,
}: FloatingBarButtonProps) {
  return (
    <button
      type="button"
      data-no-drag
      onClick={onClick}
      disabled={disabled}
      title={title}
      aria-label={ariaLabel}
      aria-pressed={active}
      style={{
        ...styles.button,
        ...(active ? styles.buttonActive : null),
        ...(variant === "primary" ? styles.buttonPrimary : null),
        ...(variant === "danger" ? styles.buttonDanger : null),
        ...(disabled ? { opacity: 0.5, cursor: "default" } : null),
      }}
    >
      {iconName && <Icon name={iconName} size={18} tone="inherit" />}
      {label && <span>{label}</span>}
    </button>
  );
}

export function FloatingBarDivider() {
  return <div style={styles.divider} aria-hidden />;
}
