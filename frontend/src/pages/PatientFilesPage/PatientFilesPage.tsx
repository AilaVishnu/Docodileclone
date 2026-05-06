import React, { useMemo, useState } from "react";
import { colors, fonts, radii, spacing } from "../../styles/theme";
import { usePatients, Patient } from "../../hooks/usePatients";
import { ReactComponent as SearchIcon } from "../../assets/search.svg";
import { setPendingSessionNav } from "../../components/TopNav/SessionTrayButton";
import type { NavTab } from "../../components/SideNav";

// ─────────────────────────────────────────────────────────────────────────────
// Patient Files — a stack of physical-looking patient folders.
//
// Each patient is one horizontal "file strip" with their name on a tab. The
// search box rearranges the stack live (no separate dropdown / alphabet
// jump-strip — the user just types and the visible files filter+reorder).
// Clicking a strip expands it to show details; clicking "Open file →" routes
// to the Prescription view with that patient pre-selected.
//
// Colors and fonts come straight from the existing theme — file colors cycle
// through the primary / secondary / accent ramps so a given patient always
// renders in the same color.
// ─────────────────────────────────────────────────────────────────────────────

type SortKey = "name" | "recent" | "stale";

// Cycle of theme tokens for file colors. Picked for visual variety while
// staying inside the existing palette so the page reads as part of the
// product rather than a one-off illustration.
const FILE_PALETTE: Array<{ tab: string; body: string; ink: string }> = [
  { tab: colors.primary600, body: colors.primary500, ink: colors.neutral100 },
  { tab: colors.secondary500, body: colors.secondary400, ink: colors.neutral100 },
  { tab: colors.primary700, body: colors.primary600, ink: colors.neutral100 },
  { tab: colors.yellow200, body: colors.yellow100, ink: colors.neutral900 },
  { tab: colors.secondary600, body: colors.secondary500, ink: colors.neutral100 },
  { tab: colors.primary500, body: colors.primary400, ink: colors.neutral900 },
  { tab: colors.red200, body: colors.red100, ink: colors.neutral100 },
  { tab: colors.secondary400, body: colors.secondary300, ink: colors.neutral900 },
];

function paletteFor(name: string): typeof FILE_PALETTE[number] {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) | 0;
  return FILE_PALETTE[Math.abs(h) % FILE_PALETTE.length];
}

// Tags shown next to the patient name on each file. Kept derived from data we
// already have so we don't need backend changes — we can extend later.
type Tag = { label: string; tone: "soft" | "warn" | "info" };

function tagsFor(p: Patient): Tag[] {
  const out: Tag[] = [];
  if (p.lastVisitDate == null) {
    out.push({ label: "New", tone: "info" });
  } else {
    const days = Math.floor((Date.now() - new Date(p.lastVisitDate).getTime()) / 86400000);
    if (days <= 7) out.push({ label: "Recent", tone: "soft" });
    else if (days >= 180) out.push({ label: "Stale", tone: "warn" });
  }
  if (p.age != null) {
    const years = Math.floor(p.age / 12);
    if (years < 13) out.push({ label: "Pediatric", tone: "info" });
    else if (years >= 60) out.push({ label: "Senior", tone: "info" });
  }
  return out;
}

type Props = {
  onNavigate?: (tab: NavTab) => void;
};

export function PatientFilesPage({ onNavigate }: Props) {
  const { data: patients, loading, error } = usePatients();
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<SortKey>("name");

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    let list = q
      ? patients.filter((p) => p.name.toLowerCase().includes(q) || (p.phone ?? "").includes(q))
      : [...patients];

    if (sort === "name") {
      list.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sort === "recent") {
      list.sort(byLastVisit(true));
    } else {
      list.sort(byLastVisit(false));
    }
    return list;
  }, [patients, search, sort]);

  const handleOpen = (patient: Patient) => {
    setPendingSessionNav({ patient, appointmentId: null });
    onNavigate?.("Prescription");
  };

  return (
    <div style={styles.container}>
      <div style={styles.headerRow}>
        <h2 style={styles.title}>Patient Files</h2>
        <span style={styles.count}>
          {loading ? "Loading…" : `${visible.length} of ${patients.length}`}
        </span>
      </div>

      <div style={styles.toolbar}>
        <div style={styles.searchBox}>
          <SearchIcon style={styles.searchIcon} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Type to filter — files rearrange as you type…"
            style={styles.searchInput}
            autoFocus
          />
          {search && (
            <button type="button" style={styles.clearBtn} onClick={() => setSearch("")} aria-label="Clear search">
              ×
            </button>
          )}
        </div>
        <label style={styles.sortLabel}>
          <span style={styles.sortLabelText}>Sort</span>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as SortKey)}
            style={styles.sortSelect}
          >
            <option value="name">Name (A–Z)</option>
            <option value="recent">Most recent visit</option>
            <option value="stale">Oldest visit</option>
          </select>
        </label>
      </div>

      {/* The cabinet — files stack tightly, click to expand, search rearranges live. */}
      <div style={styles.cabinet}>
        {error && <p style={styles.statusMsg}>Failed to load: {error}</p>}
        {!error && !loading && visible.length === 0 && (
          <p style={styles.statusMsg}>
            {search ? `No files match “${search}”.` : "No patient files yet."}
          </p>
        )}
        {visible.map((p, i) => (
          <PatientFile
            key={p.id}
            patient={p}
            index={i}
            onOpen={() => handleOpen(p)}
          />
        ))}
      </div>
    </div>
  );
}

// ─── One patient file ───────────────────────────────────────────────────────

function PatientFile({
  patient,
  index,
  onOpen,
}: {
  patient: Patient;
  index: number;
  onOpen: () => void;
}) {
  const [hovered, setHovered] = useState(false);
  const palette = paletteFor(patient.name || "?");
  const tags = tagsFor(patient);
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={onOpen}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onOpen();
        }
      }}
      style={{
        ...styles.file,
        backgroundColor: palette.body,
        zIndex: hovered ? 5 : index,
        // Lift on hover so the file feels picked up rather than clicked.
        transform: hovered ? "translateY(-3px)" : "translateY(0)",
        boxShadow: hovered
          ? "0 12px 24px rgba(0, 0, 0, 0.12)"
          : "0 1px 0 rgba(0, 0, 0, 0.04)",
      }}
    >
      <div style={styles.fileHeader}>
        <span style={{ ...styles.fileTab, backgroundColor: palette.tab, color: palette.ink }}>
          <em style={styles.fileTabName}>{patient.name}</em>
        </span>
        <span style={styles.fileTags}>
          {tags.map((t) => (
            <span key={t.label} style={{ ...styles.tag, ...styles[`tag_${t.tone}`] }}>
              {t.label}
            </span>
          ))}
        </span>
        <span style={{ ...styles.fileLastVisit, color: palette.ink }}>
          {patient.lastVisitDate ? `Last visit · ${formatDate(patient.lastVisitDate)}` : "No visits yet"}
        </span>
      </div>

      {hovered && (
        <div style={{ ...styles.fileBody, color: palette.ink }}>
          <div style={styles.fileMetaGrid}>
            <Field label="ID" value={shortId(patient.id)} ink={palette.ink} />
            <Field label="Gender" value={patient.gender ?? "—"} ink={palette.ink} />
            <Field
              label="Age"
              value={patient.age != null ? `${Math.floor(patient.age / 12)} years` : "—"}
              ink={palette.ink}
            />
            <Field label="Phone" value={patient.phone ?? "—"} ink={palette.ink} />
          </div>
          <span style={{ ...styles.openHint, color: palette.ink }}>Click to open file →</span>
        </div>
      )}
    </div>
  );
}

function Field({ label, value, ink }: { label: string; value: string; ink: string }) {
  return (
    <div style={styles.field}>
      <span style={{ ...styles.fieldLabel, color: ink, opacity: 0.7 }}>{label}</span>
      <span style={{ ...styles.fieldValue, color: ink }}>{value}</span>
    </div>
  );
}

// ─── Helpers ────────────────────────────────────────────────────────────────

function byLastVisit(desc: boolean) {
  return (a: Patient, b: Patient) => {
    const av = a.lastVisitDate ?? "";
    const bv = b.lastVisitDate ?? "";
    if (av === bv) return a.name.localeCompare(b.name);
    if (av === "") return 1;
    if (bv === "") return -1;
    return desc ? bv.localeCompare(av) : av.localeCompare(bv);
  };
}

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString(undefined, { day: "2-digit", month: "short", year: "numeric" });
  } catch {
    return iso;
  }
}

function shortId(id: string): string {
  // First 8 chars of a UUID-ish id is plenty for a human-readable file label.
  return id.length > 8 ? id.slice(0, 8).toUpperCase() : id.toUpperCase();
}

// ─── Styles ─────────────────────────────────────────────────────────────────

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: "flex",
    flexDirection: "column",
    gap: spacing.l,
    width: "100%",
  },

  headerRow: {
    display: "flex",
    alignItems: "baseline",
    justifyContent: "space-between",
    gap: spacing.l,
  },
  title: {
    fontFamily: fonts.family.secondary,
    fontSize: fonts.size.h5,
    fontWeight: 400,
    color: colors.neutral900,
    margin: 0,
  },
  count: {
    fontFamily: fonts.family.primary,
    fontSize: fonts.size.s,
    color: colors.neutral500,
  },

  // Search + sort row.
  toolbar: {
    display: "flex",
    alignItems: "center",
    gap: spacing.m,
  },
  searchBox: {
    display: "flex",
    alignItems: "center",
    backgroundColor: colors.neutral100,
    borderRadius: radii.full,
    border: `1px solid ${colors.primary300}`,
    padding: `0 ${spacing.m}`,
    height: 44,
    flex: 1,
    gap: spacing.s,
  },
  searchIcon: {
    width: 18,
    height: 18,
    color: colors.neutral400,
  },
  searchInput: {
    flex: 1,
    border: "none",
    background: "transparent",
    outline: "none",
    fontFamily: fonts.family.primary,
    fontSize: fonts.size.m,
    color: colors.neutral900,
  },
  clearBtn: {
    width: 24,
    height: 24,
    borderRadius: "50%",
    border: "none",
    backgroundColor: colors.primary300,
    color: colors.neutral900,
    cursor: "pointer",
    fontSize: 16,
    lineHeight: "20px",
    padding: 0,
  },
  sortLabel: {
    display: "flex",
    alignItems: "center",
    gap: spacing.xs,
    height: 44,
    backgroundColor: colors.neutral100,
    borderRadius: radii.full,
    border: `1px solid ${colors.primary300}`,
    padding: `0 ${spacing.m}`,
  },
  sortLabelText: {
    fontFamily: fonts.family.primary,
    fontSize: fonts.size.xs,
    color: colors.neutral500,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  sortSelect: {
    border: "none",
    background: "transparent",
    outline: "none",
    fontFamily: fonts.family.primary,
    fontSize: fonts.size.s,
    color: colors.neutral900,
    cursor: "pointer",
  },

  // The cabinet itself — tight stack of files on the page background.
  cabinet: {
    display: "flex",
    flexDirection: "column",
    gap: 6,
    minHeight: 240,
  },

  // Each patient file — a horizontal colored strip.
  file: {
    position: "relative",
    borderRadius: radii.s,
    overflow: "hidden",
    cursor: "pointer",
    transition: "box-shadow 0.18s ease, transform 0.18s ease",
  },
  fileHeader: {
    width: "100%",
    minHeight: 44,
    display: "grid",
    gridTemplateColumns: "minmax(220px, 1fr) auto auto",
    alignItems: "center",
    gap: spacing.m,
    padding: `${spacing.xs} ${spacing.m}`,
    backgroundColor: "transparent",
    border: "none",
    cursor: "pointer",
    textAlign: "left",
  },
  // The italic-serif name lozenge sitting at the head of each file.
  fileTab: {
    display: "inline-flex",
    alignItems: "center",
    height: 30,
    padding: `0 ${spacing.m}`,
    borderRadius: `${radii.s}px ${radii.full}px ${radii.full}px ${radii.s}px`,
    fontFamily: fonts.family.secondary,
    fontStyle: "italic",
    fontSize: fonts.size.m,
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
    maxWidth: 300,
  },
  fileTabName: {
    fontStyle: "italic",
  },
  fileTags: {
    display: "flex",
    alignItems: "center",
    gap: spacing["2xs"],
    flexWrap: "nowrap",
  },
  tag: {
    fontFamily: fonts.family.primary,
    fontSize: fonts.size.caption,
    fontWeight: 600,
    letterSpacing: 0.4,
    textTransform: "uppercase",
    padding: "2px 8px",
    borderRadius: radii.full,
  },
  tag_soft: {
    backgroundColor: colors.green100,
    color: colors.neutral900,
  },
  tag_warn: {
    backgroundColor: colors.yellow100,
    color: colors.neutral900,
  },
  tag_info: {
    backgroundColor: colors.neutral100,
    color: colors.neutral900,
  },
  fileLastVisit: {
    fontFamily: fonts.family.primary,
    fontSize: fonts.size.xs,
    whiteSpace: "nowrap",
    opacity: 0.85,
  },

  // Expanded body — slides into view below the header strip.
  fileBody: {
    padding: `${spacing.m} ${spacing.l} ${spacing.l}`,
    borderTop: "1px solid rgba(0,0,0,0.08)",
    display: "flex",
    flexDirection: "column",
    gap: spacing.m,
  },
  fileMetaGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
    gap: spacing.m,
  },
  field: {
    display: "flex",
    flexDirection: "column",
    gap: 2,
  },
  fieldLabel: {
    fontFamily: fonts.family.primary,
    fontSize: fonts.size.caption,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  fieldValue: {
    fontFamily: fonts.family.secondary,
    fontSize: fonts.size.m,
  },
  openHint: {
    fontFamily: fonts.family.primary,
    fontSize: fonts.size.xs,
    fontStyle: "italic",
    opacity: 0.85,
  },

  statusMsg: {
    fontFamily: fonts.family.primary,
    fontSize: fonts.size.s,
    color: colors.neutral500,
    margin: 0,
    padding: spacing.l,
    textAlign: "center",
  },
};
