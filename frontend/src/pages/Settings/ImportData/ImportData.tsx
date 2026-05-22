import React, { useRef, useState } from "react";
import { colors, fonts, radii, spacing } from "../../../styles/theme";
import { API_BASE_URL } from "../../../apiConfig";
import { Toast } from "../../../components/Toast";
import { Modal } from "../../../components/Modal";

// ─────────────────────────────────────────────────────────────────────────────
// Settings → Import data. Self-service migration from another EMR into
// Docodile. Every source platform exports data in its own format, so the
// screen starts with a platform picker; choosing one opens the importer
// built for that platform's export.
//
// HealthPlix is fully supported — its four export CSVs are uploaded and the
// backend (POST /api/tenant/migration/healthplix) loads them into the JWT
// clinic. Re-running the same files upserts instead of duplicating. Other
// platforms are stubbed as "coming soon" until their format is added.
// ─────────────────────────────────────────────────────────────────────────────

type PlatformId = "healthplix" | "docon" | "other";

type Platform = {
  id: PlatformId;
  name: string;
  description: string;
  ready: boolean;
};

const PLATFORMS: Platform[] = [
  {
    id: "healthplix",
    name: "HealthPlix",
    description: "Upload the four HealthPlix export CSVs — patients, clinical, investigations and medications.",
    ready: true,
  },
  {
    id: "docon",
    name: "Docon",
    description: "Docon EMR export. Its format differs from HealthPlix — support is coming soon.",
    ready: false,
  },
  {
    id: "other",
    name: "Other EMR",
    description: "Migrating from a different system? Tell us which one and we'll add an importer for it.",
    ready: false,
  },
];

export function ImportData() {
  const [platform, setPlatform] = useState<PlatformId | null>(null);
  // The platform picker opens as a popup the moment this section loads, so
  // the user is asked where they're migrating from before anything else.
  const [pickerOpen, setPickerOpen] = useState(true);

  const choose = (id: PlatformId) => {
    setPlatform(id);
    setPickerOpen(false);
  };

  return (
    <>
      {platform === "healthplix" ? (
        <HealthPlixImport onBack={() => setPickerOpen(true)} />
      ) : platform ? (
        <ComingSoon
          name={PLATFORMS.find((p) => p.id === platform)!.name}
          onBack={() => setPickerOpen(true)}
        />
      ) : (
        <EmptyState onChoose={() => setPickerOpen(true)} />
      )}

      <Modal isOpen={pickerOpen} onClose={() => setPickerOpen(false)}>
        <PlatformPicker onPick={choose} />
      </Modal>
    </>
  );
}

// ── The popup: pick the source platform ─────────────────────────────────────

function PlatformPicker({ onPick }: { onPick: (id: PlatformId) => void }) {
  return (
    <div style={S.picker}>
      <h3 style={S.pickerTitle}>Where are you migrating from?</h3>
      <p style={S.pickerSub}>
        Each platform exports patient data in its own format — pick yours to
        open the matching importer.
      </p>
      <div style={S.platformList}>
        {PLATFORMS.map((p) => (
          <button
            key={p.id}
            type="button"
            disabled={!p.ready}
            onClick={() => p.ready && onPick(p.id)}
            style={{ ...S.platformCard, ...(p.ready ? null : S.platformCardDisabled) }}
          >
            <div style={S.platformHead}>
              <span style={S.platformName}>{p.name}</span>
              <span style={{ ...S.badge, ...(p.ready ? S.badgeReady : S.badgeSoon) }}>
                {p.ready ? "Ready" : "Coming soon"}
              </span>
            </div>
            <p style={S.platformDesc}>{p.description}</p>
          </button>
        ))}
      </div>
    </div>
  );
}

// Shown on the page behind the popup when no platform is chosen yet (e.g.
// the user dismissed the popup) — gives a way to reopen it.
function EmptyState({ onChoose }: { onChoose: () => void }) {
  return (
    <div style={S.wrap}>
      <div style={{ ...S.card, alignItems: "center", textAlign: "center" }}>
        <p style={S.intro}>Choose the platform you're migrating from to begin.</p>
        <button type="button" onClick={onChoose} style={S.importBtn}>
          Choose platform
        </button>
      </div>
    </div>
  );
}

function ComingSoon({ name, onBack }: { name: string; onBack: () => void }) {
  return (
    <div style={S.wrap}>
      <button type="button" onClick={onBack} style={S.backBtn}>
        ← Choose a different platform
      </button>
      <div style={S.card}>
        <h3 style={S.resultTitle}>{name} import — coming soon</h3>
        <p style={S.intro}>
          Importing from {name} isn't available yet. {name} exports data in a
          different format from HealthPlix, so it needs its own import screen.
          It's on the roadmap — for now, pick a supported platform.
        </p>
      </div>
    </div>
  );
}

// ── Step 2 (HealthPlix): upload the four export CSVs ────────────────────────

type SlotId = "patients" | "clinical" | "investigations" | "medications";

type Slot = {
  id: SlotId;
  label: string;
  hint: string;
  // Columns the CSV must carry to belong in this slot. Checked client-side
  // the moment a file is picked, and again authoritatively by the backend.
  required: string[];
};

const SLOTS: Slot[] = [
  { id: "patients",       label: "Patients",       hint: "APD export — names, age, contact details.",
    required: ["ID", "name"] },
  { id: "clinical",       label: "Clinical",       hint: "Visits — diagnosis, complaints, tests, follow-up.",
    required: ["org_person_bid_str", "visit_date"] },
  { id: "investigations", label: "Investigations", hint: "Vitals and lab results. Leave empty if you have none.",
    required: ["org_person_bid_str", "test_result_date", "test_name"] },
  { id: "medications",    label: "Medications",    hint: "Prescriptions for each visit.",
    required: ["patient_id", "visit_date", "pres"] },
];

// One picked file plus the slot columns it's missing (empty = looks right).
type PickedFile = { file: File; missing: string[] };

/**
 * Reads just the header row of a CSV and returns its lower-cased column
 * names. Only the first 64 KB is read — enough for any header, and avoids
 * pulling a multi-MB export into memory just to inspect column names.
 */
async function readHeaderColumns(file: File): Promise<string[]> {
  const text = await file.slice(0, 64 * 1024).text();
  const clean = text.charCodeAt(0) === 0xfeff ? text.slice(1) : text; // strip BOM
  const firstLine = clean.split(/\r?\n/)[0] ?? "";
  return firstLine
    .split(",")
    .map((c) => c.trim().replace(/^"|"$/g, "").toLowerCase());
}

type MigrationResult = {
  patients: number;
  visits: number;
  prescriptions: number;
  investigations: number;
  skipped: number;
  warnings: string[];
};

function HealthPlixImport({ onBack }: { onBack: () => void }) {
  const [files, setFiles] = useState<Partial<Record<SlotId, PickedFile>>>({});
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState<MigrationResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [toastMsg, setToastMsg] = useState("");

  const anyFile = SLOTS.some((s) => files[s.id]);
  // Any picked file whose header doesn't match its slot blocks the import.
  const hasMismatch = SLOTS.some((s) => (files[s.id]?.missing.length ?? 0) > 0);

  const handlePick = async (slot: Slot, file: File) => {
    let missing: string[] = [];
    try {
      const cols = await readHeaderColumns(file);
      missing = slot.required.filter((r) => !cols.includes(r.toLowerCase()));
    } catch {
      // Unreadable as text — treat as fully mismatched so it can't import.
      missing = slot.required;
    }
    setFiles((cur) => ({ ...cur, [slot.id]: { file, missing } }));
  };

  const handleImport = async () => {
    if (!anyFile || hasMismatch) return;
    setImporting(true);
    setError(null);
    setResult(null);
    try {
      const form = new FormData();
      SLOTS.forEach((s) => {
        const picked = files[s.id];
        if (picked) form.append(s.id, picked.file);
      });
      const token = localStorage.getItem("docodile_token");
      const res = await fetch(`${API_BASE_URL}/api/tenant/migration/healthplix`, {
        method: "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: form,
      });
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.error || `HTTP ${res.status}`);
      }
      const data: MigrationResult = await res.json();
      setResult(data);
      setFiles({});
      setToastMsg("Migration complete");
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setImporting(false);
    }
  };

  return (
    <div style={S.wrap}>
      <button type="button" onClick={onBack} style={S.backBtn}>
        ← Choose a different platform
      </button>

      <div style={S.card}>
        <p style={S.intro}>
          Migrating from <strong>HealthPlix</strong>. Upload your export files
          below — the four files are optional, import the ones you have.
          Running the same files again is safe: existing records are updated
          in place, not duplicated.
        </p>

        <div style={S.slots}>
          {SLOTS.map((slot) => (
            <FileSlot
              key={slot.id}
              slot={slot}
              picked={files[slot.id]}
              onPick={(f) => handlePick(slot, f)}
              onClear={() => setFiles((cur) => {
                const next = { ...cur };
                delete next[slot.id];
                return next;
              })}
            />
          ))}
        </div>

        <div style={S.actions}>
          <button
            type="button"
            onClick={handleImport}
            disabled={!anyFile || hasMismatch || importing}
            style={{ ...S.importBtn, ...(!anyFile || hasMismatch || importing ? S.importBtnDisabled : null) }}
          >
            {importing ? "Importing…" : "Import data"}
          </button>
        </div>

        {hasMismatch && (
          <div style={S.error}>
            One or more files don't match their slot — fix the highlighted
            slot(s) before importing.
          </div>
        )}

        {error && <div style={S.error}>Couldn't import: {error}</div>}
      </div>

      {result && (
        <div style={S.card}>
          <h3 style={S.resultTitle}>Migration summary</h3>
          <div style={S.statRow}>
            <Stat label="Patients" value={result.patients} />
            <Stat label="Visits" value={result.visits} />
            <Stat label="Prescriptions" value={result.prescriptions} />
            <Stat label="Investigations" value={result.investigations} />
            <Stat label="Skipped rows" value={result.skipped} muted />
          </div>
          {result.warnings.length > 0 && (
            <div style={S.warnBox}>
              <div style={S.warnHead}>{result.warnings.length} warning{result.warnings.length === 1 ? "" : "s"}</div>
              <ul style={S.warnList}>
                {result.warnings.map((w, i) => (
                  <li key={i} style={S.warnItem}>{w}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      <Toast message={toastMsg} isVisible={!!toastMsg} onClose={() => setToastMsg("")} />
    </div>
  );
}

function FileSlot({
  slot,
  picked,
  onPick,
  onClear,
}: {
  slot: Slot;
  picked?: PickedFile;
  onPick: (f: File) => void;
  onClear: () => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const mismatch = (picked?.missing.length ?? 0) > 0;

  const slotStyle = {
    ...S.slot,
    ...(picked && !mismatch ? S.slotFilled : null),
    ...(mismatch ? S.slotMismatch : null),
  };

  return (
    <div style={slotStyle}>
      <input
        ref={inputRef}
        type="file"
        accept=".csv,text/csv"
        style={{ display: "none" }}
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) onPick(f);
          e.target.value = "";
        }}
      />
      <div style={S.slotHead}>
        <span style={S.slotLabel}>{slot.label}</span>
        {picked && (
          <button type="button" onClick={onClear} style={S.clearBtn}>
            Remove
          </button>
        )}
      </div>
      <p style={S.slotHint}>{slot.hint}</p>
      {picked ? (
        <>
          <div style={S.fileChip}>{picked.file.name}</div>
          {mismatch && (
            <div style={S.slotWarn}>
              This doesn't look like a {slot.label} export — missing column
              {picked.missing.length === 1 ? "" : "s"}:{" "}
              {picked.missing.join(", ")}.
            </div>
          )}
        </>
      ) : (
        <button type="button" onClick={() => inputRef.current?.click()} style={S.pickBtn}>
          Choose CSV
        </button>
      )}
    </div>
  );
}

function Stat({ label, value, muted }: { label: string; value: number; muted?: boolean }) {
  return (
    <div style={S.stat}>
      <div style={{ ...S.statValue, ...(muted ? { color: colors.neutral500 } : null) }}>{value}</div>
      <div style={S.statLabel}>{label}</div>
    </div>
  );
}

const S: Record<string, React.CSSProperties> = {
  wrap: { display: "flex", flexDirection: "column", gap: spacing.l, minWidth: 0 },
  card: {
    backgroundColor: colors.primary100,
    borderRadius: radii["2xl"],
    padding: spacing.xl,
    display: "flex",
    flexDirection: "column",
    gap: spacing.l,
  },
  intro: {
    margin: 0,
    fontFamily: fonts.family.primary,
    fontSize: fonts.control.sm,
    color: colors.neutral600,
    lineHeight: 1.5,
  },

  // ── Platform picker popup ────────────────────────────────────────────────
  picker: {
    display: "flex",
    flexDirection: "column",
    gap: spacing.xs,
    minWidth: 380,
  },
  pickerTitle: {
    margin: 0,
    fontFamily: fonts.family.secondary,
    fontSize: fonts.size.h6,
    fontWeight: fonts.weight.regular,
    color: colors.neutral900,
    textAlign: "center",
  },
  pickerSub: {
    margin: 0,
    fontFamily: fonts.family.primary,
    fontSize: fonts.control.sm,
    color: colors.neutral600,
    lineHeight: 1.5,
    textAlign: "center",
  },
  platformList: {
    display: "flex",
    flexDirection: "column",
    gap: spacing.s,
    marginTop: spacing.s,
  },
  platformCard: {
    textAlign: "left",
    backgroundColor: colors.neutral100,
    border: `1px solid ${colors.primary300}`,
    borderRadius: radii.l,
    padding: spacing.l,
    display: "flex",
    flexDirection: "column",
    gap: spacing.xs,
    cursor: "pointer",
    fontFamily: fonts.family.primary,
  },
  platformCardDisabled: {
    opacity: 0.6,
    cursor: "not-allowed",
  },
  platformHead: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.xs,
  },
  platformName: {
    fontFamily: fonts.family.primary,
    fontSize: fonts.control.md,
    fontWeight: fonts.weight.medium,
    color: colors.neutral900,
  },
  platformDesc: {
    margin: 0,
    fontFamily: fonts.family.primary,
    fontSize: fonts.control.xs,
    color: colors.neutral500,
    lineHeight: 1.45,
  },
  badge: {
    fontFamily: fonts.family.primary,
    fontSize: fonts.control.xs,
    borderRadius: radii.full,
    padding: "2px 10px",
    whiteSpace: "nowrap",
  },
  badgeReady: {
    color: colors.neutral100,
    backgroundColor: colors.primary700,
  },
  badgeSoon: {
    color: colors.neutral600,
    backgroundColor: colors.primary200,
  },
  backBtn: {
    alignSelf: "flex-start",
    fontFamily: fonts.family.primary,
    fontSize: fonts.control.sm,
    color: colors.primary700,
    backgroundColor: "transparent",
    border: "none",
    cursor: "pointer",
    padding: 0,
  },

  // ── HealthPlix file slots ────────────────────────────────────────────────
  slots: {
    display: "grid",
    gridTemplateColumns: "repeat(2, 1fr)",
    gap: spacing.m,
  },
  slot: {
    backgroundColor: colors.neutral100,
    border: `1px solid ${colors.primary300}`,
    borderRadius: radii.l,
    padding: spacing.l,
    display: "flex",
    flexDirection: "column",
    gap: spacing.xs,
  },
  slotFilled: {
    borderColor: colors.primary700,
  },
  slotMismatch: {
    borderColor: colors.red100,
    backgroundColor: colors.redAlpha10,
  },
  slotWarn: {
    marginTop: spacing.xs,
    fontFamily: fonts.family.primary,
    fontSize: fonts.control.xs,
    color: colors.red200,
    lineHeight: 1.4,
  },
  slotHead: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },
  slotLabel: {
    fontFamily: fonts.family.primary,
    fontSize: fonts.control.sm,
    fontWeight: fonts.weight.medium,
    color: colors.neutral900,
  },
  slotHint: {
    margin: 0,
    fontFamily: fonts.family.primary,
    fontSize: fonts.control.xs,
    color: colors.neutral500,
    lineHeight: 1.4,
  },
  pickBtn: {
    marginTop: spacing.xs,
    alignSelf: "flex-start",
    fontFamily: fonts.family.primary,
    fontSize: fonts.control.sm,
    color: colors.primary700,
    backgroundColor: "transparent",
    border: `1px solid ${colors.primary300}`,
    borderRadius: radii.full,
    padding: "6px 16px",
    cursor: "pointer",
  },
  fileChip: {
    marginTop: spacing.xs,
    fontFamily: fonts.family.primary,
    fontSize: fonts.control.xs,
    color: colors.neutral900,
    backgroundColor: colors.primary100,
    borderRadius: radii.s,
    padding: "6px 10px",
    wordBreak: "break-all",
  },
  clearBtn: {
    fontFamily: fonts.family.primary,
    fontSize: fonts.control.xs,
    color: colors.red100,
    backgroundColor: "transparent",
    border: "none",
    cursor: "pointer",
    padding: 0,
  },
  actions: {
    display: "flex",
    justifyContent: "flex-end",
  },
  importBtn: {
    fontFamily: fonts.family.primary,
    fontSize: fonts.control.sm,
    color: colors.neutral100,
    backgroundColor: colors.primary700,
    border: "none",
    borderRadius: radii.full,
    padding: "10px 24px",
    cursor: "pointer",
  },
  importBtnDisabled: {
    opacity: 0.45,
    cursor: "not-allowed",
  },
  error: {
    fontFamily: fonts.family.primary,
    fontSize: fonts.control.sm,
    color: colors.red100,
  },
  resultTitle: {
    margin: 0,
    fontFamily: fonts.family.secondary,
    fontSize: fonts.size.s,
    fontWeight: fonts.weight.regular,
    color: colors.neutral900,
  },
  statRow: {
    display: "flex",
    flexWrap: "wrap",
    gap: spacing.l,
  },
  stat: {
    display: "flex",
    flexDirection: "column",
    gap: 2,
  },
  statValue: {
    fontFamily: fonts.family.secondary,
    fontSize: fonts.size.h6,
    color: colors.primary700,
  },
  statLabel: {
    fontFamily: fonts.family.primary,
    fontSize: fonts.control.xs,
    color: colors.neutral500,
  },
  warnBox: {
    backgroundColor: colors.neutral100,
    borderRadius: radii.l,
    padding: spacing.m,
    display: "flex",
    flexDirection: "column",
    gap: spacing.xs,
  },
  warnHead: {
    fontFamily: fonts.family.primary,
    fontSize: fonts.control.xs,
    fontWeight: fonts.weight.medium,
    color: colors.neutral600,
  },
  warnList: {
    margin: 0,
    paddingLeft: spacing.l,
    display: "flex",
    flexDirection: "column",
    gap: 2,
  },
  warnItem: {
    fontFamily: fonts.family.primary,
    fontSize: fonts.control.xs,
    color: colors.neutral600,
    lineHeight: 1.4,
  },
};
