import React, { useEffect } from "react";
import { styles } from "./Toast.styles";
import { Icon } from "../Icon";

type ToastProps = {
  message: string;
  isVisible: boolean;
  onClose: () => void;
  duration?: number;
  /** Optional inline action button (e.g. "Undo"). */
  actionLabel?: string;
  onAction?: () => void;
  /**
   * Registered icon name to show. Defaults to "buildings". As per-toast icons
   * are designed, set this per message (see the Toast catalog story).
   */
  iconName?: string;
  /**
   * Optional colour for a monochrome icon (e.g. the status dot, tinted to
   * match the queue status badge). Ignored by multicolor icons.
   */
  iconColor?: string;
  /**
   * Optional background tint for the toast surface (e.g. a pale shade of the
   * status colour). Defaults to the standard neutral surface.
   */
  surfaceColor?: string;
  /**
   * Render in normal document flow instead of the default fixed bottom-right
   * overlay (no positioning / z-index / slide-in). For catalogs, docs and
   * stories that show several toasts at once.
   */
  inline?: boolean;
};

export function Toast({ message, isVisible, onClose, duration = 4000, actionLabel, onAction, inline = false, iconName = "buildings", iconColor, surfaceColor }: ToastProps) {
  useEffect(() => {
    if (isVisible && duration > 0) {
      const timer = setTimeout(onClose, duration);
      return () => clearTimeout(timer);
    }
  }, [isVisible, duration, onClose]);

  if (!isVisible) return null;

  const base = inline ? styles.containerInline : styles.container;
  const containerStyle = surfaceColor ? { ...base, backgroundColor: surfaceColor } : base;

  return (
    <div style={containerStyle}>
      <Icon name={iconName} color={iconColor} tone="inherit" style={styles.icon} />
      <p style={styles.message}>{message}</p>
      {actionLabel && onAction && (
        <button
          style={styles.actionButton}
          onClick={() => {
            onAction();
            onClose();
          }}
        >
          {actionLabel}
        </button>
      )}
      <button style={styles.closeButton} onClick={onClose}>
        ✕
      </button>
    </div>
  );
}
