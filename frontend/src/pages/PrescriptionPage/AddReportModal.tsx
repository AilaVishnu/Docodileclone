import React, { useEffect, useMemo, useRef, useState } from "react";
import { Modal } from "../../components/Modal/Modal";
import { Select } from "../../components/Input/Select/Select";
import { DatePicker } from "../../components/AppointmentQueue/DatePicker";
import { colors, fonts, radii, spacing } from "../../styles/theme";
import type { VisitDTO } from "../../api/visits";

// Row shape consumed by PrescriptionPage's uploadedItems map. Includes the
// raw file blob + a previewable object URL so the FileViewer can render the
// uploaded asset without a backend round-trip yet. `id` is generated here so
// annotations and any future server row can key off it.
//
// Backend follow-up: once /reports POST exists, this modal POSTs the
// multipart file + metadata and the response gives an authoritative id +
// signed URL — drop `file` and replace `fileUrl` with the server URL.
export type AddReportRow = {
  id: string;
  name: string;
  category: string;
  date: string;
  fileUrl: string | null;
  mimeType: string | null;
  visitId?: string;
  notes?: string;
};

// Semantic categories — the chip the user picks here drives both this row's
// metadata AND the filter chips above the Files table. Order matches the
// Files tab chips in PrescriptionPage (minus "All", which is the default
// pass-through filter).
const CATEGORIES = [
  "Reports",
  "Prescriptions",
  "Observations",
  "Admin",
  "Other",
] as const;

type Props = {
  isOpen: boolean;
  visits: VisitDTO[];
  defaultVisitId?: string | null;
  onClose: () => void;
  onAdd: (rows: AddReportRow[]) => void;
};

// Per-file form state. `previewUrl` is created via URL.createObjectURL for
// image files only; revoked on unmount so we don't leak blobs.
type DraftEntry = {
  id: string;
  file: File;
  previewUrl: string | null;
  name: string;
  category: string;
  date: Date;
  visitId: string;
  notes: string;
};

let draftCounter = 0;
const nextDraftId = () => `draft-${++draftCounter}-${Date.now()}`;

// Strip extension, replace separators with spaces, title-case. "CBC_jan_2026.pdf"
// → "CBC Jan 2026". Best-effort — user can edit.
function suggestNameFromFile(file: File): string {
  const base = file.name.replace(/\.[^.]+$/, "");
  const cleaned = base.replace(/[_-]+/g, " ").trim();
  return cleaned
    .split(/\s+/)
    .map((w) => (w.length > 3 ? w[0].toUpperCase() + w.slice(1).toLowerCase() : w.toUpperCase()))
    .join(" ");
}

// Heuristic category guess from filename keywords against the new semantic
// taxonomy. Falls through to "Other" when nothing matches — the user can
// always correct via the dropdown.
function suggestCategory(file: File): string {
  const lower = file.name.toLowerCase();
  if (/rx|prescription|tablet|capsule|dose/.test(lower)) return "Prescriptions";
  if (/blood|cbc|hb|hemoglob|urine|path|biops|cytol|smear|xray|x-ray|mri|ct|scan|ultrasound|usg|ecg|ekg|report|lab/.test(lower)) {
    return "Reports";
  }
  if (/wound|skin|dental|photo|before|after|observ/.test(lower)) return "Observations";
  if (/consent|insurance|aadhaar|passport|id_proof|referral|discharge|vaccin/.test(lower)) return "Admin";
  return "Other";
}

const isImageFile = (f: File): boolean => f.type.startsWith("image/");

const fmtVisitOption = (v: VisitDTO): string =>
  new Date(v.visitDate).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

const fmtDateForRow = (d: Date): string =>
  d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "2-digit" });

export function AddReportModal({
  isOpen,
  visits,
  defaultVisitId,
  onClose,
  onAdd,
}: Props) {
  const [drafts, setDrafts] = useState<DraftEntry[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const [openPickerFor, setOpenPickerFor] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Reset drafts whenever the modal opens fresh. Skip revoke for drafts that
  // were "kept" by handleSave (their URL is now owned by the caller).
  useEffect(() => {
    if (!isOpen) {
      drafts.forEach((d) => {
        const kept = (d as DraftEntry & { _kept?: boolean })._kept;
        if (d.previewUrl && !kept) URL.revokeObjectURL(d.previewUrl);
      });
      setDrafts([]);
      setOpenPickerFor(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const addFiles = (files: FileList | File[]) => {
    const arr = Array.from(files);
    if (arr.length === 0) return;
    const newDrafts: DraftEntry[] = arr.map((file) => ({
      id: nextDraftId(),
      file,
      previewUrl: isImageFile(file) ? URL.createObjectURL(file) : null,
      name: suggestNameFromFile(file),
      category: suggestCategory(file),
      date: new Date(),
      visitId: defaultVisitId || (visits[0]?.id ?? ""),
      notes: "",
    }));
    setDrafts((prev) => [...prev, ...newDrafts]);
  };

  const updateDraft = <K extends keyof DraftEntry>(id: string, key: K, value: DraftEntry[K]) =>
    setDrafts((prev) => prev.map((d) => (d.id === id ? { ...d, [key]: value } : d)));

  const removeDraft = (id: string) =>
    setDrafts((prev) => {
      const target = prev.find((d) => d.id === id);
      if (target?.previewUrl) URL.revokeObjectURL(target.previewUrl);
      return prev.filter((d) => d.id !== id);
    });

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) addFiles(e.target.files);
    e.target.value = "";
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files) addFiles(e.dataTransfer.files);
  };

  const handleSave = () => {
    if (drafts.length === 0) return;
    const rows: AddReportRow[] = drafts.map((d) => ({
      id: d.id,
      name: d.name.trim() || d.file.name,
      category: d.category,
      date: fmtDateForRow(d.date),
      // Reuse the same blob URL we already created for the thumbnail so the
      // viewer doesn't need to re-create it. Caller owns lifecycle from here
      // — the modal resets its `drafts` state but does NOT revoke this URL
      // on close (unlike the thumbnail revoke path).
      fileUrl: d.previewUrl ?? (d.file ? URL.createObjectURL(d.file) : null),
      mimeType: d.file.type || null,
      visitId: d.visitId,
      notes: d.notes,
    }));
    // Mark drafts as "ownership transferred" so the close-handler skips
    // revoke for these URLs. We use a side-effect on the draft objects.
    drafts.forEach((d) => { (d as DraftEntry & { _kept?: boolean })._kept = true; });
    onAdd(rows);
    onClose();
  };

  const titleCopy = "Add File";
  const headerSubtitle = "Upload reports, prescriptions, photos, or any patient file";

  const categoryOpts = useMemo(
    () => CATEGORIES.map((c) => ({ label: c, value: c })),
    []
  );
  const visitOpts = useMemo(
    () => visits.map((v) => ({ label: fmtVisitOption(v), value: v.id })),
    [visits]
  );

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div style={styles.container}>
        <header style={styles.header}>
          <div>
            <h2 style={styles.title}>{titleCopy}</h2>
            <p style={styles.subtitle}>{headerSubtitle}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            style={styles.closeBtn}
          >
            ✕
          </button>
        </header>

        {/* Drop zone — clickable, also accepts drag/drop. Stays visible even
            after files are added so the user can append more in the same
            session. */}
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          style={{
            ...styles.dropZone,
            ...(dragOver ? styles.dropZoneActive : null),
          }}
        >
          <ArrowUpIcon />

          <span style={styles.dropZoneTitle}>
            {drafts.length === 0
              ? "Drag files here, or click to choose"
              : "Add more files"}
          </span>
          <span style={styles.dropZoneHint}>
            Any file type · multi-select supported
          </span>
        </button>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          onChange={handleFileInput}
          style={{ display: "none" }}
        />

        {drafts.length > 0 && (
          <div style={styles.draftList}>
            {drafts.map((d) => (
              <div key={d.id} style={styles.draftRow}>
                {/* Thumbnail */}
                <div style={styles.thumb}>
                  {d.previewUrl ? (
                    <img src={d.previewUrl} alt="" style={styles.thumbImg} />
                  ) : (
                    <span style={styles.thumbExt}>{fileExt(d.file.name)}</span>
                  )}
                </div>

                {/* Form fields */}
                <div style={styles.fields}>
                  <div style={styles.fieldRow}>
                    <label style={styles.fieldLabel}>Name</label>
                    <input
                      type="text"
                      value={d.name}
                      onChange={(e) => updateDraft(d.id, "name", e.target.value)}
                      style={styles.textInput}
                      placeholder={d.file.name}
                    />
                  </div>

                  <div style={styles.twoCol}>
                    <div style={styles.fieldRow}>
                      <label style={styles.fieldLabel}>Category</label>
                      <Select
                        value={d.category}
                        onChange={(v) => updateDraft(d.id, "category", v)}
                        placeholder="Category"
                        options={categoryOpts}
                      />
                    </div>
                    <div style={styles.fieldRow}>
                      <label style={styles.fieldLabel}>Investigation date</label>
                      <button
                        type="button"
                        onClick={() => setOpenPickerFor(openPickerFor === d.id ? null : d.id)}
                        style={styles.dateTrigger}
                      >
                        {d.date.toLocaleDateString(undefined, {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })}
                      </button>
                      {openPickerFor === d.id && (
                        <DatePicker
                          selectedDate={d.date}
                          onSelect={(date) => {
                            updateDraft(d.id, "date", date);
                            setOpenPickerFor(null);
                          }}
                          onClose={() => setOpenPickerFor(null)}
                          style={{
                            top: "calc(100% + 8px)",
                            left: 0,
                            transform: "none",
                          }}
                        />
                      )}
                    </div>
                  </div>

                  {visits.length > 0 && (
                    <div style={styles.fieldRow}>
                      <label style={styles.fieldLabel}>Tie to visit</label>
                      <Select
                        value={d.visitId}
                        onChange={(v) => updateDraft(d.id, "visitId", v)}
                        placeholder="Select visit"
                        options={visitOpts}
                      />
                    </div>
                  )}

                  <div style={styles.fieldRow}>
                    <label style={styles.fieldLabel}>Notes (optional)</label>
                    <textarea
                      value={d.notes}
                      onChange={(e) => updateDraft(d.id, "notes", e.target.value)}
                      style={styles.textarea}
                      rows={2}
                      placeholder="e.g. Hb low, follow up in 2 wks"
                    />
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => removeDraft(d.id)}
                  aria-label="Remove"
                  style={styles.removeBtn}
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}

        <footer style={styles.footer}>
          <button type="button" onClick={onClose} style={styles.btnGhost}>
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={drafts.length === 0}
            style={{
              ...styles.btnPrimary,
              ...(drafts.length === 0 ? { opacity: 0.45, cursor: "not-allowed" } : null),
            }}
          >
            Add {drafts.length > 1 ? `(${drafts.length})` : ""}
          </button>
        </footer>
      </div>
    </Modal>
  );
}

// Best-effort file-extension chip when no image preview is available.
function fileExt(filename: string): string {
  const m = filename.match(/\.([^.]+)$/);
  return (m ? m[1] : "FILE").slice(0, 4).toUpperCase();
}

// Inline arrow-up glyph matching Figma node 2524:5157 (Linear / Arrows /
// Arrow Up). Drawn at 24×24 viewBox, rendered slightly larger than the old
// emoji per design feedback.
function ArrowUpIcon() {
  return (
    <svg
      width="32"
      height="32"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
      style={{ color: colors.primary700 }}
    >
      <path
        d="M12 4v16M12 4l-5 5M12 4l5 5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────
// These are local to the modal — every other dropdown / picker / date input
// reuses an existing component (Modal, Select, DatePicker). The form-row
// scaffolding (label, text input, textarea, drop zone) is new because the
// project doesn't have a generic form-field primitive yet.

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: "flex",
    flexDirection: "column",
    gap: spacing.l,
    width: 560,
    maxWidth: "100%",
    maxHeight: "80vh",
    overflowY: "auto",
  },
  header: {
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: spacing.m,
  },
  title: {
    margin: 0,
    fontFamily: fonts.family.secondary,
    fontSize: fonts.size.h5,
    lineHeight: fonts.lineHeight.h5,
    fontWeight: fonts.weight.regular,
    color: colors.neutral900,
  },
  subtitle: {
    margin: 0,
    marginTop: 4,
    fontFamily: fonts.family.primary,
    fontSize: fonts.control.sm,
    color: colors.neutral600,
  },
  // Matches AddStaffModal's closeButton — plain text "✕", no background
  // circle. Keeps modal headers consistent across the app.
  closeBtn: {
    background: "none",
    border: "none",
    color: colors.neutral900,
    fontFamily: fonts.family.primary,
    fontSize: fonts.size.m,
    cursor: "pointer",
    padding: 0,
    flexShrink: 0,
  },
  dropZone: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    padding: `${spacing.xl} ${spacing.l}`,
    border: `1.5px dashed ${colors.primary400}`,
    borderRadius: radii.l,
    backgroundColor: colors.neutral100,
    cursor: "pointer",
    width: "100%",
    boxSizing: "border-box",
    fontFamily: fonts.family.primary,
    transition: "background-color 0.15s ease, border-color 0.15s ease",
  },
  dropZoneActive: {
    backgroundColor: colors.primary100,
    borderColor: colors.primary600,
  },
  dropZoneIcon: {
    fontSize: 22,
    color: colors.primary700,
    lineHeight: 1,
  },
  dropZoneTitle: {
    fontSize: fonts.control.md,
    color: colors.neutral900,
    fontWeight: fonts.weight.medium,
  },
  dropZoneHint: {
    fontSize: fonts.control.xs,
    color: colors.neutral500,
  },
  draftList: {
    display: "flex",
    flexDirection: "column",
    gap: spacing.s,
  },
  draftRow: {
    display: "flex",
    gap: spacing.m,
    padding: spacing.m,
    backgroundColor: colors.neutral100,
    borderRadius: radii.m,
    border: `1px solid ${colors.neutral200}`,
  },
  thumb: {
    width: 56,
    height: 56,
    borderRadius: radii.s,
    backgroundColor: colors.primary100,
    border: `1px solid ${colors.primary300}`,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    flexShrink: 0,
  },
  thumbImg: {
    width: "100%",
    height: "100%",
    objectFit: "cover" as const,
  },
  thumbExt: {
    fontFamily: fonts.family.primary,
    fontSize: fonts.control.xs,
    fontWeight: fonts.weight.semibold,
    color: colors.primary800,
    letterSpacing: 0.5,
  },
  fields: {
    flex: 1,
    minWidth: 0,
    display: "flex",
    flexDirection: "column",
    gap: spacing.s,
  },
  twoCol: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: spacing.s,
  },
  fieldRow: {
    position: "relative",
    display: "flex",
    flexDirection: "column",
    gap: 4,
    minWidth: 0,
  },
  // Matches PrescriptionPage.styles.ts `fieldLabel` — sentence case, regular
  // weight, neutral500. Form labels across the app share this treatment.
  fieldLabel: {
    fontFamily: fonts.family.primary,
    fontSize: fonts.size.xs,
    lineHeight: fonts.lineHeight.xs,
    color: colors.neutral500,
    fontWeight: fonts.weight.regular,
  },
  textInput: {
    width: "100%",
    height: 40,
    boxSizing: "border-box",
    padding: `0 ${spacing.s}`,
    border: `1px solid ${colors.neutral300}`,
    borderRadius: radii.m,
    backgroundColor: colors.neutral100,
    fontFamily: fonts.family.primary,
    fontSize: fonts.control.md,
    color: colors.neutral900,
    outline: "none",
  },
  textarea: {
    width: "100%",
    minHeight: 56,
    resize: "vertical" as const,
    boxSizing: "border-box",
    padding: spacing.s,
    border: `1px solid ${colors.neutral300}`,
    borderRadius: radii.m,
    backgroundColor: colors.neutral100,
    fontFamily: fonts.family.primary,
    fontSize: fonts.control.sm,
    color: colors.neutral900,
    outline: "none",
  },
  dateTrigger: {
    height: 40,
    boxSizing: "border-box",
    padding: `0 ${spacing.s}`,
    border: `1px solid ${colors.neutral300}`,
    borderRadius: radii.m,
    backgroundColor: colors.neutral100,
    fontFamily: fonts.family.primary,
    fontSize: fonts.control.md,
    color: colors.neutral900,
    textAlign: "left" as const,
    cursor: "pointer",
  },
  // Same treatment as `closeBtn` — plain text, no background circle. Keeps
  // every "dismiss" affordance in the modal visually consistent.
  removeBtn: {
    alignSelf: "flex-start",
    background: "none",
    border: "none",
    color: colors.neutral900,
    fontFamily: fonts.family.primary,
    fontSize: fonts.size.m,
    cursor: "pointer",
    padding: 0,
    flexShrink: 0,
  },
  footer: {
    display: "flex",
    justifyContent: "flex-end",
    gap: spacing.s,
    paddingTop: spacing.s,
    borderTop: `1px solid ${colors.neutral200}`,
  },
  btnGhost: {
    fontFamily: fonts.family.primary,
    fontSize: fonts.control.md,
    color: colors.neutral900,
    background: "transparent",
    border: `1px solid ${colors.primary300}`,
    borderRadius: radii.full,
    padding: "10px 20px",
    cursor: "pointer",
  },
  btnPrimary: {
    fontFamily: fonts.family.primary,
    fontSize: fonts.control.md,
    color: colors.neutral100,
    backgroundColor: colors.primary700,
    border: "none",
    borderRadius: radii.full,
    padding: "10px 20px",
    cursor: "pointer",
  },
};
