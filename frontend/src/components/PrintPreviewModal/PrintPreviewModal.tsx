import React, { useEffect, useRef, useState } from "react";
import { styles } from "./PrintPreviewModal.styles";
import { Modal } from "../Modal";
import { Button } from "../Button";
import { colors } from "../../styles/theme";
import { ReactComponent as ChevronIcon } from "../../assets/icons/chevron-up.svg";
import { ReactComponent as PrinterIcon } from "../../assets/icons/printer.svg";
import { ReactComponent as DownloadIcon } from "../../assets/icons/download.svg";
import { ReactComponent as ShareIcon } from "../../assets/icons/share.svg";
import { ReactComponent as TuningIcon } from "../../assets/icons/tuning.svg";

type Destination = "pdf" | "print";

type Props = {
  isOpen: boolean;
  html: string | null;
  onClose: () => void;
  onSave?: () => void;
  onPrint?: () => void;
  onShare?: () => void;
  onConfigureTemplate?: () => void;
};

const DESTINATION_OPTIONS: { value: Destination; label: string }[] = [
  { value: "pdf", label: "Save as PDF" },
  { value: "print", label: "Print" },
];

export function PrintPreviewModal({
  isOpen,
  html,
  onClose,
  onSave,
  onPrint,
  onShare,
  onConfigureTemplate,
}: Props) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [destination, setDestination] = useState<Destination>("pdf");
  const [destOpen, setDestOpen] = useState(false);
  const destWrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen || !html) return;
    const frame = iframeRef.current;
    if (!frame) return;
    const doc = frame.contentDocument;
    if (!doc) return;
    doc.open();
    doc.write(html);
    doc.close();
  }, [isOpen, html]);

  useEffect(() => {
    if (!destOpen) return;
    const onClick = (e: MouseEvent) => {
      if (destWrapRef.current && !destWrapRef.current.contains(e.target as Node)) setDestOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [destOpen]);

  if (!isOpen) return null;

  const destLabel = DESTINATION_OPTIONS.find((o) => o.value === destination)?.label ?? "";
  const isPrint = destination === "print";
  const ctaLabel = isPrint ? "Print" : "Download";
  const ctaIcon = isPrint
    ? <PrinterIcon width={16} height={16} />
    : <DownloadIcon width={16} height={16} />;
  const onCta = isPrint ? (onPrint ?? onClose) : (onSave ?? onClose);

  return (
    <Modal isOpen={isOpen} onClose={onClose} surface={colors.neutral100} padding={0}>
      <div style={styles.shell}>
        <div style={styles.previewPane}>
          <iframe
            ref={iframeRef}
            title="Prescription preview"
            style={styles.previewPage}
          />
        </div>

        <div style={styles.settingsPane}>
          <div style={styles.settingsHeader}>
            <h2 style={styles.settingsTitle}>Print</h2>
            <div style={styles.headerRight}>
              <span style={styles.pageCount}>1 page</span>
              <button
                type="button"
                style={styles.configureBtn}
                onClick={onConfigureTemplate}
                title="Configure print template"
                aria-label="Configure print template"
              >
                <TuningIcon width={18} height={18} />
              </button>
            </div>
          </div>

          <div style={styles.fieldList}>
            <div style={styles.field}>
              <span style={styles.fieldLabel}>Destination</span>
              <div ref={destWrapRef} style={{ position: "relative" }}>
                <div
                  role="button"
                  aria-haspopup="listbox"
                  aria-expanded={destOpen}
                  style={{ ...styles.select, cursor: "pointer" }}
                  onClick={() => setDestOpen((v) => !v)}
                >
                  <span>{destLabel}</span>
                  <span style={styles.selectIconWrap}>
                    <ChevronIcon
                      width={16}
                      height={16}
                      style={{ transform: destOpen ? "rotate(0deg)" : "rotate(180deg)" }}
                    />
                  </span>
                </div>
                {destOpen && (
                  <div style={styles.menu} role="listbox">
                    {DESTINATION_OPTIONS.map((opt) => (
                      <MenuOption
                        key={opt.value}
                        label={opt.label}
                        active={opt.value === destination}
                        onSelect={() => {
                          setDestination(opt.value);
                          setDestOpen(false);
                        }}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>

            <Field label="Pages" value="All" />
            <Field label="Pages Per Sheet" value="1" />
          </div>

          <div style={styles.footer}>
            <Button variant="light" size="sm" onClick={onClose}>Cancel</Button>
            <Button variant="dark" size="sm" iconLeft={ctaIcon} onClick={onCta}>{ctaLabel}</Button>
            <button
              type="button"
              style={styles.shareBtn}
              onClick={onShare}
              title="Share"
              aria-label="Share"
            >
              <ShareIcon width={24} height={24} />
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
}

function MenuOption({
  label,
  active,
  onSelect,
}: {
  label: string;
  active: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      role="option"
      aria-selected={active}
      style={{ ...styles.menuItem, ...(active ? styles.menuItemActive : {}) }}
      onMouseDown={(e) => {
        e.preventDefault();
        onSelect();
      }}
      onMouseEnter={(e) => {
        if (!active) e.currentTarget.style.backgroundColor = colors.primary100;
      }}
      onMouseLeave={(e) => {
        if (!active) e.currentTarget.style.backgroundColor = "transparent";
      }}
    >
      {label}
    </button>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div style={styles.field}>
      <span style={styles.fieldLabel}>{label}</span>
      <div style={styles.select}>
        <span>{value}</span>
        <span style={styles.selectIconWrap}>
          <ChevronIcon
            width={16}
            height={16}
            style={{ transform: "rotate(180deg)" }}
          />
        </span>
      </div>
    </div>
  );
}
