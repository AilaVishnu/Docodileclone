import React, { useEffect, useMemo, useRef, useState } from "react";
import { colors, fonts, radii, spacing, fluidSpacing } from "../../styles/theme";
import { PageHeader } from "../../components/PageHeader/PageHeader";
import { usePatients, Patient } from "../../hooks/usePatients";
import { useDoctors } from "../../hooks/useDoctors";
import { API_BASE_URL } from "../../apiConfig";
import { ReactComponent as SearchIcon } from "../../assets/search.svg";
import { Select } from "../../components/Input/Select/Select";
import { DatePicker } from "../../components/DatePicker/DatePicker";
import { styles as queueStyles } from "../../components/AppointmentQueue/AppointmentQueue.styles";
import { setPendingSessionNav } from "../../components/TopNav/SessionTrayButton";
import type { NavTab } from "../../components/SideNav";

// Patient Files — stack of physical-looking folders. Each row is the folder-tab
// shape from Figma (assets/patient_folder.svg) stretched horizontally; rows
// overlap so only the top tab strip of each is visible. Click → Prescription.

type SortKey = "name" | "recent" | "stale";

const ANY = "__any__";

type Props = {
  onNavigate?: (tab: NavTab) => void;
  initialSelectedId?: string | null;
};

export function PatientFilesPage({ onNavigate, initialSelectedId }: Props) {
  const { data: patients, loading, error } = usePatients();
  const { data: doctors } = useDoctors();

  const [search, setSearch] = useState("");
  const [department, setDepartment] = useState<string>(ANY);
  const [doctorId, setDoctorId] = useState<string>(ANY);
  // Empty string = no explicit sort yet (Select shows the placeholder). The
  // visible() memo treats "" as the default name-asc behaviour.
  const [sort, setSort] = useState<SortKey | "">("");
  // Last-visit date range. Both bounds are optional; either alone narrows
  // open-ended.
  const [dateFrom, setDateFrom] = useState<Date | null>(null);
  const [dateTo, setDateTo] = useState<Date | null>(null);
  const [openPicker, setOpenPicker] = useState<"from" | "to" | null>(null);
  // Filters are tucked behind a funnel toggle next to the search bar — most
  // visits are a quick name/phone search, no need to occupy permanent space.
  // Auto-open when any filter is set so users see what's currently applied.
  const hasActiveFilter = department !== ANY || doctorId !== ANY || dateFrom != null || dateTo != null || sort !== "";
  const [filtersOpen, setFiltersOpen] = useState(false);

  // Departments come from the clinic's configured list (set in Build Your
  // Clinic), not from staff data. That way the filter shows every
  // department the clinic supports even before a doctor has been added to
  // it. Picking a department then narrows the doctor dropdown to staff
  // tagged with that department.
  const [clinicDepartments, setClinicDepartments] = useState<string[]>([]);
  useEffect(() => {
    const token = localStorage.getItem("docodile_token");
    const clinicId = localStorage.getItem("docodile_clinic_id");
    if (!token) return;
    let cancelled = false;
    fetch(`${API_BASE_URL}/api/tenant/clinics`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => (res.ok ? res.json() : []))
      .then((all: Array<{ id: string; speciality?: string }>) => {
        if (cancelled) return;
        const active = clinicId ? all.find((c) => c.id === clinicId) : all[0];
        const list = (active?.speciality || "")
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean);
        setClinicDepartments(list);
      })
      .catch(() => { /* fall back to empty list */ });
    return () => { cancelled = true; };
  }, []);
  const departments = clinicDepartments;

  const doctorOptions = useMemo(() => {
    return department === ANY
      ? doctors
      : doctors.filter((d) => d.department === department);
  }, [doctors, department]);

  const visible = useMemo(() => {
    // A patient file only makes sense in the context of a treating doctor.
    // If the clinic has no doctors yet, hide everything so the empty state
    // can prompt the admin to add staff first.
    if (doctors.length === 0) return [] as Patient[];
    const q = search.trim().toLowerCase();
    // Match across every fielded scalar we have on the patient record.
    // Diagnosis / prescription / treatment / service search needs a backend
    // endpoint (full-text over visit notes & Rx); the frontend just swaps
    // its filter for that endpoint when it lands.
    let list = q
      ? patients.filter((p) => matchesQuery(p, q) !== null)
      : [...patients];

    if (dateFrom || dateTo) {
      const fromMs = dateFrom ? startOfDay(dateFrom).getTime() : -Infinity;
      const toMs = dateTo ? endOfDay(dateTo).getTime() : Infinity;
      list = list.filter((p) => {
        if (!p.lastVisitDate) return false;
        const t = new Date(p.lastVisitDate).getTime();
        return t >= fromMs && t <= toMs;
      });
    }

    // Doctor / department filter — match against fields the backend resolved
    // from the patient's visits and bookings. `?? []` guards against an
    // older backend response that hasn't been restarted to include the
    // new fields yet.
    if (doctorId !== ANY) {
      list = list.filter((p) => (p.treatingDoctorIds ?? []).includes(doctorId));
    } else if (department !== ANY) {
      list = list.filter((p) => (p.treatingDepartments ?? []).includes(department));
    }

    if (sort === "recent") list.sort(byLastVisit(true));
    else if (sort === "stale") list.sort(byLastVisit(false));
    else list.sort((a, b) => a.name.localeCompare(b.name));
    return list;
  }, [patients, search, sort, dateFrom, dateTo, doctors, department, doctorId]);

  // ── Progressive rendering ──────────────────────────────────────────────
  // A clinic can have thousands of patients; rendering every row at once is
  // the visible lag on each page open. Render a small initial batch and
  // grow it as a sentinel near the list end scrolls into view.
  const PAGE = 60;
  const [limit, setLimit] = useState(PAGE);
  const shown = visible.slice(0, limit);
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  // Top of the page — selecting a patient scrolls here so the open file and
  // its action buttons (which live at the top of the right pane) are in view
  // even when the index list was scrolled far down.
  const topRef = useRef<HTMLDivElement | null>(null);
  // Any search/filter change rebuilds the list — restart the window.
  useEffect(() => {
    setLimit(PAGE);
  }, [search, sort, dateFrom, dateTo, department, doctorId]);
  useEffect(() => {
    const el = sentinelRef.current;
    if (!el || limit >= visible.length) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setLimit((n) => Math.min(n + PAGE, visible.length));
        }
      },
      // Grow a little before the sentinel is actually on screen so the
      // next batch is ready by the time the user scrolls to it.
      { rootMargin: "600px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [limit, visible.length]);

  const handleOpen = (patient: Patient, opts?: { initialAction?: number }) => {
    // Record where the doctor came from so the Prescription page's Back
    // button can route them back to Patient Files rather than dumping
    // them on the prescription home picker. `initialAction` lets a
    // specific left-rail tab (Visits/Files/Timeline/Bills) be pre-
    // selected when the doctor jumps in for a specific reason.
    setPendingSessionNav({
      patient,
      appointmentId: null,
      returnTab: "Patient Files",
      initialAction: opts?.initialAction,
    });
    onNavigate?.("Prescription");
  };

  return (
    <div ref={topRef} style={styles.container}>
      <PageHeader title="Patient Files" />

      {/* Single centered column: search (with inline filter toggle) → optional
          filter dropdowns → results list. No right-hand preview. */}
      <div style={styles.content}>
          <div style={styles.searchBox}>
            <SearchIcon style={styles.searchIcon} />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, phone, email, ID"
              style={styles.searchInput}
            />
            {search && (
              <button type="button" style={styles.clearBtn} onClick={() => setSearch("")} aria-label="Clear search">
                ×
              </button>
            )}
            <button
              type="button"
              onClick={() => setFiltersOpen((v) => !v)}
              aria-label={filtersOpen ? "Hide filters" : "Show filters"}
              aria-pressed={filtersOpen}
              style={{
                ...styles.filterBtn,
                color: filtersOpen || hasActiveFilter ? colors.neutral900 : colors.neutral500,
              }}
            >
              <FunnelIcon />
              {hasActiveFilter && <span style={styles.filterDot} />}
            </button>
          </div>

          {filtersOpen && (
          <div style={styles.advancedFilters}>
            <Select
              value={department === ANY ? "" : department}
              onChange={(v) => { setDepartment(v || ANY); setDoctorId(ANY); }}
              placeholder="Select department"
              options={[
                { label: "Any department", value: ANY },
                ...departments.map((d) => ({ label: d, value: d })),
              ]}
            />
            <Select
              value={doctorId === ANY ? "" : doctorId}
              onChange={(v) => setDoctorId(v || ANY)}
              placeholder="Select doctor"
              options={[
                { label: "Any doctor", value: ANY },
                ...doctorOptions.map((d) => ({ label: d.name, value: d.id })),
              ]}
            />
            <div style={styles.dateRangeCell}>
              <DateTrigger
                label="From"
                date={dateFrom}
                active={openPicker === "from"}
                onClick={() => setOpenPicker(openPicker === "from" ? null : "from")}
                onClear={() => setDateFrom(null)}
              />
              <span style={styles.dateRangeSeparator}>→</span>
              <DateTrigger
                label="To"
                date={dateTo}
                active={openPicker === "to"}
                onClick={() => setOpenPicker(openPicker === "to" ? null : "to")}
                onClear={() => setDateTo(null)}
              />
              {openPicker === "from" && (
                <DatePicker
                  selectedDate={dateFrom ?? new Date()}
                  onSelect={(d) => { setDateFrom(d); setOpenPicker(null); }}
                  onClose={() => setOpenPicker(null)}
                />
              )}
              {openPicker === "to" && (
                <DatePicker
                  selectedDate={dateTo ?? new Date()}
                  onSelect={(d) => { setDateTo(d); setOpenPicker(null); }}
                  onClose={() => setOpenPicker(null)}
                />
              )}
            </div>
            <Select
              value={sort}
              onChange={(v) => setSort(v as SortKey | "")}
              placeholder="Sort by"
              options={[
                { label: "Name (A–Z)", value: "name" },
                { label: "Most recent", value: "recent" },
                { label: "Oldest", value: "stale" },
              ]}
            />
          </div>
          )}

          {/* Reuses AppointmentQueue's table styles so the patient list reads
              as the same component family as the appointment queue. */}
          <div style={queueStyles.tableContainer}>
            {error ? (
              <p style={styles.statusMsg}>Failed to load: {error}</p>
            ) : !loading && visible.length === 0 ? (
              <p style={styles.statusMsg}>
                {search ? `No files match “${search}”.` : "No patient files."}
              </p>
            ) : (
              <>
              <table style={queueStyles.table}>
                <colgroup>
                  <col style={{ width: "10%" }} />
                  <col style={{ width: "auto" }} />
                  <col style={{ width: "26%" }} />
                  <col style={{ width: "30%" }} />
                </colgroup>
                <thead>
                  <tr>
                    <th style={{ ...queueStyles.th, paddingLeft: 8, paddingRight: 8 }}>#</th>
                    <th style={{ ...queueStyles.th, paddingLeft: 8, paddingRight: 8 }}>Name</th>
                    <th style={{ ...queueStyles.th, textAlign: "center" }}>Phone</th>
                    <th style={{ ...queueStyles.th, textAlign: "left" }}>
                      {search.trim() ? "Match" : "Email"}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {shown.map((p) => (
                    <IndexRow
                      key={p.id}
                      patient={p}
                      query={search.trim().toLowerCase()}
                      selected={false}
                      onSelect={() => handleOpen(p)}
                    />
                  ))}
                </tbody>
              </table>
              {limit < visible.length && (
                <div ref={sentinelRef} style={{ height: 1 }} />
              )}
              </>
            )}
          </div>

          <div style={styles.indexCount}>
            {loading ? "Loading…" : `${visible.length} of ${patients.length} patients`}
          </div>
      </div>
    </div>
  );
}


// ─── Index row (left pane) ──────────────────────────────────────────────────
//
// Renders as a <tr> matching AppointmentQueue's QueueTable visual language —
// same `tr`/`td`/`nameInner`/`namePrimary`/`nameMeta` styles, same hover
// behaviour. Selected row tints with primary200 (the same "active row" cue
// QueueTable uses for the IN_PROGRESS appointment).
function IndexRow({
  patient,
  query,
  selected,
  onSelect,
}: {
  patient: Patient;
  query: string;
  selected: boolean;
  onSelect: () => void;
}) {
  const code = patientCode(patient);
  const ageShort = genderAgeShort(patient);
  const phone = patient.phone ?? "—";
  const email = patient.email ?? "—";
  const matchField = query ? matchesQuery(patient, query) : null;
  const baseBg = selected ? colors.primary200 : "transparent";
  return (
    <tr
      onClick={onSelect}
      style={{ ...queueStyles.tr, backgroundColor: baseBg, cursor: "pointer" }}
      onMouseEnter={(e) => {
        if (!selected) (e.currentTarget as HTMLElement).style.backgroundColor = "rgba(0,0,0,0.018)";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLElement).style.backgroundColor = baseBg;
      }}
    >
      <td style={queueStyles.serialCell}>{code}</td>
      <td style={queueStyles.nameCell}>
        {/* "<name> - <gender> <age>", all one colour/size (e.g. "Ramesh - M 64"). */}
        <div style={queueStyles.nameInner}>
          <span style={queueStyles.namePrimary}>
            {patient.name}{ageShort !== "—" ? ` - ${ageShort}` : ""}
          </span>
        </div>
      </td>
      <td style={{ ...queueStyles.td, textAlign: "center", color: phone === "—" ? colors.neutral400 : undefined }}>{phone}</td>
      <td style={{ ...queueStyles.td, textAlign: "left", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
        {query ? (
          matchField ? (
            <span>
              <span style={{ color: colors.neutral500 }}>{matchField.field} · </span>
              <HighlightSnippet value={matchField.value} query={query} />
            </span>
          ) : null
        ) : (
          <span style={{ color: email === "—" ? colors.neutral400 : undefined }}>{email}</span>
        )}
      </td>
    </tr>
  );
}

// ─── Search ─────────────────────────────────────────────────────────────────
//
// Matches the query against every scalar field we have on the patient. Returns
// the field name that matched (so the row can show "matched in: phone") or
// null if nothing matched.
//
// Backend follow-up: when a /api/patients/search?q= endpoint lands that joins
// visit notes / prescriptions / treatments / services, replace the body of
// this function with a snippet from the response (e.g. "fever, amoxicillin").
type MatchField = "name" | "phone" | "email" | "ID";
type Match = { field: MatchField; value: string };
function matchesQuery(p: Patient, q: string): Match | null {
  if (p.name.toLowerCase().includes(q)) return { field: "name", value: p.name };
  if ((p.phone ?? "").toLowerCase().includes(q)) return { field: "phone", value: p.phone! };
  if ((p.email ?? "").toLowerCase().includes(q)) return { field: "email", value: p.email! };
  if (patientCode(p).toLowerCase().includes(q)) return { field: "ID", value: patientCode(p) };
  return null;
}

// Renders `value` with the matched `query` substring highlighted (the app's
// light peach + medium weight), Google-style. Case-insensitive, first match.
function HighlightSnippet({ value, query }: { value: string; query: string }) {
  const i = value.toLowerCase().indexOf(query.toLowerCase());
  if (i < 0) return <>{value}</>;
  return (
    <>
      {value.slice(0, i)}
      <mark style={{ backgroundColor: colors.primary400, color: colors.neutral900, fontWeight: 500, borderRadius: 3, padding: "0 2px" }}>
        {value.slice(i, i + query.length)}
      </mark>
      {value.slice(i + query.length)}
    </>
  );
}

// Funnel glyph for the filter toggle next to the search bar. Inline SVG —
// matches stroke weight of TopNav icons (1.5).
function FunnelIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M3 5h18l-7 8v7l-4-2v-5L3 5z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// Date range helpers — endpoints are inclusive (whole-day granularity).
function startOfDay(d: Date): Date {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}
function endOfDay(d: Date): Date {
  const x = new Date(d);
  x.setHours(23, 59, 59, 999);
  return x;
}

// Trigger pill for one end of the date range. Mirrors the Select container
// (40px tall, neutral-300 border, rounds to radii.m) so the row reads as a
// single unified filter.
function DateTrigger({
  label,
  date,
  active,
  onClick,
  onClear,
}: {
  label: string;
  date: Date | null;
  active: boolean;
  onClick: () => void;
  onClear: () => void;
}) {
  const filled = date != null;
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        ...styles.dateTrigger,
        borderColor: active || filled ? colors.neutral900 : colors.neutral300,
        color: filled ? colors.neutral900 : colors.neutral400,
      }}
    >
      <span>
        {filled
          ? date!.toLocaleDateString(undefined, { day: "2-digit", month: "short", year: "numeric" })
          : label}
      </span>
      {filled && (
        <span
          role="button"
          aria-label={`Clear ${label}`}
          onClick={(e) => { e.stopPropagation(); onClear(); }}
          style={styles.dateTriggerClear}
        >
          ×
        </span>
      )}
    </button>
  );
}

// Compact "M|25" / "F|30" / "U|—" — first letter of gender, pipe, age in years.
// Pipe matches the Figma design (node 2503:5154) for the patient meta line.
function genderAgeShort(p: Patient): string {
  const g = p.gender ? p.gender.charAt(0).toUpperCase() : "";
  const y = p.age != null ? Math.floor(p.age / 12) : null;
  if (!g && y == null) return "—";
  if (g && y != null) return `${g} ${y}`;
  return g || (y != null ? String(y) : "—");
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

// Patient's display code. Uses the real per-clinic sequential number from the
// backend ("T###"); falls back to the UUID-hash code for any legacy row that
// predates the backend backfill (displayNo null).
function patientCode(p: Pick<Patient, "id" | "displayNo">): string {
  if (p.displayNo != null) return `T${p.displayNo.toString().padStart(3, "0")}`;
  return shortCode(p.id);
}

// Stable 2–3 digit "T" code derived from the UUID — fallback only, for rows
// without a real displayNo. Same patient always gets the same code.
function shortCode(id: string): string {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) | 0;
  const n = Math.abs(h) % 1000;
  return `T${n.toString().padStart(3, "0")}`;
}

// ─── Styles ─────────────────────────────────────────────────────────────────

const styles: Record<string, React.CSSProperties> = {
  // Own scroll container filling <main> (like the Appointments / Rx Pad
  // queues) so the shared <PageHeader> can stick to the very top. No top
  // padding — the sticky bar hugs the top; the content gap lives below it.
  container: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    display: "flex",
    flexDirection: "column",
    padding: `0 ${fluidSpacing.outerX} ${fluidSpacing.outerY}`,
    overflowY: "auto",
    overflowX: "hidden",
  },

  // Single centered column: search + filters + results. No right preview.
  content: {
    width: "100%",
    maxWidth: 820,
    marginLeft: "auto",
    marginRight: "auto",
    marginTop: "var(--main-gap, 24px)",
    minWidth: 0,
    display: "flex",
    flexDirection: "column",
    gap: spacing.s,
  },

  // Same dimensions as TopNav.searchBarContainer (40px tall, 55px radius,
  // 0 16 padding, 12px gap) so the two pills feel consistent — only the
  // background swaps to white per the page spec.
  searchBox: {
    display: "flex",
    alignItems: "center",
    width: "100%",
    height: "var(--search-h)",
    gap: 12,
    padding: "0 16px",
    borderRadius: 55,
    backgroundColor: colors.neutral100,
    boxSizing: "border-box",
  },
  searchIcon: {
    width: "var(--search-icon)",
    height: "var(--search-icon)",
    color: colors.neutral400,
    flexShrink: 0,
  },
  searchInput: {
    flex: 1,
    minWidth: 0,
    border: "none",
    background: "transparent",
    outline: "none",
    fontFamily: fonts.family.primary,
    fontSize: "var(--search-fs)",
    color: colors.neutral900,
  },
  clearBtn: {
    width: 22,
    height: 22,
    borderRadius: "50%",
    border: "none",
    backgroundColor: colors.neutral200,
    color: colors.neutral900,
    cursor: "pointer",
    fontSize: 14,
    lineHeight: "18px",
    padding: 0,
    flexShrink: 0,
  },
  filterBtn: {
    position: "relative",
    width: 28,
    height: 28,
    border: "none",
    background: "transparent",
    padding: 0,
    cursor: "pointer",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    transition: "color 0.15s ease",
  },
  filterDot: {
    position: "absolute",
    top: 4,
    right: 4,
    width: 6,
    height: 6,
    borderRadius: "50%",
    backgroundColor: colors.primary600,
  },
  // ── Index pane ────────────────────────────────────────────────────────
  advancedFilters: {
    display: "grid",
    gridTemplateColumns: "repeat(2, 1fr)",
    gap: spacing.xs,
    paddingInline: 4,
  },
  dateRangeCell: {
    position: "relative",
    display: "flex",
    alignItems: "center",
    gap: spacing["2xs"],
    minWidth: 0,
  },
  dateRangeSeparator: {
    fontFamily: fonts.family.primary,
    fontSize: fonts.control.sm,
    color: colors.neutral500,
    flexShrink: 0,
  },
  dateTrigger: {
    flex: 1,
    minWidth: 0,
    // Track the shared input height so it matches the Select boxes on both
    // tiers (40px baseline / 32px compact). Was hardcoded 40 → taller than the
    // Selects below 1440.
    height: "var(--input-h, 40px)",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing["2xs"],
    paddingInline: spacing.xs,
    border: `1px solid ${colors.neutral300}`,
    borderRadius: radii.m,
    backgroundColor: colors.neutral100,
    boxSizing: "border-box",
    cursor: "pointer",
    fontFamily: fonts.family.primary,
    fontSize: fonts.control.md, // match the Select value/placeholder size
    transition: "border-color 0.15s ease, color 0.15s ease",
    overflow: "hidden",
    whiteSpace: "nowrap",
    textOverflow: "ellipsis",
  },
  dateTriggerClear: {
    width: 18,
    height: 18,
    borderRadius: "50%",
    backgroundColor: colors.neutral200,
    color: colors.neutral900,
    fontSize: 12,
    lineHeight: "16px",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    flexShrink: 0,
  },
  indexCount: {
    paddingInline: 8,
    fontFamily: fonts.family.primary,
    fontSize: fonts.control.xs,
    color: colors.neutral500,
  },
  // ── Open file (right pane) ────────────────────────────────────────────
  // Height is driven entirely by the body content — no minHeight, otherwise
  // the bottom half of the folder ends up as empty cream that blurs into the
  // page background and the content looks like it's "floating out."
  openFile: {
    position: "relative",
    width: "100%",
    maxWidth: 880,
  },
  openFolderShape: {
    position: "absolute",
    inset: 0,
    width: "100%",
    height: "100%",
    display: "block",
    pointerEvents: "none",
  },
  openTabText: {
    position: "absolute",
    top: 0,
    left: "2.4%",
    width: "26%",
    height: 36,
    display: "flex",
    alignItems: "center",
    gap: spacing.s,
    paddingLeft: spacing.m,
    paddingRight: spacing.m,
    pointerEvents: "none",
  },
  openCode: {
    fontFamily: fonts.family.primary,
    fontSize: fonts.control.sm,
    fontWeight: fonts.weight.medium,
    color: colors.neutral500,
    letterSpacing: 0.5,
  },
  openName: {
    fontFamily: fonts.family.secondary,
    fontSize: fonts.size.h6,
    color: colors.neutral900,
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  openSectionTab: {
    position: "absolute",
    top: 0,
    width: "9.706%",
    height: 36,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontFamily: fonts.family.primary,
    fontSize: fonts.control.sm,
    color: colors.neutral700,
    background: "transparent",
    border: "none",
    padding: 0,
    cursor: "pointer",
    whiteSpace: "nowrap",
    overflow: "hidden",
  },
  openBody: {
    position: "relative",
    paddingTop: "84px",
    paddingLeft: "36px",
    paddingRight: "24px",
    paddingBottom: "40px",
    display: "flex",
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: spacing.xl,
  },
  openHeadGrid: {
    display: "grid",
    gridTemplateColumns: "1fr auto",
    columnGap: spacing["2xl"],
    rowGap: spacing.s,
    alignItems: "flex-start",
  },
  openHeadLeft: {
    display: "flex",
    flexDirection: "column",
    gap: spacing.s,
    minWidth: 0,
  },
  openSummary: {
    margin: 0,
    fontFamily: fonts.family.primary,
    fontSize: fonts.control.md,
    lineHeight: "22px",
    color: colors.neutral900,
    maxWidth: 640,
  },
  openTagsRow: {
    display: "flex",
    alignItems: "center",
    gap: 6,
    flexWrap: "wrap",
    marginTop: spacing.s,
  },
  openContact: {
    display: "flex",
    flexDirection: "column",
    gap: spacing["2xs"],
    alignItems: "flex-end",
    textAlign: "right" as const,
  },
  contactLine: {
    fontFamily: fonts.family.primary,
    fontSize: fonts.control.sm,
    color: colors.neutral800,
    lineHeight: "20px",
    whiteSpace: "nowrap",
  },
  openSection: {
    display: "flex",
    flexDirection: "column",
    gap: spacing.s,
  },
  openSectionTitle: {
    margin: 0,
    fontFamily: fonts.family.primary,
    fontSize: fonts.control.xs,
    color: colors.neutral500,
    textTransform: "uppercase" as const,
    letterSpacing: 0.6,
    fontWeight: fonts.weight.medium,
  },
  openVisitsRow: {
    display: "flex",
    gap: spacing.s,
    flexWrap: "wrap",
  },
  openVisitCard: {
    minWidth: 100,
    padding: `${spacing.s} ${spacing.m}`,
    backgroundColor: colors.neutral100,
    border: `1px solid ${colors.primary300}`,
    borderRadius: radii.m,
    display: "flex",
    flexDirection: "column",
    gap: 2,
  },
  openVisitDate: {
    fontFamily: fonts.family.primary,
    fontSize: fonts.control.sm,
    color: colors.neutral900,
    fontWeight: fonts.weight.medium,
  },
  openVisitNote: {
    fontFamily: fonts.family.primary,
    fontSize: fonts.control.xs,
    color: colors.neutral500,
  },
  // ── New Figma layout (node 2503:5154) — header + summary + icon column ──
  openContent: {
    flex: 1,
    minWidth: 0,
    display: "flex",
    flexDirection: "column",
    gap: "48px",
  },
  openHeaderRow: {
    display: "flex",
    alignItems: "center",
    gap: "20px",
  },
  avatar: {
    width: 81,
    height: 81,
    borderRadius: "50%",
    backgroundColor: colors.primary400,
    color: colors.neutral100,
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    fontFamily: fonts.family.secondary,
    fontWeight: fonts.weight.regular,
    fontSize: "32px",
    lineHeight: 1,
    overflow: "hidden",
  },
  avatarImg: {
    width: "100%",
    height: "100%",
    objectFit: "cover" as const,
    display: "block",
  },
  avatarInitial: {
    transform: "translateY(2px)",
  },
  nameBlock: {
    display: "flex",
    flexDirection: "column",
    gap: 4,
    minWidth: 0,
  },
  nameLine: {
    margin: 0,
    fontFamily: fonts.family.secondary,
    fontSize: "24px",
    lineHeight: "34px",
    fontWeight: fonts.weight.regular,
    color: colors.neutral900,
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  metaLine: {
    margin: 0,
    fontFamily: fonts.family.secondary,
    fontSize: "20px",
    lineHeight: "28px",
    fontWeight: fonts.weight.regular,
    color: colors.neutral900,
  },
  summaryCard: {
    backgroundColor: colors.primary100,
    borderRadius: "12px",
    padding: "20px",
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
  summaryTitle: {
    margin: 0,
    fontFamily: fonts.family.secondary,
    fontSize: "20px",
    lineHeight: "28px",
    fontWeight: fonts.weight.semibold,
    color: colors.neutral900,
  },
  summaryText: {
    margin: 0,
    fontFamily: fonts.family.primary,
    fontSize: "14px",
    lineHeight: "20px",
    color: colors.neutral900,
  },
  iconColumn: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
    flexShrink: 0,
  },
  iconAction: {
    width: 70,
    height: 44,
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.primary300,
    borderRadius: "4px",
    border: "none",
    padding: "10px",
    cursor: "pointer",
    color: colors.neutral900,
    textDecoration: "none",
    boxSizing: "border-box",
  },
  iconActionGlyph: {
    width: 24,
    height: 24,
  },
  // ── Legacy styles below (kept until any other consumer is removed) ──
  // ── Safety banner (allergies / chronic-condition flags) ─────────────
  flagBanner: {
    display: "flex",
    alignItems: "center",
    gap: spacing.xs,
    padding: `${spacing.xs} ${spacing.s}`,
    borderRadius: radii.m,
    backgroundColor: colors.redAlpha10,
    border: `1px solid ${colors.red100}`,
    color: colors.red200,
  },
  flagBannerIcon: {
    fontSize: 16,
    lineHeight: "16px",
    flexShrink: 0,
  },
  flagBannerText: {
    fontFamily: fonts.family.primary,
    fontSize: fonts.control.sm,
    fontWeight: fonts.weight.medium,
    color: colors.red200,
  },
  // ── AI next-step card ───────────────────────────────────────────────
  nextStep: {
    display: "flex",
    alignItems: "center",
    gap: spacing.s,
    padding: `${spacing.s} ${spacing.m}`,
    borderRadius: radii.m,
    backgroundColor: colors.secondary50,
    border: `1px solid ${colors.secondary200}`,
    flexWrap: "wrap" as const,
  },
  nextStepLabel: {
    fontFamily: fonts.family.primary,
    fontSize: fonts.control.xs,
    fontWeight: fonts.weight.medium,
    letterSpacing: 0.6,
    color: colors.secondary700,
    flexShrink: 0,
  },
  nextStepText: {
    flex: 1,
    minWidth: 0,
    fontFamily: fonts.family.primary,
    fontSize: fonts.control.sm,
    color: colors.neutral900,
  },
  nextStepAction: {
    fontFamily: fonts.family.primary,
    fontSize: fonts.control.sm,
    fontWeight: fonts.weight.medium,
    color: colors.secondary700,
    background: "transparent",
    border: "none",
    padding: 0,
    cursor: "pointer",
    flexShrink: 0,
  },
  // ── Bottom action area ──────────────────────────────────────────────
  openActions: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.s,
    flexWrap: "wrap",
  },
  quickActions: {
    display: "flex",
    alignItems: "center",
    gap: spacing.xs,
    flexWrap: "wrap",
  },
  quickAction: {
    display: "inline-flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    minWidth: 56,
    padding: `${spacing["2xs"]} ${spacing["2xs"]}`,
    border: "none",
    background: "transparent",
    borderRadius: radii.m,
    cursor: "pointer",
    color: colors.neutral700,
    textDecoration: "none",
    transition: "background-color 0.15s ease, color 0.15s ease",
  },
  quickActionIconBox: {
    width: 36,
    height: 36,
    borderRadius: "50%",
    backgroundColor: colors.neutral100,
    border: `1px solid ${colors.primary300}`,
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    color: "currentColor",
  },
  quickActionIcon: {
    width: 18,
    height: 18,
  },
  quickActionLabel: {
    fontFamily: fonts.family.primary,
    fontSize: fonts.control.xs,
    color: colors.neutral700,
    whiteSpace: "nowrap",
  },
  actionPrimary: {
    fontFamily: fonts.family.primary,
    fontSize: fonts.control.md,
    color: colors.neutral100,
    backgroundColor: colors.primary700,
    border: "none",
    borderRadius: radii.full,
    padding: "10px 20px",
    cursor: "pointer",
  },
  actionGhost: {
    fontFamily: fonts.family.primary,
    fontSize: fonts.control.md,
    color: colors.neutral900,
    backgroundColor: "transparent",
    border: `1px solid ${colors.primary300}`,
    borderRadius: radii.full,
    padding: "10px 20px",
    cursor: "pointer",
    textDecoration: "none",
    display: "inline-flex",
    alignItems: "center",
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
