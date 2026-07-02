import React, { useEffect, useState } from "react";
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
  // Auto-dismiss after `duration` (the parent flips isVisible → false).
  useEffect(() => {
    if (isVisible && duration > 0) {
      const timer = setTimeout(onClose, duration);
      return () => clearTimeout(timer);
    }
  }, [isVisible, duration, onClose]);

  // Enter/exit lifecycle — keep the toast mounted through its fade-out so it
  // animates away instead of vanishing. `rendered` = present in the DOM;
  // `shown` = the visible (vs pre-enter / leaving) style state.
  const [rendered, setRendered] = useState(isVisible);
  const [shown, setShown] = useState(false);
  useEffect(() => {
    if (isVisible) {
      setRendered(true);
      // Flip to shown on the next frame so the enter transition runs from the
      // pre-enter state (mount → shown), not instantly.
      const r = requestAnimationFrame(() => setShown(true));
      return () => cancelAnimationFrame(r);
    }
    setShown(false);
    // Unmount only after the exit transition finishes (kept > --motion-fast).
    const t = setTimeout(() => setRendered(false), 220);
    return () => clearTimeout(t);
  }, [isVisible]);

  if (!rendered) return null;

  const base = inline ? styles.containerInline : styles.container;
  const containerStyle: React.CSSProperties = {
    ...base,
    ...(surfaceColor ? { backgroundColor: surfaceColor } : null),
    // Fixed overlay toast slides in from the right + fades (entrance) and reverses
    // out (exit); the inline catalog variant stays static.
    ...(inline ? null : {
      opacity: shown ? 1 : 0,
      transform: shown ? "translateX(0)" : "translateX(24px)",
      transition: shown
        ? "opacity var(--motion-base) var(--ease-entrance), transform var(--motion-base) var(--ease-entrance)"
        : "opacity var(--motion-fast) var(--ease-exit), transform var(--motion-fast) var(--ease-exit)",
    }),
  };

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
