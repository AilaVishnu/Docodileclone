import React from "react";
import { Modal } from "../Modal";
import { Button } from "../Button";
import { colors, fonts, spacing } from "../../styles/theme";

// ─────────────────────────────────────────────────────────────────────────────
// ConfirmDialog — the one canonical "are you sure?" dialog. Built on
// <Modal level="top"> so it always floats above whatever opened it (a form, a
// modal, the queue). Replaces ~7 hand-rolled confirm overlays + the cross-folder
// confirmStyles import.
//   • destructive → red confirm button (cancel / delete / end / reset)
//   • hideCancel  → alert style (single button, e.g. "Walk-in failed")
// ─────────────────────────────────────────────────────────────────────────────
type ConfirmDialogProps = {
  isOpen: boolean;
  title: string;
  message?: React.ReactNode;
  confirmLabel: string;
  onConfirm: () => void;
  onCancel: () => void;
  /** Cancel button label. Default "Cancel". */
  cancelLabel?: string;
  /** Red confirm button for destructive / irreversible actions. */
  destructive?: boolean;
  /** Alert style — hide the cancel button (single action). */
  hideCancel?: boolean;
  confirmDisabled?: boolean;
};

export function ConfirmDialog({
  isOpen,
  title,
  message,
  confirmLabel,
  onConfirm,
  onCancel,
  cancelLabel = "Cancel",
  destructive,
  hideCancel,
  confirmDisabled,
}: ConfirmDialogProps) {
  return (
    <Modal isOpen={isOpen} onClose={onCancel} surface={colors.primary100} width={360} padding={spacing.xl} level="top">
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: spacing.m, textAlign: "center" }}>
        {/* Title matches UploadModal's title (serif h5, regular weight). */}
        <h4 style={{ fontFamily: fonts.family.secondary, fontSize: fonts.size.h5, lineHeight: fonts.lineHeight.h5, fontWeight: fonts.weight.regular, color: colors.neutral900, margin: 0 }}>
          {title}
        </h4>
        {message && (
          <p style={{ fontFamily: fonts.family.primary, fontSize: fonts.control.sm, color: colors.neutral700, margin: 0, lineHeight: 1.5, maxWidth: 320 }}>
            {message}
          </p>
        )}
        {hideCancel ? (
          <Button variant={destructive ? "danger" : "dark"} size="sm" onClick={onConfirm} disabled={confirmDisabled}>
            {confirmLabel}
          </Button>
        ) : (
          // Equal-width buttons: an inline-grid shrinks to its content while the
          // two 1fr columns are forced equal — so both size to the WIDER label.
          <div style={{ display: "inline-grid", gridTemplateColumns: "1fr 1fr", gap: spacing.m }}>
            <Button variant="light" size="sm" onClick={onCancel} style={{ width: "100%" }}>
              {cancelLabel}
            </Button>
            <Button variant={destructive ? "danger" : "dark"} size="sm" onClick={onConfirm} disabled={confirmDisabled} style={{ width: "100%" }}>
              {confirmLabel}
            </Button>
          </div>
        )}
      </div>
    </Modal>
  );
}
