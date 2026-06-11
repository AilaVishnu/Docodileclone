import React, { useEffect } from "react";
import { createPortal } from "react-dom";
import { colors, radii, spacing, shadows, zIndex } from "../../styles/theme";

// ─────────────────────────────────────────────────────────────────────────────
// Modal — the one canonical overlay shell. Owns the backdrop, centering, portal,
// stacking (z-index scale), Esc-to-close and body scroll-lock so callers don't
// reinvent them. The content background colour is RETAINED per caller via the
// `surface` prop (default = the original active.shade200 tray tint).
// ─────────────────────────────────────────────────────────────────────────────
type ModalProps = {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  /** Content background. Default = active.shade200 (the original tray tint). */
  surface?: string;
  /** Content width (also caps via maxWidth). Omit for the default min/max. */
  width?: number | string;
  /** Content padding. Default = spacing["2xl"] (32). */
  padding?: number | string;
  /** Content corner radius. Default = radii["2xl"] (16). */
  radius?: number;
  /** Content shadow. Default = shadows.modal. */
  shadow?: string;
  /** Stacking level: "modal" (default) or "top" (a dialog opened from a modal). */
  level?: "modal" | "top";
  /** Backdrop colour. Default = rgba(0,0,0,0.35). */
  backdrop?: string;
  closeOnBackdrop?: boolean;
  closeOnEsc?: boolean;
  lockScroll?: boolean;
};

export function Modal({
  isOpen,
  onClose,
  children,
  surface = colors.active.shade200,
  width,
  padding = spacing["2xl"],
  radius = radii["2xl"],
  shadow = shadows.modal,
  level = "modal",
  backdrop = "rgba(0,0,0,0.35)",
  closeOnBackdrop = true,
  closeOnEsc = true,
  lockScroll = true,
}: ModalProps) {
  useEffect(() => {
    if (!isOpen || !closeOnEsc) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, closeOnEsc, onClose]);

  useEffect(() => {
    if (!isOpen || !lockScroll) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, [isOpen, lockScroll]);

  if (!isOpen) return null;

  return createPortal(
    <div
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: backdrop,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        paddingTop: "8vh",
        paddingBottom: "4vh",
        overflowY: "auto",
        zIndex: level === "top" ? zIndex.modalTop : zIndex.modal,
      }}
      onClick={closeOnBackdrop ? onClose : undefined}
    >
      <div
        style={{
          backgroundColor: surface,
          borderRadius: radius,
          padding,
          boxShadow: shadow,
          boxSizing: "border-box",
          ...(width != null ? { width, maxWidth: "90vw" } : { minWidth: 420, maxWidth: "90vw" }),
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>,
    document.body
  );
}
