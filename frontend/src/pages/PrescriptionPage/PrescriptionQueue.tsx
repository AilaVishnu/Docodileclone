import React, { useEffect, useMemo, useState } from "react";
import { API_BASE_URL } from "../../apiConfig";
import { Patient } from "../../hooks/usePatients";
import { pickAvatar } from "../../utils/avatar";
import { Button } from "../../components/Button";
import { DatePicker } from "../../components/AppointmentQueue/DatePicker";
import { loadStartedSet } from "../../utils/sessionStarted";
import { ReactComponent as ListSortIcon } from "../../assets/icons/list-sort.svg";
import { ReactComponent as WidgetIcon } from "../../assets/icons/widget.svg";
import { ReactComponent as RestartIcon } from "../../assets/icons/restart-24.svg";
import { colors, fonts, radii, spacing } from "../../styles/theme";
import { styles } from "./PrescriptionQueue.styles";

// ─────────────────────────────────────────────────────────────────────────────
// Internal landing of the Prescription page — Figma 2282:17378.
// "Today's Queue": one card per appointment scheduled today, with a "View
// Pad" button that opens that patient's prescription form. Uses the same
// /api/tenant/appointments endpoint the Appointment Queue uses, so both
// tabs render the same dataset.
// ─────────────────────────────────────────────────────────────────────────────

type AppointmentRow = {
  id: string;
  patientId: string;
  patientName: string;
  patientPhone: string | null;
  patientGender: string | null;
  patientDob: string | null;
  patientAge: number | null; // months
  service: string | null;
  type: string | null;
  status: string | null;
  scheduledTime: string | null;
};

type StatusFilter = "all" | "AT_DOC" | "IN_PROGRESS" | "WAITING" | "COMPLETED";
type ViewMode = "grid" | "list";

type PrescriptionQueueProps = {
  onSelect: (patient: Patient, appointmentId: string) => void;
};

const TAB_ITEMS: { id: StatusFilter; label: string }[] = [
  { id: "all", label: "View all" },
  { id: "AT_DOC", label: "At Doc" },
  { id: "IN_PROGRESS", label: "In Progress" },
  { id: "WAITING", label: "Waiting" },
  { id: "COMPLETED", label: "Completed" },
];

export function PrescriptionQueue({ onSelect }: PrescriptionQueueProps) {
  const [appointments, setAppointments] = useState<AppointmentRow[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  // Selected date for the queue. Defaults to today; clicking the date in
  // the title opens a DatePicker (same component the Appointment Queue uses).
  const [selectedDate, setSelectedDate] = useState<Date>(() => new Date());
  const [showDatePicker, setShowDatePicker] = useState<boolean>(false);
  // Set of patient ids whose prescription session has been started on
  // this device. Loaded on mount and on every fetch (so transitions made
  // inside the form propagate back when the user returns to the queue).
  const [startedSet, setStartedSet] = useState<Set<string>>(loadStartedSet);
  useEffect(() => {
    setStartedSet(loadStartedSet());
  }, [appointments]);

  useEffect(() => {
    const dateStr = `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, "0")}-${String(selectedDate.getDate()).padStart(2, "0")}`;
    const token = localStorage.getItem("docodile_token");
    const controller = new AbortController();
    setLoading(true);
    setError(null);
    // Same endpoint as the Appointment Queue so both views share the same
    // dataset and the JWT clinic guard applies symmetrically.
    fetch(`${API_BASE_URL}/api/tenant/appointments?date=${dateStr}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      signal: controller.signal,
    })
      .then(async (r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return (await r.json()) as AppointmentRow[];
      })
      .then(setAppointments)
      .catch((e) => {
        if ((e as Error).name === "AbortError") return;
        setError((e as Error).message);
        setAppointments([]);
      })
      .finally(() => setLoading(false));
    return () => controller.abort();
  }, [selectedDate]);

  const filtered = useMemo(() => {
    // Only patients actually present at the clinic appear in this queue —
    // skip Booked (not yet checked in), Cancelled, and No-Show.
    const HIDDEN_STATUSES = new Set(["BOOKED", "CANCELLED", "NO_SHOW"]);
    const visible = appointments.filter(
      (a) => a.status == null || !HIDDEN_STATUSES.has(a.status),
    );
    let result: AppointmentRow[];
    if (statusFilter === "all") result = visible;
    else if (statusFilter === "AT_DOC") {
      // "At Doc" = sent to doctor, Start Session not clicked yet.
      result = visible.filter(
        (a) => a.status === "IN_PROGRESS" && !startedSet.has(a.patientId),
      );
    } else if (statusFilter === "IN_PROGRESS") {
      // "In Progress" = doctor has clicked Start Session for this patient.
      result = visible.filter(
        (a) => a.status === "IN_PROGRESS" && startedSet.has(a.patientId),
      );
    } else {
      result = visible.filter((a) => a.status === statusFilter);
    }
    // Group-priority sort so both grid and list views read in the same
    // top-down order (At Doc → In Progress → Waiting → Completed).
    return [...result].sort(
      (a, b) =>
        groupOrder(groupKeyFor(a, startedSet)) -
        groupOrder(groupKeyFor(b, startedSet)),
    );
  }, [appointments, statusFilter, startedSet]);

  // Patient T-ID is the same client-side counter used by BookAppointment —
  // keyed by appointment id, so look up the same map here.
  const patientIdMap = useMemo<Record<string, number>>(() => {
    try {
      return JSON.parse(localStorage.getItem("docodile_patient_map") || "{}");
    } catch {
      return {};
    }
  }, []);

  const handleViewPad = (apt: AppointmentRow) => {
    // Just open the form; the "started" flag now flips when the doctor
    // clicks Start Session inside the form (handled by PrescriptionPage).
    const patient: Patient = {
      id: apt.patientId,
      name: apt.patientName,
      phone: apt.patientPhone,
      gender: apt.patientGender,
      dob: apt.patientDob,
      age: apt.patientAge,
      lastVisitDate: null,
    };
    onSelect(patient, apt.id);
  };

  const renderCards = () => {
    if (loading) return <div style={styles.empty}>Loading queue…</div>;
    if (error) return <div style={styles.empty}>Failed to load queue ({error}).</div>;
    if (filtered.length === 0) {
      return (
        <div style={styles.empty}>
          {statusFilter === "all"
            ? "No appointments scheduled for today."
            : `No ${TAB_ITEMS.find((t) => t.id === statusFilter)?.label.toLowerCase()} appointments today.`}
        </div>
      );
    }
    if (viewMode === "list") {
      return (
        <PatientListTable
          appointments={filtered}
          patientIdMap={patientIdMap}
          startedSet={startedSet}
          onViewPad={handleViewPad}
          // PatientListTable still keys by patientId via apt.patientId
        />
      );
    }
    return (
      <div style={styles.grid}>
        {filtered.map((apt) => (
          <PatientCard
            key={apt.id}
            apt={apt}
            tNumber={patientIdMap[apt.id]}
            started={startedSet.has(apt.patientId)}
            mode={viewMode}
            onViewPad={() => handleViewPad(apt)}
          />
        ))}
      </div>
    );
  };

  const isToday = sameDay(selectedDate, new Date());
  const dateLabel = isToday
    ? "Today’s"
    : selectedDate.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "2-digit" });

  return (
    <div style={styles.page}>
      <h1 style={styles.title}>
        <span
          onClick={() => setShowDatePicker((v) => !v)}
          style={{
            textDecoration: "underline",
            cursor: "pointer",
            color: colors.neutral900,
          }}
        >
          {dateLabel}
        </span>{" "}
        Queue
      </h1>

      {showDatePicker && (
        <div style={{ position: "relative", alignSelf: "center" }}>
          <DatePicker
            selectedDate={selectedDate}
            onSelect={(d) => {
              setSelectedDate(d);
              setShowDatePicker(false);
            }}
            onClose={() => setShowDatePicker(false)}
            showDoneButton
          />
        </div>
      )}

      <div style={styles.controls}>
        <div style={styles.tabs} role="tablist" aria-label="Filter by status">
          {TAB_ITEMS.map((t) => {
            const active = t.id === statusFilter;
            return (
              <button
                key={t.id}
                type="button"
                role="tab"
                aria-selected={active}
                style={{ ...styles.tab, ...(active ? styles.tabActive : null) }}
                onClick={() => setStatusFilter(t.id)}
              >
                {t.label}
              </button>
            );
          })}
        </div>

        <div style={styles.viewToggle} aria-label="View mode">
          <button
            type="button"
            style={{ ...styles.viewBtn, ...(viewMode === "list" ? styles.viewBtnActive : null) }}
            onClick={() => setViewMode("list")}
            aria-label="List view"
            aria-pressed={viewMode === "list"}
          >
            <ListSortIcon width={20} height={20} />
          </button>
          <button
            type="button"
            style={{ ...styles.viewBtn, ...(viewMode === "grid" ? styles.viewBtnActive : null) }}
            onClick={() => setViewMode("grid")}
            aria-label="Grid view"
            aria-pressed={viewMode === "grid"}
          >
            <WidgetIcon width={20} height={20} />
          </button>
        </div>
      </div>

      {renderCards()}
    </div>
  );
}

// ─── Card ────────────────────────────────────────────────────────────────────

function PatientCard({
  apt,
  tNumber,
  started,
  mode,
  onViewPad,
}: {
  apt: AppointmentRow;
  tNumber: number | undefined;
  started: boolean;
  mode: ViewMode;
  onViewPad: () => void;
}) {
  const tId = tNumber ? `T${String(tNumber).padStart(3, "0")}` : "T---";
  const ageYears = apt.patientAge != null ? Math.floor(apt.patientAge / 12) : null;
  const meta = formatGenderAge(apt.patientGender, ageYears);
  const avatar = pickAvatar({ gender: apt.patientGender, ageYears });
  const time = formatTime(apt.scheduledTime);
  const isList = mode === "list";

  // Peach primary500 outline highlights cards whose prescription is
  // actively in progress (IN_PROGRESS + the doctor has clicked View Pad
  // on this device). All other states render with a transparent border
  // so the card sits flat on the page.
  const inProgress = apt.status === "IN_PROGRESS" && started;
  const cardStyle = isList
    ? styles.cardList
    : inProgress
      ? styles.cardGrid
      : { ...styles.cardGrid, ...styles.cardGridIdle };

  return (
    <div style={cardStyle}>
      <img
        src={avatar}
        alt=""
        style={isList ? styles.cardListAvatar : styles.cardAvatar}
      />
      <div style={isList ? styles.cardListBody : styles.cardBody}>
        <p style={styles.cardTitle}>
          <span style={styles.cardTitleName}>{tId}: {apt.patientName}</span>
          {meta && (
            <>
              <br />
              <span style={styles.cardTitleMeta}>{meta}</span>
            </>
          )}
        </p>
        <div style={styles.cardRows}>
          <CardRow label="Service" value={abbreviateService(apt.service)} />
          <CardRow
            label="Type"
            value={
              <span style={styles.typeRow}>
                <RestartIcon width={18} height={18} />
                {apt.type ?? "—"}
              </span>
            }
          />
          <CardRow label="Time" value={time} />
          <CardRow
            label="Status"
            value={<StatusPill status={apt.status} started={started} />}
          />
        </div>
        <div style={styles.cardFooter}>
          <Button variant="dark" size="sm" onClick={onViewPad}>View Pad</Button>
        </div>
      </div>
    </div>
  );
}

// ─── List view (Appointment Queue-style table) ───────────────────────────────

function PatientListTable({
  appointments,
  patientIdMap,
  startedSet,
  onViewPad,
}: {
  appointments: AppointmentRow[];
  patientIdMap: Record<string, number>;
  startedSet: Set<string>;
  onViewPad: (apt: AppointmentRow) => void;
}) {
  // The parent already sorts by status-group priority; we just walk that
  // list and drop a thin vertical-line separator row whenever the group
  // changes, mirroring the AppointmentQueue table.
  return (
    <div style={styles.tableWrap}>
      <table style={styles.table}>
        <colgroup>
          <col style={{ width: 48 }} />
          <col style={{ width: "26%" }} />
          <col style={{ width: "16%" }} />
          <col style={{ width: "12%" }} />
          <col style={{ width: "10%" }} />
          <col style={{ width: "10%" }} />
          <col style={{ width: "12%" }} />
          <col style={{ width: 120 }} />
        </colgroup>
        <thead>
          <tr>
            <th style={styles.th}>#</th>
            <th style={styles.th}>Name</th>
            <th style={{ ...styles.th, textAlign: "center" }}>Phone</th>
            <th style={{ ...styles.th, textAlign: "center" }}>Service</th>
            <th style={{ ...styles.th, textAlign: "center" }}>Type</th>
            <th style={{ ...styles.th, textAlign: "center" }}>Time</th>
            <th style={{ ...styles.th, textAlign: "center" }}>Status</th>
            <th style={styles.th} />
          </tr>
        </thead>
        <tbody>
          {appointments.map((apt, index) => {
            const ageYears =
              apt.patientAge != null ? Math.floor(apt.patientAge / 12) : null;
            const tNum = patientIdMap[apt.id];
            const started = startedSet.has(apt.patientId);
            const rowBg = rowBgFor(apt.status, started);
            const group = groupKeyFor(apt, startedSet);
            const prevGroup =
              index > 0 ? groupKeyFor(appointments[index - 1], startedSet) : group;
            const isNewGroup = index > 0 && group !== prevGroup;
            return (
              <React.Fragment key={apt.id}>
                {isNewGroup && (
                  <tr>
                    <td colSpan={8} style={{ height: 40, border: "none", padding: 0 }}>
                      <div
                        style={{
                          height: "100%",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <div
                          style={{
                            width: 1.5,
                            height: 20,
                            backgroundColor: colors.primary300,
                          }}
                        />
                      </div>
                    </td>
                  </tr>
                )}
                <tr style={{ ...styles.tr, backgroundColor: rowBg }}>
                <td style={styles.tdSerial}>
                  {tNum
                    ? `T${String(tNum).padStart(3, "0")}`
                    : String(index + 1).padStart(2, "0")}
                </td>
                <td style={styles.tdName}>
                  <span style={styles.tdNameInner}>
                    <span style={styles.tdNamePrimary}>{apt.patientName}</span>
                    {(apt.patientGender || ageYears != null) && (
                      <span style={styles.tdNameMeta}>
                        {apt.patientGender
                          ? apt.patientGender.charAt(0).toUpperCase()
                          : "?"}
                        {ageYears != null && (
                          <>
                            <span style={styles.tdNameDivider}>|</span>
                            {ageYears}y
                          </>
                        )}
                      </span>
                    )}
                  </span>
                </td>
                <td style={{ ...styles.td, textAlign: "center" }}>
                  {apt.patientPhone ?? "—"}
                </td>
                <td style={{ ...styles.td, textAlign: "center" }}>
                  {abbreviateService(apt.service)}
                </td>
                <td style={{ ...styles.td, textAlign: "center" }}>
                  <span style={styles.typeRow}>
                    <RestartIcon width={18} height={18} />
                    {apt.type ?? "—"}
                  </span>
                </td>
                <td style={{ ...styles.td, textAlign: "center" }}>
                  {formatTime(apt.scheduledTime)}
                </td>
                <td style={{ ...styles.td, textAlign: "center" }}>
                  <StatusPill status={apt.status} started={started} />
                </td>
                <td style={{ ...styles.td, textAlign: "center" }}>
                  <Button variant="dark" size="sm" onClick={() => onViewPad(apt)}>
                    View Pad
                  </Button>
                </td>
                </tr>
              </React.Fragment>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function CardRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div style={styles.row}>
      <span style={styles.rowLabel}>{label}</span>
      <span style={styles.rowValue}>{value}</span>
    </div>
  );
}

// Queue status pill — Figma "Queue Status" component (566:10938 + 566:10941).
// Caption-size text on a 4px-radius colored pill. Backgrounds:
//   At Doc      — neutral/100 (white)
//   In Progress — secondary/100 (sage)
//   Waiting     — yellow/100
//   Completed   — green/100
function StatusPill({
  status,
  started,
}: {
  status: string | null;
  started: boolean;
}) {
  if (!status) return <>—</>;
  type PillKey = "AT_DOC" | "IN_PROGRESS" | "WAITING" | "COMPLETED";
  const variant: PillKey | null = (() => {
    if (status === "IN_PROGRESS") return started ? "IN_PROGRESS" : "AT_DOC";
    if (status === "WAITING") return "WAITING";
    if (status === "COMPLETED") return "COMPLETED";
    return null;
  })();
  if (!variant) return <span style={pillStyles.fallback}>{status}</span>;
  const META: Record<PillKey, { bg: string; label: string }> = {
    AT_DOC: { bg: colors.neutral100, label: "At Doc" },
    IN_PROGRESS: { bg: colors.secondary100, label: "In Progress" },
    WAITING: { bg: colors.yellow100, label: "Waiting" },
    COMPLETED: { bg: colors.green100, label: "Completed" },
  };
  const { bg, label } = META[variant];
  return <span style={{ ...pillStyles.base, backgroundColor: bg }}>{label}</span>;
}

const pillStyles: Record<string, React.CSSProperties> = {
  base: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    padding: `${spacing["2xs"]} ${spacing.xs}`,
    minWidth: 90,
    borderRadius: radii.xs,
    color: colors.neutral900,
    fontFamily: fonts.family.primary,
    // control.xs (static 12px) so the pill text never grows with the
    // page-level fluid type ramp; matches Figma 566:10941 caption.
    fontSize: fonts.control.xs,
    lineHeight: fonts.lineHeight.xs,
    fontWeight: fonts.weight.regular,
  },
  fallback: {
    color: colors.neutral500,
    fontFamily: fonts.family.primary,
    fontSize: fonts.control.xs,
    lineHeight: fonts.lineHeight.xs,
  },
};

// ─── helpers ─────────────────────────────────────────────────────────────────

function formatGenderAge(gender: string | null, ageYears: number | null): string {
  if (!gender && ageYears == null) return "";
  const g = (gender || "").trim();
  const short = g.toLowerCase().startsWith("m")
    ? "M"
    : g.toLowerCase().startsWith("f")
      ? "F"
      : g.charAt(0).toUpperCase() || "?";
  if (ageYears == null) return `(${short})`;
  return `(${short}|${ageYears})`;
}

// Per Figma 1932:2438 — the queue table tints rows by status so groups
// read at a glance. We mirror the same wash but only for statuses we
// actually surface in the prescription view (BOOKED / NO_SHOW / CANCELLED
// are filtered out before reaching here).
function rowBgFor(status: string | null, started: boolean): string {
  if (status === "IN_PROGRESS") {
    // "At Doc" (not yet started) gets the highlighted primary200 wash —
    // matches Figma's first row that the doctor is currently with.
    // Once the prescription pad is opened, the row drops to a softer
    // secondary50 wash to read as "actively being worked on".
    return started ? colors.secondary50 : colors.primary200;
  }
  if (status === "COMPLETED") return colors.secondary50;
  return "transparent";
}

function sameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

// Mirror the AppointmentQueue's row grouping: bucket each appointment into
// a status group ("AT_DOC" / "IN_PROGRESS" / "WAITING" / "COMPLETED") and
// keep that order so groups read top-to-bottom in the same priority the
// queue tab list uses.
function groupKeyFor(apt: AppointmentRow, startedSet: Set<string>): string {
  if (apt.status === "IN_PROGRESS") {
    return startedSet.has(apt.patientId) ? "IN_PROGRESS" : "AT_DOC";
  }
  return apt.status || "OTHER";
}

const GROUP_ORDER = ["AT_DOC", "IN_PROGRESS", "WAITING", "COMPLETED"];
function groupOrder(group: string): number {
  const i = GROUP_ORDER.indexOf(group);
  return i === -1 ? 99 : i;
}

// Service abbreviations — mirror the AppointmentQueue's QueueTable so the
// shortcut language is consistent across both views of the same dataset.
function abbreviateService(service: string | null): string {
  if (!service) return "—";
  return service
    .replace(/Consultation/gi, "C")
    .replace(/Hydrafacial/gi, "HF")
    .replace(/Laser Hair Removal/gi, "LHR")
    .replace(/Skin Tag Removal/gi, "SKR")
    .replace(/Acne Scar Treatment/gi, "AST");
}

function formatTime(iso: string | null): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "—";
  let h = d.getHours();
  const m = String(d.getMinutes()).padStart(2, "0");
  const ampm = h >= 12 ? "PM" : "AM";
  if (h > 12) h -= 12;
  if (h === 0) h = 12;
  return `${h}:${m} ${ampm}`;
}
