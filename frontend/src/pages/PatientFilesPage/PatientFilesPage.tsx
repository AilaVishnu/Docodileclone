import React, { useEffect, useMemo, useState } from "react";
import { colors, fonts, radii, spacing } from "../../styles/theme";
import { usePatients, Patient } from "../../hooks/usePatients";
import { useDoctors } from "../../hooks/useDoctors";
import { ReactComponent as SearchIcon } from "../../assets/search.svg";
import { ReactComponent as PhoneIconSVG } from "../../assets/Phone.svg";
import { ReactComponent as LetterIconSVG } from "../../assets/Letter.svg";
import { ReactComponent as CalendarIconSVG } from "../../assets/calendar.svg";
import { ReactComponent as BillingIconSVG } from "../../assets/billing.svg";
import { ReactComponent as PrescriptionIconSVG } from "../../assets/prescription.svg";
import { Select } from "../../components/Input/Select/Select";
import { DatePicker } from "../../components/AppointmentQueue/DatePicker";
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
  // Departments are derived from doctor specialities. When a department is
  // picked, the doctor dropdown narrows to that speciality.
  const departments = useMemo(() => {
    const set = new Set<string>();
    doctors.forEach((d) => d.speciality && set.add(d.speciality));
    return Array.from(set).sort();
  }, [doctors]);

  const doctorOptions = useMemo(() => {
    return department === ANY
      ? doctors
      : doctors.filter((d) => d.speciality === department);
  }, [doctors, department]);

  const visible = useMemo(() => {
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

    if (sort === "recent") list.sort(byLastVisit(true));
    else if (sort === "stale") list.sort(byLastVisit(false));
    else list.sort((a, b) => a.name.localeCompare(b.name));
    return list;
  }, [patients, search, sort, dateFrom, dateTo]);

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

  const handleOpen = (patient: Patient) => {
    setPendingSessionNav({ patient, appointmentId: null });
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
            <OpenFile patient={selectedPatient} onOpenChart={() => handleOpen(selectedPatient)} />
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

// Dummy clinical-flavoured copy until a real AI endpoint is wired. Stable per
// patient (deterministic from id) so the same patient always shows the same
// blurb across renders. Swap this function body when the backend lands.
const DUMMY_AI_SUMMARIES = [
  "Stable BP trend across last 3 visits. Continue current Rx; review at next follow-up.",
  "Recurring URI symptoms; consider allergen panel if recurrence persists past 4 weeks.",
  "Post-procedure recovery on track. No new concerns noted.",
  "Compliance gap — 2 missed follow-ups this quarter. Re-engagement recommended.",
  "Lab work within normal range. Annual review due in 2 months.",
  "Sleep complaints improving; sleep aid taper on plan. Monitor.",
  "Chronic care: medications adherent, vitals trending normal.",
  "Mild eczema flare; topical regimen unchanged. Reassess at 6 weeks.",
];

function aiSummaryFor(p: Patient): string {
  let h = 0;
  for (let i = 0; i < p.id.length; i++) h = (h * 31 + p.id.charCodeAt(i)) | 0;
  return DUMMY_AI_SUMMARIES[Math.abs(h) % DUMMY_AI_SUMMARIES.length];
}

// Stub allergy / safety flags. Backend follow-up: a /api/patients/:id/safety
// endpoint that returns the real list. Roughly 60% of patients get at least
// one flag here so the banner shows up often enough to evaluate the design.
const DUMMY_FLAG_POOL = [
  "Penicillin allergy",
  "On blood thinners",
  "Latex allergy",
  "Diabetic — Type 2",
  "Hypertensive",
  "Asthma",
];
function flagsFor(p: Patient): string[] {
  let h = 0;
  for (let i = 0; i < p.id.length; i++) h = (h * 31 + p.id.charCodeAt(i)) | 0;
  if (Math.abs(h) % 5 === 0) return [];
  const a = DUMMY_FLAG_POOL[Math.abs(h) % DUMMY_FLAG_POOL.length];
  if (Math.abs(h) % 3 === 0) {
    const b = DUMMY_FLAG_POOL[Math.abs(h >> 3) % DUMMY_FLAG_POOL.length];
    return b !== a ? [a, b] : [a];
  }
  return [a];
}

// Stub AI "what to do next". Distinct from the summary — summary describes the
// past, this prescribes the next action. Backend should infer from
// last-visit-date + active-Rx + scheduled appointments + lab orders.
const DUMMY_NEXT_STEPS = [
  { text: "Follow-up due in 5 days.", action: "Schedule" },
  { text: "Annual review overdue by 3 weeks.", action: "Schedule" },
  { text: "Lab results pending review.", action: "Open results" },
  { text: "Vaccination overdue — DPT booster.", action: "Book slot" },
  { text: "Refill due for Atorvastatin (10mg).", action: "Send Rx" },
  { text: "No outstanding actions.", action: "" },
];
function nextStepFor(p: Patient): { text: string; action: string } {
  let h = 0;
  for (let i = 0; i < p.id.length; i++) h = (h * 31 + p.id.charCodeAt(i)) | 0;
  return DUMMY_NEXT_STEPS[Math.abs(h) % DUMMY_NEXT_STEPS.length];
}

// Folder section tabs — same set for every patient. Each tab swaps the
// content shown in the open file body.
type SectionId = "files" | "bills" | "notes";
const SECTIONS: { id: SectionId; label: string }[] = [
  { id: "files", label: "Files" },
  { id: "bills", label: "Bills" },
  { id: "notes", label: "Notes" },
];

// Dummy visits used inside the Files section until the visits endpoint feeds
// this list. Deterministic 0–3 entries per patient.
function visitsFor(p: Patient): { label: string }[] {
  let h = 0;
  for (let i = 0; i < p.id.length; i++) h = (h * 31 + p.id.charCodeAt(i)) | 0;
  const count = Math.abs(h) % 4; // 0..3
  const out: { label: string }[] = [];
  for (let i = 0; i < count; i++) {
    const daysAgo = 7 + (Math.abs(h >> (i + 2)) % 90);
    const d = new Date(Date.now() - daysAgo * 86400000);
    out.push({ label: d.toLocaleDateString(undefined, { day: "2-digit", month: "short" }) });
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
function OpenFile({ patient, onOpenChart }: { patient: Patient; onOpenChart: () => void }) {
  const code = shortCode(patient.id);
  const ageShort = genderAgeShort(patient);
  const metaLine = [
    ageShort !== "—" ? `(${ageShort})` : null,
    patient.phone || null,
  ]
    .filter(Boolean)
    .join("  ");
  const summary = aiSummaryFor(patient);
  return (
    <div style={styles.openFile}>
      <svg
        viewBox="0 0 1051 358"
        preserveAspectRatio="none"
        style={styles.openFolderShape}
        aria-hidden
      >
        <defs>
          <linearGradient id={`openGrad-${patient.id}`} x1="0" y1="1" x2="0" y2="0">
            <stop offset="0%" stopColor={colors.primary100} />
            <stop offset="100%" stopColor={colors.neutral100} />
          </linearGradient>
        </defs>
        <path
          d="M290.227 0.510742C295.422 0.5108 300.099 3.66211 302.049 8.47754L313.609 37.0215C315.404 41.4516 319.706 44.3505 324.485 44.3506H1037.55C1044.6 44.3508 1050.31 50.0615 1050.31 57.1055V344.709C1050.31 351.753 1044.6 357.464 1037.55 357.464H13.2637C6.21959 357.464 0.509766 351.753 0.509766 344.709V53.543C0.509766 48.4667 4.62486 44.3506 9.70117 44.3506C13.0294 44.3504 16.025 42.3319 17.2744 39.2471L29.7363 8.47754C31.6866 3.6621 36.3632 0.510792 41.5586 0.510742H290.227Z"
          fill={`url(#openGrad-${patient.id})`}
          stroke={colors.primary300}
          strokeWidth="1.02039"
        />
      </svg>

      {/* Body content — split into a left content column and a right vertical
          icon column. Matches Figma node 2503:5154. */}
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
            <h3 style={styles.summaryTitle}>AI Summary</h3>
            <p style={styles.summaryText}>{summary}</p>
          </div>
        </div>

        <div style={styles.iconColumn}>
          <IconAction
            label="Call"
            href={patient.phone ? `tel:${patient.phone}` : undefined}
            icon={<PhoneIconSVG style={styles.iconActionGlyph} />}
          />
          <IconAction
            label="Email"
            href={patient.email ? `mailto:${patient.email}` : undefined}
            icon={<LetterIconSVG style={styles.iconActionGlyph} />}
          />
          <IconAction
            label="Book appointment"
            onClick={onOpenChart}
            tone="secondary"
            icon={<CalendarIconSVG style={styles.iconActionGlyph} />}
          />
          <IconAction
            label="Generate bill"
            tone="secondary"
            icon={<BillingIconSVG style={styles.iconActionGlyph} />}
          />
        </div>
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
    paddingTop: spacing["3xl"],
    paddingInline: spacing["3xl"],
    paddingBottom: spacing["2xl"],
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
    // Figma node 2503:5154 uses 48px (spacing/4xl) between the header row and
    // the AI Summary card, and caps the content at 362px wide so the card
    // doesn't sprawl across the folder.
    maxWidth: 362,
    display: "flex",
    flexDirection: "column",
    gap: spacing["4xl"],
  },
  openHeaderRow: {
    display: "flex",
    alignItems: "center",
    gap: spacing.l,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: "50%",
    backgroundColor: colors.primary400,
    color: colors.neutral100,
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    fontFamily: fonts.family.secondary,
    fontWeight: fonts.weight.regular,
    fontSize: fonts.size.h4,
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
    gap: 2,
    minWidth: 0,
  },
  nameLine: {
    margin: 0,
    fontFamily: fonts.family.secondary,
    fontSize: fonts.size.h5,
    lineHeight: fonts.lineHeight.h5,
    fontWeight: fonts.weight.regular,
    color: colors.neutral900,
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  metaLine: {
    margin: 0,
    fontFamily: fonts.family.secondary,
    fontSize: fonts.size.l,
    lineHeight: fonts.lineHeight.l,
    fontWeight: fonts.weight.regular,
    color: colors.neutral900,
  },
  summaryCard: {
    backgroundColor: colors.primary100,
    borderRadius: radii.xl,
    padding: spacing.l,
    display: "flex",
    flexDirection: "column",
    gap: spacing.xs,
  },
  summaryTitle: {
    margin: 0,
    fontFamily: fonts.family.secondary,
    fontSize: fonts.size.l,
    lineHeight: fonts.lineHeight.l,
    fontWeight: fonts.weight.semibold,
    color: colors.neutral900,
  },
  summaryText: {
    margin: 0,
    fontFamily: fonts.family.primary,
    fontSize: fonts.control.sm,
    lineHeight: "20px",
    color: colors.neutral900,
  },
  iconColumn: {
    display: "flex",
    flexDirection: "column",
    gap: spacing.s,
    flexShrink: 0,
  },
  iconAction: {
    width: 44,
    height: 44,
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.primary300,
    borderRadius: radii.xs,
    border: "none",
    padding: 10,
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
