import React, { useEffect, useRef } from "react";
import { colors, fonts, radii, spacing, strokes } from "../../styles/theme";

// ─────────────────────────────────────────────────────────────────────────────
// editorKit — small form primitives shared by the Settings template editors
// (Print template + Bill template). Extracted from PrintTemplateEditor so both
// editors render an identical form language without duplicating the widgets.
// Design-system components (Field/Select/Switch/Tabs/Button/Toast) still come
// from src/components; this is just the layout glue those editors have in common.
// ─────────────────────────────────────────────────────────────────────────────

export type LengthUnit = "mm" | "cm" | "in";

// Read an image File → base64 data URL. Rejects files over 1 MB (letterhead
// images are embedded inline in the print HTML, so they must stay small).
export const readImage = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    if (file.size > 1024 * 1024) {
      reject(new Error("Image must be under 1 MB"));
      return;
    }
    const fr = new FileReader();
    fr.onload = () => resolve(String(fr.result));
    fr.onerror = () => reject(new Error("Couldn't read file"));
    fr.readAsDataURL(file);
  });

export function Section({ title, sub, children }: { title: string; sub?: string; children: React.ReactNode }) {
  return (
    <section style={K.section}>
      <header>
        <h3 style={K.sectionTitle}>{title}</h3>
        {sub && <p style={K.sectionSub}>{sub}</p>}
      </header>
      <div style={K.sectionBody}>{children}</div>
    </section>
  );
}

export function Row({ children }: { children: React.ReactNode }) {
  return <div style={K.row}>{children}</div>;
}

export function Field({
  label,
  hint,
  wide,
  children,
}: {
  label: string;
  hint?: string;
  wide?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div style={{ ...K.field, flex: wide ? 2 : 1 }}>
      <div style={K.fieldLabel}>{label}</div>
      {children}
      {hint && <div style={K.fieldHint}>{hint}</div>}
    </div>
  );
}

export function SegmentedControl<T extends string>({
  value,
  options,
  onChange,
  compact,
}: {
  value: T;
  options: { value: T; label: string; sub?: string }[];
  onChange: (v: T) => void;
  compact?: boolean;
}) {
  return (
    <div style={compact ? K.segCompact : K.seg}>
      {options.map((o) => {
        const active = o.value === value;
        return (
          <button
            key={o.value}
            type="button"
            style={{
              ...(compact ? K.segCompactItem : K.segItem),
              ...(active ? (compact ? K.segCompactItemActive : K.segItemActive) : null),
            }}
            onClick={() => onChange(o.value)}
          >
            {compact ? (
              o.label
            ) : (
              <>
                <span style={K.segItemLabel}>{o.label}</span>
                {o.sub && <span style={K.segItemSub}>{o.sub}</span>}
              </>
            )}
          </button>
        );
      })}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// LengthInput — input + unit pill. Internally the value is always millimeters;
// the pill cycles mm → cm → in → mm and converts the displayed number. Sharing
// `unit` + `onUnitChange` across sibling inputs flips them together.
// ─────────────────────────────────────────────────────────────────────────────

const UNIT_CYCLE: LengthUnit[] = ["mm", "cm", "in"];

function mmTo(unit: LengthUnit, mm: number): number {
  if (unit === "cm") return mm / 10;
  if (unit === "in") return mm / 25.4;
  return mm;
}
function toMm(unit: LengthUnit, n: number): number {
  if (unit === "cm") return n * 10;
  if (unit === "in") return n * 25.4;
  return n;
}
// 0–1 decimals so cm/in don't show jittery long fractions.
function fmt(unit: LengthUnit, mm: number): string {
  const v = mmTo(unit, mm);
  if (unit === "mm") return Math.round(v).toString();
  return (Math.round(v * 10) / 10).toString();
}

export function LengthInput({
  valueMm,
  unit,
  onValueMm,
  onUnitChange,
}: {
  valueMm: number;
  unit: LengthUnit;
  onValueMm: (mm: number) => void;
  onUnitChange: (u: LengthUnit) => void;
}) {
  const [draft, setDraft] = React.useState<string>(fmt(unit, valueMm));
  React.useEffect(() => { setDraft(fmt(unit, valueMm)); }, [unit, valueMm]);
  const cycleUnit = () => {
    const i = UNIT_CYCLE.indexOf(unit);
    onUnitChange(UNIT_CYCLE[(i + 1) % UNIT_CYCLE.length]);
  };
  const commit = () => {
    const n = parseFloat(draft);
    if (!Number.isFinite(n)) {
      setDraft(fmt(unit, valueMm));
      return;
    }
    onValueMm(toMm(unit, n));
  };
  return (
    <div style={K.lengthRow}>
      <input
        type="text"
        inputMode="decimal"
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => { if (e.key === "Enter") commit(); }}
        style={K.lengthValue}
      />
      <button
        type="button"
        onClick={cycleUnit}
        style={K.lengthUnit}
        title="Click to change unit"
      >
        {unit}
      </button>
    </div>
  );
}

export function NumberInput({
  value,
  onChange,
  min,
  max,
}: {
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
}) {
  return (
    <input
      type="number"
      value={Number.isFinite(value) ? value : 0}
      min={min}
      max={max}
      onChange={(e) => {
        const raw = e.target.value;
        if (raw === "") {
          onChange(0);
          return;
        }
        let n = Number(raw);
        if (!Number.isFinite(n)) return;
        if (min != null) n = Math.max(min, n);
        if (max != null) n = Math.min(max, n);
        onChange(n);
      }}
      style={K.numberInput}
    />
  );
}

// Inline upload glyph used inside the empty dropzone — a 22×22 arrow into a tray.
function UploadGlyph() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={colors.active.shade700} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="17 8 12 3 7 8" />
      <line x1="12" y1="3" x2="12" y2="15" />
    </svg>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ImagePicker — the dropzone IS the affordance. Empty: dashed dropzone with an
// upload icon. Filled: the image fills the zone with a hover "replace" overlay
// and a corner clear pill. Drag-and-drop wired.
// ─────────────────────────────────────────────────────────────────────────────
export function ImagePicker({
  value,
  onPick,
  aspect,
}: {
  value: string | undefined;
  onPick: (f: File | null) => void | Promise<void>;
  aspect: "header" | "footer" | "signature" | "seal" | "logo";
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [hover, setHover] = React.useState(false);
  const [drag, setDrag] = React.useState(false);
  const heights: Record<typeof aspect, number> = { header: 90, footer: 90, signature: 80, seal: 80, logo: 80 };

  const open = () => inputRef.current?.click();
  const handleFiles = (files: FileList | null) => {
    const f = files?.[0] ?? null;
    if (f) onPick(f);
  };

  const tinted = (hover || drag) && !value;
  return (
    <div>
      <div
        role="button"
        tabIndex={0}
        onClick={open}
        onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); open(); } }}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
        onDragLeave={() => setDrag(false)}
        onDrop={(e) => { e.preventDefault(); setDrag(false); handleFiles(e.dataTransfer.files); }}
        style={{
          ...K.imageDrop,
          height: heights[aspect],
          backgroundColor: tinted ? colors.primary100 : colors.neutral100,
          borderColor: tinted || drag ? colors.primary600 : colors.primary400,
          backgroundImage: value ? `url(${value})` : undefined,
          backgroundSize: "contain",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          borderStyle: value ? "solid" : "dashed",
          position: "relative",
        }}
      >
        {!value && (
          <div style={K.imageDropEmpty}>
            <UploadGlyph />
            <span style={K.imageDropHint}>Click to upload</span>
            <span style={K.imageDropSubHint}>or drag &amp; drop</span>
          </div>
        )}
        {value && hover && (
          <div style={K.imageDropOverlay}>
            <span style={K.imageDropOverlayText}>Click to replace</span>
          </div>
        )}
        {value && (
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onPick(null); }}
            style={K.imageDropClear}
            aria-label="Remove image"
          >
            ×
          </button>
        )}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/svg+xml,image/webp"
        style={{ display: "none" }}
        onChange={(e) => {
          const f = e.target.files?.[0] ?? null;
          onPick(f);
          if (inputRef.current) inputRef.current.value = "";
        }}
      />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// PreviewFrame — renders already-built print HTML into a sandboxed A4 iframe.
// The caller builds the HTML (buildPrintHtml / buildBillHtml) so this stays a
// dumb string → iframe renderer usable by any template editor.
// ─────────────────────────────────────────────────────────────────────────────
export function PreviewFrame({ html, title = "print-preview" }: { html: string; title?: string }) {
  const ref = useRef<HTMLIFrameElement>(null);
  useEffect(() => {
    const f = ref.current;
    if (!f) return;
    f.srcdoc = html;
  }, [html]);
  return (
    <div style={K.previewWrap}>
      <iframe ref={ref} title={title} style={K.previewIframe} />
    </div>
  );
}

const K: Record<string, React.CSSProperties> = {
  section: {
    backgroundColor: colors.neutral100,
    borderRadius: radii.m,
    padding: spacing.m,
    display: "flex",
    flexDirection: "column",
    gap: spacing.s,
  },
  sectionTitle: { margin: 0, fontSize: fonts.size.m, fontWeight: 600, color: colors.neutral900 },
  sectionSub: { margin: 0, fontSize: fonts.size.xs, color: colors.neutral500, marginTop: 2 },
  sectionBody: { display: "flex", flexDirection: "column", gap: spacing.s },

  row: { display: "flex", gap: spacing.m, flexWrap: "wrap" },
  field: { display: "flex", flexDirection: "column", gap: 6, minWidth: 120 },
  fieldLabel: { fontSize: fonts.size.s, fontWeight: fonts.weight.medium, color: colors.neutral700 },
  fieldHint: { fontSize: fonts.size.xs, color: colors.neutral500 },

  seg: { display: "flex", gap: spacing.s, flexWrap: "wrap" },
  segItem: {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-start",
    gap: 2,
    padding: `${spacing.s} ${spacing.m}`,
    borderWidth: strokes.xs,
    borderStyle: "solid",
    borderColor: colors.neutral200,
    borderRadius: radii.m,
    background: colors.neutral100,
    cursor: "pointer",
    minWidth: 200,
    flex: 1,
    fontFamily: "inherit",
    color: colors.neutral900,
    textAlign: "left",
    transition: "background-color 160ms",
  },
  segItemActive: { backgroundColor: colors.active.shade200 },
  segItemLabel: { fontSize: fonts.control.md, fontWeight: 600 },
  segItemSub: { fontSize: fonts.size.xs, color: colors.neutral500 },

  segCompact: {
    display: "inline-flex",
    gap: 4,
    backgroundColor: colors.neutral100,
    padding: 4,
    borderRadius: radii.full,
  },
  segCompactItem: {
    border: "none",
    background: "transparent",
    padding: "6px 12px",
    borderRadius: radii.full,
    cursor: "pointer",
    fontFamily: "inherit",
    fontSize: fonts.size.xs,
    fontWeight: 500,
    color: colors.neutral700,
  },
  segCompactItemActive: { backgroundColor: colors.active.shade700, color: colors.neutral100 },

  numberInput: {
    height: 40,
    padding: "0 10px",
    border: `${strokes.xs} solid ${colors.neutral200}`,
    borderRadius: radii.s,
    fontFamily: "inherit",
    fontSize: fonts.control.md,
    color: colors.neutral900,
    outline: "none",
    width: "100%",
    boxSizing: "border-box",
    backgroundColor: colors.neutral100,
  },

  lengthRow: { display: "flex", alignItems: "center", height: 40, width: "100%" },
  lengthValue: {
    flex: 1,
    height: "100%",
    border: "none",
    outline: "none",
    padding: `0 ${spacing.s}`,
    fontFamily: fonts.family.primary,
    fontSize: fonts.control.md,
    color: colors.neutral900,
    backgroundColor: colors.primary100,
    borderTopLeftRadius: radii.s,
    borderBottomLeftRadius: radii.s,
    textAlign: "center",
    minWidth: 0,
  },
  lengthUnit: {
    height: "100%",
    minWidth: 48,
    padding: `0 ${spacing.s}`,
    fontFamily: fonts.family.primary,
    fontSize: fonts.size.s,
    color: colors.neutral700,
    backgroundColor: colors.neutral100,
    borderWidth: strokes.xs,
    borderStyle: "solid",
    borderColor: colors.primary300,
    borderTopLeftRadius: 0,
    borderBottomLeftRadius: 0,
    borderTopRightRadius: radii.s,
    borderBottomRightRadius: radii.s,
    cursor: "pointer",
    whiteSpace: "nowrap",
    boxSizing: "border-box",
  },

  imageDrop: {
    width: "100%",
    borderWidth: "1.5px",
    borderStyle: "dashed",
    borderColor: colors.primary400,
    borderRadius: radii.l,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    transition: "background-color 0.15s ease, border-color 0.15s ease",
    outline: "none",
  },
  imageDropEmpty: { display: "flex", flexDirection: "column", alignItems: "center", gap: 4, color: colors.neutral700 },
  imageDropHint: { fontSize: fonts.control.md, color: colors.neutral900, fontWeight: fonts.weight.medium },
  imageDropSubHint: { fontSize: fonts.size.xs, color: colors.neutral500 },
  imageDropOverlay: {
    position: "absolute",
    inset: 0,
    backgroundColor: "rgba(0, 0, 0, 0.45)",
    borderRadius: radii.l,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    pointerEvents: "none",
    color: colors.neutral100,
    fontWeight: fonts.weight.semibold,
  },
  imageDropOverlayText: { fontSize: fonts.size.s, letterSpacing: 0.3 },
  imageDropClear: {
    position: "absolute",
    top: 6,
    right: 6,
    width: 24,
    height: 24,
    borderRadius: 999,
    border: "none",
    backgroundColor: "rgba(0, 0, 0, 0.55)",
    color: colors.neutral100,
    cursor: "pointer",
    fontSize: 16,
    lineHeight: 1,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 0,
  },

  previewWrap: {
    backgroundColor: colors.neutral200,
    borderRadius: radii.m,
    padding: spacing.m,
    border: `${strokes.xs} solid ${colors.neutral200}`,
    display: "flex",
    justifyContent: "center",
  },
  previewIframe: {
    width: "100%",
    maxWidth: "calc(78vh * 210 / 297)",
    aspectRatio: "210 / 297",
    border: `${strokes.xs} solid ${colors.neutral300}`,
    backgroundColor: colors.neutral100,
    borderRadius: radii.s,
    display: "block",
  },
};
