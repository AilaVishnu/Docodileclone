import React, { useRef, useState } from "react";
import { Modal } from "../Modal/Modal";
import { IconButton } from "../IconButton";
import { Button } from "../Button";
import { colors, fonts, radii, spacing } from "../../styles/theme";

// Arrow-up glyph (Linear / Arrows / Arrow Up), 1.5px stroke, primary700.
function ArrowUpIcon() {
  return (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" aria-hidden style={{ color: colors.primary700 }}>
      <path d="M12 4v16M12 4l-5 5M12 4l5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export type UploadModalProps = {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: React.ReactNode;
  /** Drop-zone primary line. Default: "Drag files here, or click to choose". */
  dropTitle?: string;
  /** Primary line once files exist (e.g. "Add more files"). */
  dropTitleActive?: string;
  dropHint?: string;
  hasFiles?: boolean;
  accept?: string;
  multiple?: boolean;
  onFiles: (files: File[]) => void;
  /** Body between the drop-zone and the footer (per-file metadata, a preview…). */
  children?: React.ReactNode;
  error?: string | null;
  confirmLabel: string;
  onConfirm: () => void;
  confirmDisabled?: boolean;
  cancelLabel?: string;
  width?: number;
  surface?: string;
};

// ─────────────────────────────────────────────────────────────────────────────
// UploadModal — the shared "upload anything" modal. Centred header + top-right
// ✕, an arrow drop-zone (click OR drag-drop), an optional body slot (per-file
// metadata, a CSV preview…) and a Cancel + black-confirm footer (equal width).
// Add file passes a per-file metadata body; Pharmacy Import CSV passes none.
// ─────────────────────────────────────────────────────────────────────────────
export function UploadModal({
  isOpen, onClose, title, subtitle,
  dropTitle = "Drag files here, or click to choose", dropTitleActive, dropHint,
  hasFiles = false, accept, multiple = true, onFiles,
  children, error, confirmLabel, onConfirm, confirmDisabled, cancelLabel = "Cancel",
  width = 560, surface,
}: UploadModalProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);

  return (
    <Modal isOpen={isOpen} onClose={onClose} padding={spacing.xl} radius={16} width={width} surface={surface}>
      <div style={S.container}>
        <header style={S.header}>
          <h2 style={S.title}>{title}</h2>
          {subtitle && <p style={S.subtitle}>{subtitle}</p>}
          <IconButton ariaLabel="Close" onClick={onClose} style={{ position: "absolute", top: 0, right: 0 }} />
        </header>

        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => { e.preventDefault(); setDragOver(false); if (e.dataTransfer.files?.length) onFiles(Array.from(e.dataTransfer.files)); }}
          style={{ ...S.dropZone, ...(dragOver ? S.dropZoneActive : null) }}
        >
          <ArrowUpIcon />
          <span style={S.dropTitle}>{hasFiles && dropTitleActive ? dropTitleActive : dropTitle}</span>
          {dropHint && <span style={S.dropHint}>{dropHint}</span>}
        </button>
        <input
          ref={inputRef}
          type="file"
          multiple={multiple}
          accept={accept}
          onChange={(e) => { if (e.target.files?.length) onFiles(Array.from(e.target.files)); e.target.value = ""; }}
          style={{ display: "none" }}
        />

        {children}
        {error && <p style={S.error}>{error}</p>}

        <footer style={S.footer}>
          <div style={S.footerInner}>
            <Button variant="light" size="sm" onClick={onClose} style={{ flex: 1, justifyContent: "center" }}>{cancelLabel}</Button>
            <Button variant="dark" size="sm" onClick={onConfirm} disabled={confirmDisabled} style={{ flex: 1, justifyContent: "center" }}>{confirmLabel}</Button>
          </div>
        </footer>
      </div>
    </Modal>
  );
}

const S: Record<string, React.CSSProperties> = {
  container: { display: "flex", flexDirection: "column", gap: spacing.l, width: "100%", maxHeight: "80vh", overflowY: "auto" },
  header: { position: "relative", textAlign: "center" },
  title: { margin: 0, fontFamily: fonts.family.secondary, fontSize: fonts.size.h5, lineHeight: fonts.lineHeight.h5, fontWeight: fonts.weight.semibold, color: colors.neutral900 },
  subtitle: { margin: "4px 0 0", fontFamily: fonts.family.primary, fontSize: fonts.control.sm, color: colors.neutral600 },
  dropZone: { display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 6, padding: `${spacing.xl} ${spacing.l}`, border: `1.5px dashed ${colors.primary400}`, borderRadius: radii.l, backgroundColor: colors.neutral100, cursor: "pointer", width: "100%", boxSizing: "border-box", fontFamily: fonts.family.primary, transition: "background-color 0.15s ease, border-color 0.15s ease" },
  dropZoneActive: { backgroundColor: colors.primary100, borderColor: colors.primary600 },
  dropTitle: { fontSize: fonts.control.md, color: colors.neutral900, fontWeight: fonts.weight.medium },
  dropHint: { fontSize: fonts.control.xs, color: colors.neutral500 },
  error: { margin: 0, fontSize: fonts.control.sm, color: colors.red200, textAlign: "center" },
  footer: { display: "flex", justifyContent: "center" },
  footerInner: { display: "flex", gap: spacing.s, width: "100%", maxWidth: 360 },
};
