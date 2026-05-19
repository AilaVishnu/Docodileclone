import React, { useEffect, useMemo, useState } from "react";
import { colors, fonts, radii, spacing } from "../../styles/theme";
import { usePatients, Patient } from "../../hooks/usePatients";
import { useDoctors } from "../../hooks/useDoctors";
import { API_BASE_URL } from "../../apiConfig";
import { fetchPatientSummary, generatePatientSummary, parsePatientSummary, PatientSummary } from "../../api/ai";
import { ReactComponent as SearchIcon } from "../../assets/search.svg";
import { ReactComponent as PrescriptionIconSVG } from "../../assets/prescription.svg";
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
  // Split-pane: left index lets you scan, right pane shows the selected file
  // in full. selection auto-falls to the first visible patient when the
  // current one is filtered out.
  const [selectedId, setSelectedId] = useState<string | null>(initialSelectedId ?? null);

  // When navigated here with a specific patient (e.g. from the queue's
  // "View Patient File"), jump straight to that patient's right-pane.
  useEffect(() => {
    if (initialSelectedId) setSelectedId(initialSelectedId);
  }, [initialSelectedId]);
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

  // Keep selection valid as filters change. If the current selection vanishes
  // from `visible`, fall back to the first item.
  useEffect(() => {
    if (visible.length === 0) {
      setSelectedId(null);
      return;
    }
    if (!selectedId || !visible.some((p) => p.id === selectedId)) {
      setSelectedId(visible[0].id);
    }
  }, [visible, selectedId]);

  const selectedPatient = visible.find((p) => p.id === selectedId) ?? null;

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
    <div style={styles.container}>
      <div style={styles.headerRow}>
        <h1 style={styles.title}>Patient Files</h1>
      </div>

      <div style={styles.layout}>
        {/* LEFT — index. Search at top, segment chips, advanced filters
            collapsed inline, then the patient list. */}
        <div style={styles.indexPane}>
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
                  {visible.map((p) => (
                    <IndexRow
                      key={p.id}
                      patient={p}
                      query={search.trim().toLowerCase()}
                      selected={p.id === selectedId}
                      onSelect={() => setSelectedId(p.id)}
                    />
                  ))}
                </tbody>
              </table>
            )}
          </div>

          <div style={styles.indexCount}>
            {loading ? "Loading…" : `${visible.length} of ${patients.length} patients`}
          </div>
        </div>

        {/* RIGHT — open file. The cabinet visual gets to breathe here, with
            real content on top of it. */}
        <div style={styles.openPane}>
          {selectedPatient ? (
            <OpenFile
              patient={selectedPatient}
              onOpenChart={() => handleOpen(selectedPatient)}
              onOpenBills={() => handleOpen(selectedPatient, { initialAction: 3 })}
            />
          ) : (
            <div style={styles.openEmpty}>Select a patient to view their file</div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── One patient file ───────────────────────────────────────────────────────

type Tone = "soft" | "warn" | "info";
type FileTag = { label: string; tone: Tone };

function tagsFor(p: Patient): FileTag[] {
  const out: FileTag[] = [];
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
  const code = shortCode(patient.id);
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
        <div style={queueStyles.nameInner}>
          <span style={queueStyles.namePrimary}>{patient.name}</span>
          {ageShort !== "—" && (
            <span style={queueStyles.nameMeta}>
              <span style={queueStyles.nameMetaDot}>|</span>
              <span>{ageShort}</span>
            </span>
          )}
        </div>
      </td>
      <td style={{ ...queueStyles.td, textAlign: "center", color: phone === "—" ? colors.neutral400 : undefined }}>{phone}</td>
      <td style={{ ...queueStyles.td, textAlign: "left", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
        {query ? (
          matchField ? (
            <span style={{ ...styles.tag, ...TAG_TONES.info }}>matched: {matchField}</span>
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
type MatchField = "name" | "phone" | "email" | "code";
function matchesQuery(p: Patient, q: string): MatchField | null {
  if (p.name.toLowerCase().includes(q)) return "name";
  if ((p.phone ?? "").toLowerCase().includes(q)) return "phone";
  if ((p.email ?? "").toLowerCase().includes(q)) return "email";
  if (shortCode(p.id).toLowerCase().includes(q)) return "code";
  return null;
}

// Funnel glyph for the filter toggle next to the search bar. Inline SVG —
// matches stroke weight of TopNav icons (1.5).
function FunnelIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden>
      <path
        d="M2 3h14l-5.5 7v5l-3-1.5V10L2 3z"
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
        color: filled ? colors.neutral900 : colors.neutral500,
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

// ─── Open file (right pane) ─────────────────────────────────────────────────
//
// The folder visual fills the pane, with rich content on top: code+name as
// the heading, AI summary, smart chips, contact/demographics, recent visits
// as cards, action buttons. This is where the cabinet design gets to breathe.
function OpenFile({ patient, onOpenChart, onOpenBills }: { patient: Patient; onOpenChart: () => void; onOpenBills?: () => void }) {
  const code = shortCode(patient.id);
  const ageShort = genderAgeShort(patient);
  const metaLine = [
    ageShort !== "—" ? `(${ageShort})` : null,
    patient.phone || null,
  ]
    .filter(Boolean)
    .join("  ");


  return (
    <div style={styles.openFile}>
      <svg
        viewBox="0 0 1051 426"
        preserveAspectRatio="none"
        style={styles.openFolderShape}
        aria-hidden
      >
        <path
          d="M290.227 0.510742C295.422 0.5108 300.099 3.66211 302.049 8.47754L313.609 37.0215C315.404 41.4516 319.706 44.3505 324.485 44.3506H1037.55C1044.6 44.3508 1050.31 50.0615 1050.31 57.1055V412C1050.31 419.044 1044.6 424.755 1037.55 424.755H13.2637C6.21959 424.755 0.509766 419.044 0.509766 412V53.543C0.509766 48.4667 4.62486 44.3506 9.70117 44.3506C13.0294 44.3504 16.025 42.3319 17.2744 39.2471L29.7363 8.47754C31.6866 3.6621 36.3632 0.510792 41.5586 0.510742H290.227Z"
          fill={colors.neutral100}
          stroke={colors.primary300}
          strokeWidth="1"
        />
      </svg>

      <div style={styles.openBody}>
        <div style={styles.openContent}>
          <div style={styles.openHeaderRow}>
            <Avatar name={patient.name} photoUrl={patient.photoUrl} />
            <div style={styles.nameBlock}>
              <h2 style={styles.nameLine}>
                {code}: {patient.name}
              </h2>
              {metaLine && <p style={styles.metaLine}>{metaLine}</p>}
            </div>
          </div>

          <div style={styles.summaryCard}>
            <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 8 }}>
              <h3 style={styles.summaryTitle}>AI Summary</h3>
              {patient.lastVisitDate && (
                <span style={{ fontFamily: fonts.family.primary, fontSize: fonts.control.xs, color: colors.neutral500, flexShrink: 0 }}>
                  Last visit: {new Date(patient.lastVisitDate).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}
                </span>
              )}
            </div>
            <AIPatientSummary patientId={patient.id} />
          </div>
        </div>
      </div>

      {/* Buttons pinned to the top-right corner of the card, straddling the right edge */}
      <div style={{ ...styles.iconColumn, position: "absolute", right: "-35px", top: "60px" }}>
        <IconAction
          label={patient.phone ? `Call ${patient.phone}` : "No phone on file"}
          href={patient.phone ? `tel:${patient.phone}` : undefined}
          onClick={patient.phone ? undefined : () => window.alert("No phone number on file for this patient.")}
          icon={<PhoneIconSVG style={styles.iconActionGlyph} />}
        />
        <IconAction
          label={patient.email ? `Email ${patient.email}` : "No email on file"}
          href={patient.email ? `mailto:${patient.email}` : undefined}
          onClick={patient.email ? undefined : () => window.alert("No email on file for this patient.")}
          icon={<LetterIconSVG style={styles.iconActionGlyph} />}
        />
        <IconAction
          label="Open chart / book visit"
          onClick={onOpenChart}
          tone="secondary"
          icon={<CalendarIconSVG style={styles.iconActionGlyph} />}
        />
        <IconAction
          label="Open Bills"
          onClick={onOpenBills}
          tone="secondary"
          icon={<BillingIconSVG style={styles.iconActionGlyph} />}
        />
      </div>
    </div>
  );
}

// AI-backed patient summary card. On open we only do a cache lookup — no
// OpenAI call. If a fresh cached summary exists (visit fingerprint matches)
// we render it; otherwise we show a Generate button so the doctor decides
// when to spend tokens. Adding/editing a visit invalidates the cache and
// the Generate button reappears on next open.
function AIPatientSummary({ patientId }: { patientId: string }) {
  const [data, setData] = useState<PatientSummary | null>(null);
  const [generated, setGenerated] = useState(false);
  const [loading, setLoading] = useState(true);     // initial cache check
  const [busy, setBusy] = useState(false);          // explicit generation in flight
  const [error, setError] = useState<string | null>(null);
  const [updatedAt, setUpdatedAt] = useState<string | null>(null);

  // Cache-only read on mount / patient switch. Never costs tokens.
  useEffect(() => {
    setLoading(true);
    setError(null);
    fetchPatientSummary(patientId)
      .then((r) => {
        setGenerated(r.generated);
        setUpdatedAt(r.updatedAt);
        if (r.generated && r.content) {
          const parsed = parsePatientSummary(r.content);
          setData(parsed);
          if (parsed.error) setError(parsed.error);
        } else {
          setData(null);
        }
      })
      .catch((e) => setError((e as Error).message))
      .finally(() => setLoading(false));
  }, [patientId]);

  const generate = () => {
    setBusy(true);
    setError(null);
    generatePatientSummary(patientId)
      .then((r) => {
        setGenerated(r.generated);
        setUpdatedAt(r.updatedAt);
        const parsed = parsePatientSummary(r.content);
        setData(parsed);
        if (parsed.error) setError(parsed.error);
      })
      .catch((e) => setError((e as Error).message))
      .finally(() => setBusy(false));
  };

  if (loading) {
    return <p style={{ ...styles.summaryBody, color: colors.neutral500 }}>Checking…</p>;
  }
  // No fresh cached summary → show Generate button.
  if (!generated) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        <p style={{ ...styles.summaryBody, color: colors.neutral500 }}>
          {data ? "Visit data has changed since the last summary." : "No AI summary yet for this patient."}
        </p>
        <button
          type="button"
          onClick={generate}
          disabled={busy}
          style={{
            alignSelf: "flex-start",
            background: colors.secondary700,
            color: colors.neutral100,
            border: "none",
            padding: "6px 14px",
            borderRadius: 999,
            cursor: busy ? "default" : "pointer",
            fontSize: fonts.control.xs,
            opacity: busy ? 0.6 : 1,
          }}
        >
          {busy ? "Generating…" : "Generate AI summary"}
        </button>
        {error && <span style={{ fontSize: 11, color: colors.red200 }}>{error}</span>}
      </div>
    );
  }
  if (!data || (!data.summary && data.activeConditions.length === 0 && data.allergies.length === 0)) {
    return <p style={{ ...styles.summaryBody, color: colors.neutral500 }}>Not enough visit data yet.</p>;
  }
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {data.summary && <p style={styles.summaryBody}>{data.summary}</p>}
      {data.activeConditions.length > 0 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
          {data.activeConditions.map((c, i) => (
            <span key={`c-${i}`} style={{ fontSize: fonts.control.xs, padding: "2px 8px", borderRadius: 999, backgroundColor: colors.primary200, color: colors.neutral900 }}>{c}</span>
          ))}
        </div>
      )}
      {data.allergies.length > 0 && (
        <p style={{ ...styles.summaryBody, fontSize: fonts.control.xs }}>
          <strong>Allergies:</strong> {data.allergies.join(", ")}
        </p>
      )}
      {data.riskFlags.length > 0 && (
        <ul style={{ margin: 0, paddingLeft: 16 }}>
          {data.riskFlags.map((r, i) => (
            <li key={`r-${i}`} style={{ ...styles.summaryBody, color: "#9a4a1c" }}>{r}</li>
          ))}
        </ul>
      )}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 11, color: colors.neutral500 }}>
        <span>AI-generated — verify before clinical decisions.</span>
        <button
          type="button"
          onClick={generate}
          disabled={busy}
          style={{ background: "none", border: "none", color: colors.secondary700, cursor: busy ? "default" : "pointer", textDecoration: "underline", padding: 0, fontSize: 11, opacity: busy ? 0.6 : 1 }}
        >
          {busy ? "Regenerating…" : `Regenerate${updatedAt ? ` · ${new Date(updatedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}` : ""}`}
        </button>
      </div>
    </div>
  );
}

// Patient avatar — uses the real photo when the backend supplies `photoUrl`,
// falls back to a circle with the patient's initial otherwise. Image errors
// (broken URL, 404) gracefully degrade to the initial.
function Avatar({ name, photoUrl }: { name: string; photoUrl?: string | null }) {
  const initial = name.trim().charAt(0).toUpperCase() || "?";
  const [errored, setErrored] = useState(false);
  const showImage = photoUrl && !errored;
  return (
    <div style={styles.avatar} aria-label={name}>
      {showImage ? (
        <img
          src={photoUrl}
          alt=""
          style={styles.avatarImg}
          onError={() => setErrored(true)}
        />
      ) : (
        <span style={styles.avatarInitial}>{initial}</span>
      )}
    </div>
  );
}

// Square icon-only button used in the right vertical action column. Renders
// as <a> when an href is given (tel: / mailto:), otherwise <button>.
//
// `tone` selects the chip background per Figma node 2441:1552 — communication
// actions (call/email) use the primary tan; transactional actions (book / bill)
// use the secondary sage so the two intents are distinguishable at a glance.

function PhoneIconSVG({ style }: { style?: React.CSSProperties }) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={style}>
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.63 3.38a2 2 0 0 1 1.99-2.18h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.91a16 16 0 0 0 6 6l.72-.72a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
    </svg>
  );
}

function LetterIconSVG({ style }: { style?: React.CSSProperties }) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={style}>
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <polyline points="2,7 12,14 22,7" />
    </svg>
  );
}

function CalendarIconSVG({ style }: { style?: React.CSSProperties }) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={style}>
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  );
}

function BillingIconSVG({ style }: { style?: React.CSSProperties }) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={style}>
      <path d="M6 2h12a1 1 0 0 1 1 1v17.5l-2-1.5-2 1.5-2-1.5-2 1.5-2-1.5-2 1.5V3a1 1 0 0 1 1-1z" />
      <line x1="9" y1="9" x2="15" y2="9" />
      <line x1="9" y1="13" x2="15" y2="13" />
      <line x1="9" y1="17" x2="13" y2="17" />
    </svg>
  );
}

type IconActionTone = "primary" | "secondary";
function IconAction({
  label,
  href,
  onClick,
  icon,
  tone = "primary",
}: {
  label: string;
  href?: string;
  onClick?: () => void;
  icon: React.ReactNode;
  tone?: IconActionTone;
}) {
  const style = {
    ...styles.iconAction,
    backgroundColor: tone === "secondary" ? colors.secondary200 : colors.primary300,
  };
  const props = {
    title: label,
    "aria-label": label,
    style,
  } as const;
  return href ? (
    <a {...props} href={href}>
      {icon}
    </a>
  ) : (
    <button type="button" {...props} onClick={onClick}>
      {icon}
    </button>
  );
}

// Compact "M|25" / "F|30" / "U|—" — first letter of gender, pipe, age in years.
// Pipe matches the Figma design (node 2503:5154) for the patient meta line.
function genderAgeShort(p: Patient): string {
  const g = p.gender ? p.gender.charAt(0).toUpperCase() : "";
  const y = p.age != null ? Math.floor(p.age / 12) : null;
  if (!g && y == null) return "—";
  if (g && y != null) return `${g}|${y}`;
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

// Stable 2–3 digit "T" code derived from the UUID — same patient always gets
// the same code regardless of sort order. Pure presentational shorthand;
// when the backend returns a real chart number, swap this helper.
function shortCode(id: string): string {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) | 0;
  const n = Math.abs(h) % 1000;
  return `T${n.toString().padStart(3, "0")}`;
}

// Tone-specific tag colors — muted so the chips read as labels rather than
// alerts. Soft = recent/positive; warn = needs attention; info = demographic.
const TAG_TONES: Record<Tone, React.CSSProperties> = {
  soft: { backgroundColor: colors.secondary100, color: colors.secondary800 },
  warn: { backgroundColor: colors.primary300, color: colors.primary800 },
  info: { backgroundColor: colors.neutral150, color: colors.neutral700 },
};

// ─── Styles ─────────────────────────────────────────────────────────────────

const styles: Record<string, React.CSSProperties> = {
  // The host <main> already paints active-shade-200 (= primary200), so we
  // just sit on top of it without a wrapper background.
  container: {
    display: "flex",
    flexDirection: "column",
    gap: spacing.xl,
    width: "100%",
  },

  // Title centered (matches Prescription/Appointments).
  headerRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    margin: 0,
    textAlign: "center",
    fontFamily: fonts.family.secondary,
    fontSize: fonts.size.h5,
    lineHeight: fonts.lineHeight.h5,
    fontWeight: fonts.weight.regular,
    color: colors.neutral900,
  },
  // Split-pane: index list (left) + open file (right).
  layout: {
    display: "flex",
    gap: spacing.xl,
    alignItems: "stretch",
    width: "100%",
    minWidth: 0,
    minHeight: 600,
  },
  indexPane: {
    flex: "0 0 40%",
    minWidth: 0,
    display: "flex",
    flexDirection: "column",
    gap: spacing.s,
  },
  openPane: {
    flex: 1,
    minWidth: 0,
    display: "flex",
    flexDirection: "column",
  },
  openEmpty: {
    flex: 1,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontFamily: fonts.family.primary,
    fontSize: fonts.size.s,
    color: colors.neutral500,
  },

  // Same dimensions as TopNav.searchBarContainer (40px tall, 55px radius,
  // 0 16 padding, 12px gap) so the two pills feel consistent — only the
  // background swaps to white per the page spec.
  searchBox: {
    display: "flex",
    alignItems: "center",
    width: "100%",
    height: 40,
    gap: 12,
    padding: "0 16px",
    borderRadius: 55,
    backgroundColor: colors.neutral100,
    boxSizing: "border-box",
  },
  searchIcon: {
    width: 20,
    height: 20,
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
    fontSize: fonts.control.md,
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
    height: 40,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing["2xs"],
    paddingInline: spacing.xs,
    border: `1px solid ${colors.neutral300}`,
    borderRadius: radii.m,
    backgroundColor: colors.neutral100,
    cursor: "pointer",
    fontFamily: fonts.family.primary,
    fontSize: fonts.size.m,
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

  // Tag chip — used by the index dots and the open-file tag row.
  tag: {
    fontFamily: fonts.family.primary,
    fontSize: fonts.control.xs,
    fontWeight: fonts.weight.medium,
    letterSpacing: 0.3,
    textTransform: "uppercase",
    padding: "2px 8px",
    borderRadius: radii.full,
    lineHeight: "16px",
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
