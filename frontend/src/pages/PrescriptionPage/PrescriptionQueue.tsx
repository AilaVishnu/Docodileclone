import React, { useEffect, useMemo, useState } from "react";
import { API_BASE_URL } from "../../apiConfig";
import { Patient } from "../../hooks/usePatients";
import { pickAvatar } from "../../utils/avatar";
import { Button } from "../../components/Button";
import { DatePicker } from "../../components/DatePicker/DatePicker";
import { loadStartedSet } from "../../utils/sessionStarted";
import { ReactComponent as ListSortIcon } from "../../assets/icons/list-sort.svg";
import { ReactComponent as WidgetIcon } from "../../assets/icons/widget.svg";
import { PageHeader } from "../../components/PageHeader/PageHeader";
import { ChevronDown } from "../../components/icons/ChevronDown";
import { StatusBadge } from "../../components/AppointmentQueue/StatusBadge";
import { Tabs } from "../../components/Tabs";
import { colors, radii } from "../../styles/theme";
import { styles } from "./PrescriptionQueue.styles";
import { Toast } from "../../components/Toast";

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
  patientDisplayNo: number | null; // per-clinic "T###" number
  service: string | null;
  type: string | null;
  status: string | null;
  scheduledTime: string | null;
  doctorId: string;
  patientArchived?: boolean;
};

type StatusFilter = "all" | "AT_DOC" | "IN_PROGRESS" | "WAITING" | "COMPLETED";
type ViewMode = "grid" | "list";

type PrescriptionQueueProps = {
  onSelect: (patient: Patient, appointmentId: string, queueDate: string, doctorId: string) => void;
  // Bumped by the parent (HomePage) after a walk-in is created, so this
  // queue refetches today's appointments and the new card appears.
  refreshKey?: number;
};

const TAB_ITEMS: { id: StatusFilter; label: string }[] = [
  { id: "all", label: "View all" },
  { id: "AT_DOC", label: "At Doc" },
  { id: "IN_PROGRESS", label: "Ongoing" },
  { id: "WAITING", label: "Waiting" },
  { id: "COMPLETED", label: "Completed" },
];

export function PrescriptionQueue({ onSelect, refreshKey }: PrescriptionQueueProps) {
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
  const [toastMsg, setToastMsg] = useState<string>("");
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
      // Legacy walk-in rows may carry "AT_DOC" — the existing pill/filter/group
      // code is keyed off "IN_PROGRESS", so normalise at ingest and let the
      // started-set decide the visual ("At Doc" vs "In Progress").
      .then((rows) => rows.map((a) => (
        a.status === "AT_DOC" ? { ...a, status: "IN_PROGRESS" } : a
      )))
      .then(setAppointments)
      .catch((e) => {
        if ((e as Error).name === "AbortError") return;
        setError((e as Error).message);
        setAppointments([]);
      })
      .finally(() => setLoading(false));
    return () => controller.abort();
  }, [selectedDate, refreshKey]);

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

  // Patient T-ID — the real per-clinic number now comes from the backend
  // (apt.patientDisplayNo). This legacy localStorage map is kept only as a
  // fallback for rows that predate the backend backfill (displayNo null).
  const patientIdMap = useMemo<Record<string, number>>(() => {
    try {
      return JSON.parse(localStorage.getItem("docodile_patient_map") || "{}");
    } catch {
      return {};
    }
  }, []);

  const handleViewPad = (apt: AppointmentRow) => {
    // Archived patients stay visible in the queue (the receptionist still
    // needs to see who was scheduled) but the doctor can't open the pad —
    // archiving is the signal to stop adding to that patient's chart.
    if (apt.patientArchived) {
      setToastMsg(`${apt.patientName} is archived — restore the patient to continue.`);
      return;
    }
    // Just open the form; the "started" flag now flips when the doctor
    // clicks Start Session inside the form (handled by PrescriptionPage).
    const patient: Patient = {
      id: apt.patientId,
      name: apt.patientName,
      phone: apt.patientPhone,
      email: null,
      gender: apt.patientGender,
      dob: apt.patientDob,
      age: apt.patientAge,
      displayNo: apt.patientDisplayNo,
      lastVisitDate: null,
      treatingDoctorIds: [],
      treatingDepartments: [],
    };
    const dateStr = `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, "0")}-${String(selectedDate.getDate()).padStart(2, "0")}`;
    onSelect(patient, apt.id, dateStr, apt.doctorId);
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
            tNumber={apt.patientDisplayNo ?? patientIdMap[apt.id]}
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
    ? "Today"
    : selectedDate.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "2-digit" });

  return (
    <div style={styles.page}>
      <PageHeader
        title={
          <>
            <span
              onClick={() => setShowDatePicker((v) => !v)}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                cursor: "pointer",
                color: colors.neutral900,
                backgroundColor: "transparent",
                border: `1px solid ${colors.primary400}`,
                borderRadius: radii.m,
                padding: "4px 12px",
                position: "relative",
                zIndex: showDatePicker ? 1100 : "auto",
              }}
            >
              {dateLabel}
              <ChevronDown open={showDatePicker} />
              {showDatePicker && (
                <DatePicker
                  selectedDate={selectedDate}
                  onSelect={(d) => {
                    setSelectedDate(d);
                    setShowDatePicker(false);
                  }}
                  onClose={() => setShowDatePicker(false)}
                  showDoneButton
                />
              )}
            </span>{" "}
            Queue
          </>
        }
      />

      <div style={styles.controls}>
        <Tabs
          variant="block"
          items={TAB_ITEMS}
          activeId={statusFilter}
          onSelect={(id) => setStatusFilter(id as StatusFilter)}
        />

        <div style={styles.viewToggle} aria-label="View mode">
          <button
            type="button"
            style={{ ...styles.viewBtn, ...(viewMode === "list" ? styles.viewBtnActive : null) }}
            onClick={() => setViewMode("list")}
            aria-label="List view"
            aria-pressed={viewMode === "list"}
          >
            <ListSortIcon width={20} height={20} strokeWidth={1.5} />
          </button>
          <button
            type="button"
            style={{ ...styles.viewBtn, ...(viewMode === "grid" ? styles.viewBtnActive : null) }}
            onClick={() => setViewMode("grid")}
            aria-label="Grid view"
            aria-pressed={viewMode === "grid"}
          >
            <WidgetIcon width={20} height={20} strokeWidth={1.5} />
          </button>
        </div>
      </div>

      {renderCards()}
      <Toast message={toastMsg} isVisible={!!toastMsg} onClose={() => setToastMsg("")} />
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
          {/* Two lines: T-number on top, then "<name> (M|64)". Both truncate
              with an ellipsis instead of wrapping. */}
          <span style={{ ...styles.cardTitleName, display: "block", maxWidth: "100%", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{tId}</span>
          <span style={{ ...styles.cardTitleMeta, display: "block", maxWidth: "100%", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            {apt.patientName}{meta ? ` ${meta}` : ""}
          </span>
        </p>
        <div style={styles.cardRows}>
          <CardRow label="Service" value={abbreviateService(apt.service)} />
          <CardRow
            label="Type"
            value={
              <span style={styles.typeRow}>
                {apt.type ?? "—"}
              </span>
            }
          />
          <CardRow label="Time" value={time} />
          <CardRow
            label="Status"
            value={apt.status ? <StatusBadge status={apt.status} started={started} /> : "—"}
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

// Spacer cells between data columns — bottom border continues across the row
// so the row underline reads as a single line. Mirrors the QueueTable pattern.
const spacerTh: React.CSSProperties = { borderBottom: `1px solid ${colors.primary300}`, padding: 0 };
const spacerTd: React.CSSProperties = { padding: 0 };

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
        {/* Spacer-cell pattern matches AppointmentQueue's QueueTable —
            fixed widths for every data column, one flexible spacer absorbs
            leftover width, the rest are uniform inter-column gaps. */}
        <colgroup>
          <col style={{ width: "56px" }} />        {/* # (T-number, e.g. T001) */}
          <col />                                   {/* flex spacer — absorbs leftover */}
          <col style={{ width: "var(--queue-name-w)" }} />  {/* Name (256 / 200, truncates) */}
          <col />
          <col style={{ width: "140px" }} />       {/* Phone (fits "+91 98888 88888") */}
          <col />
          <col style={{ width: "72px" }} />        {/* Service */}
          <col />
          <col style={{ width: "72px" }} />        {/* Type (text only) */}
          <col />
          <col style={{ width: "84px" }} />        {/* Time */}
          <col />
          <col style={{ width: "98px" }} />        {/* Status */}
          <col />
          <col style={{ width: "120px" }} />       {/* View Pad button */}
        </colgroup>
        <thead>
          <tr>
            <th style={{ ...styles.th, textAlign: "left", paddingLeft: 8, paddingRight: 0 }}>#</th>
            <th style={spacerTh} aria-hidden />
            <th style={{ ...styles.th, textAlign: "left", paddingLeft: 0, paddingRight: "4px" }}>Name</th>
            <th style={spacerTh} aria-hidden />
            <th style={{ ...styles.th, textAlign: "center", paddingLeft: "4px", paddingRight: "4px" }}>Phone</th>
            <th style={spacerTh} aria-hidden />
            <th style={{ ...styles.th, textAlign: "center", paddingLeft: "4px", paddingRight: "4px" }}>Service</th>
            <th style={spacerTh} aria-hidden />
            <th style={{ ...styles.th, textAlign: "center", paddingLeft: "4px", paddingRight: "4px" }}>Type</th>
            <th style={spacerTh} aria-hidden />
            <th style={{ ...styles.th, textAlign: "center", paddingLeft: "4px", paddingRight: "4px" }}>Time</th>
            <th style={spacerTh} aria-hidden />
            <th style={{ ...styles.th, textAlign: "center", paddingLeft: "4px", paddingRight: "4px" }}>Status</th>
            <th style={spacerTh} aria-hidden />
            <th style={{ ...styles.th, paddingLeft: 0, paddingRight: 0 }} />
          </tr>
        </thead>
        <tbody>
          {appointments.map((apt, index) => {
            const ageYears =
              apt.patientAge != null ? Math.floor(apt.patientAge / 12) : null;
            const tNum = apt.patientDisplayNo ?? patientIdMap[apt.id];
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
                    <td colSpan={15} style={{ height: 40, border: "none", padding: 0 }}>
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
                  {/* # — T-number with "T---" placeholder when the patient
                      isn't yet in the local id map (no fallback to a row
                      index — keep the column uniformly T-prefixed). */}
                  <td style={{ ...styles.tdSerial, paddingLeft: 8, paddingRight: 0 }}>
                    {tNum ? `T${String(tNum).padStart(3, "0")}` : "T---"}
                  </td>
                  <td style={spacerTd} aria-hidden />

                  {/* Name — "<name> (M|64)" inline, single font style. */}
                  <td style={{ ...styles.tdName, paddingLeft: 0, paddingRight: "4px" }}>
                    <span style={styles.tdNamePrimary}>
                      {apt.patientName}
                      {(() => {
                        const g = apt.patientGender ? apt.patientGender.charAt(0).toUpperCase() : "";
                        const parts = [g, ageYears != null ? String(ageYears) : ""].filter(Boolean);
                        return parts.length ? ` (${parts.join("|")})` : "";
                      })()}
                    </span>
                  </td>
                  <td style={spacerTd} aria-hidden />

                  {/* Phone */}
                  <td style={{ ...styles.td, textAlign: "center", paddingLeft: "4px", paddingRight: "4px" }}>
                    {apt.patientPhone ?? "—"}
                  </td>
                  <td style={spacerTd} aria-hidden />

                  {/* Service */}
                  <td style={{ ...styles.td, textAlign: "center", paddingLeft: "4px", paddingRight: "4px" }}>
                    {abbreviateService(apt.service)}
                  </td>
                  <td style={spacerTd} aria-hidden />

                  {/* Type — plain "New" / "Review" label (icons removed). */}
                  <td style={{ ...styles.td, textAlign: "center", paddingLeft: "4px", paddingRight: "4px" }}>
                    <span style={styles.typeRow}>
                      {apt.type ?? "—"}
                    </span>
                  </td>
                  <td style={spacerTd} aria-hidden />

                  {/* Time */}
                  <td style={{ ...styles.td, textAlign: "center", paddingLeft: "4px", paddingRight: "4px" }}>
                    {formatTime(apt.scheduledTime)}
                  </td>
                  <td style={spacerTd} aria-hidden />

                  {/* Status */}
                  <td style={{ ...styles.td, textAlign: "center", paddingLeft: "4px", paddingRight: "4px" }}>
                    {apt.status ? <StatusBadge status={apt.status} started={started} /> : "—"}
                  </td>
                  <td style={spacerTd} aria-hidden />

                  {/* View Pad */}
                  <td style={{ ...styles.td, textAlign: "center", paddingLeft: 0, paddingRight: 0 }}>
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
  // Text values (Service / Type / Time) truncate with an ellipsis inside the
  // 80px column. Skip the truncation for ReactNode values (Status pill) so
  // the pill's own min-width is not clipped by the column.
  const isText = typeof value === "string" || typeof value === "number";
  const truncate: React.CSSProperties = {
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  };
  return (
    <div style={styles.row}>
      <span style={{ ...styles.rowLabel, ...truncate }}>{label}</span>
      <span style={{ ...styles.rowValue, ...(isText ? truncate : {}) }}>{value}</span>
    </div>
  );
}

// StatusPill removed — the prescription queue now renders the shared
// <StatusBadge started> from components/AppointmentQueue/StatusBadge (one badge
// system across both queues). Its IN_PROGRESS+started case reads "Ongoing" on
// sage, matching the old pill.

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
