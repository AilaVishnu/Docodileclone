import React from "react";
import { IconButton } from "../IconButton";
import { colors, fonts, spacing } from "../../styles/theme";

// ─────────────────────────────────────────────────────────────────────────────
// ModalHeader — the canonical modal header: a serif title (+ optional subtitle)
// and the canonical IconButton close (✕). Pair it with <Modal> so callers stop
// re-declaring the same header/title/subtitle style objects in every modal.
//   • align="left"  (default) → title on the left, close on the right
//   • align="center"          → centred title, close pinned top-right
//   • omit onClose            → no close button (e.g. a "Skip"-only modal)
// ─────────────────────────────────────────────────────────────────────────────
type ModalHeaderProps = {
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  /** Renders the canonical IconButton close (✕). Omit for a header with no close. */
  onClose?: () => void;
  /** Close button disabled state (e.g. mid-submit). */
  closeDisabled?: boolean;
  align?: "left" | "center";
};

export function ModalHeader({ title, subtitle, onClose, closeDisabled, align = "left" }: ModalHeaderProps) {
  const centered = align === "center";
  return (
    <header
      style={{
        position: "relative",
        display: "flex",
        alignItems: "flex-start",
        justifyContent: centered ? "center" : "space-between",
        gap: spacing.m,
        textAlign: centered ? "center" : "left",
      }}
    >
      <div>
        <h2 style={{ margin: 0, fontFamily: fonts.family.secondary, fontSize: fonts.size.h5, lineHeight: fonts.lineHeight.h5, fontWeight: fonts.weight.regular, color: colors.neutral900 }}>
          {title}
        </h2>
        {subtitle && (
          <p style={{ margin: "4px 0 0", fontFamily: fonts.family.primary, fontSize: fonts.control.sm, color: colors.neutral600 }}>
            {subtitle}
          </p>
        )}
      </div>
      {onClose && (
        <IconButton
          ariaLabel="Close"
          onClick={onClose}
          disabled={closeDisabled}
          style={centered ? { position: "absolute", top: 0, right: 0 } : undefined}
        />
      )}
    </header>
  );
}
