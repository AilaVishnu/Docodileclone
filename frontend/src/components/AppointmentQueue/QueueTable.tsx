import React, { useState, useRef, useEffect, useMemo } from "react";
import { styles } from "./AppointmentQueue.styles";
import { fonts, colors } from "../../styles/theme";
import { StatusBadge, PayBadge } from "./StatusBadge";
import { Icon } from "../Icon";
import { ZeroQueue } from "./ZeroQueue";
import { loadStartedSet } from "../../utils/sessionStarted";

export type AppointmentStatus =
  | "WAITING"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "NO_SHOW"
  | "CANCELLED";

export type PayStatus = "PAID" | "DUE" | "NO PAY";

export type Appointment = {
  id: string;
  /** Patient UUID — used to resolve session-started flag for this row. */
  patientId?: string;
  patientName: string;
  patientPhone: string;
  patientEmail?: string;
  patientGender?: string;
  patientDob?: string;
  patientAge?: number;
  /** Per-clinic sequential patient number ("T###"). */
  patientDisplayNo?: number | null;
  type: "New" | "Review";
  service?: string;
  scheduledTime: string;
  rawScheduledTime?: string;
  isWalkin: boolean;
  status: AppointmentStatus;
  payStatus: PayStatus;
  paymentMethod?: string;
  doctorId?: string;
  notes?: string;
  fee?: number;
  /** Latest pharmacy (medicines) bill total, written by the single Bill flow
   *  alongside the consultation `fee` — kept separate so finance can split
   *  consultation vs pharmacy revenue. */
  pharmacyAmount?: number;
  /** The patient's running advance/deposit balance. Seeds the bill's Deposit
   *  field and auto-covers the bill on Charge & Bill; adjusted via the drawer. */
  deposit?: number;
  /** Bills the patient already has for this date. 0 → kebab shows "Bill";
   *  > 0 → it shows "Create Bill" + "View Bills". */
  todayBillCount?: number;
  /** True when the linked patient has been archived. Drives "patient is
   *  archived" toasts in queue/pad navigation. */
  patientArchived?: boolean;
  /** Wall-clock ISO when the appointment was created. Used to gate the
   *  24h "edit window" — past that, Edit Appointment is suppressed. */
  createdAt?: string;
};

type MenuItem = {
  label: string;
  onClick: (appointment: Appointment) => void;
  // Optional per-row gate — return false to omit this menu item for a
  // given appointment. Lets the parent show an action only for the rows it
  // applies to, without duplicating menus.
  visible?: (appointment: Appointment) => boolean;
};

type QueueTableProps = {
  appointments: Appointment[];
  doctorName?: string;
  menuItems?: MenuItem[];
  onStatusChange?: (appointmentId: string, newStatus: string) => void;
  /** appointmentId → backend session start (ISO) for in-progress visits.
   *  Drives the live consultation timer on the IN_PROGRESS status badge. */
  sessionStarts?: Record<string, string>;
};

// Front-desk status actions. Completion is intentionally NOT here — only the
// doctor marks a visit complete (via "Complete visit" on the prescription pad).
// UNSEEN is also intentionally absent: it's an AUTO-only state set by the
// NoShowSweepJob when an At-Doc pad is never opened within 24h, never by hand
// (the backend rejects a manual UNSEEN too).
const STATUS_OPTIONS = [
  { label: "No-Show", value: "NO_SHOW" },
  { label: "Arrived", value: "WAITING" },
  { label: "Send to Doc", value: "IN_PROGRESS" },
  { label: "Cancel", value: "CANCELLED" },
];

// Display phone as bare local digits: drop a leading 91 country code and any
// spaces/symbols ("+91 98765 43210" -> "9876543210").
function formatPhone(raw: string): string {
  if (!raw) return raw;
  const digits = raw.replace(/\D/g, "");
  return digits.length > 10 && digits.startsWith("91") ? digits.slice(2) : digits;
}

// Empty flexible spacer cells placed between every column. Being the only
// width-less columns (table-layout: fixed), they share the leftover width
// EQUALLY, so the inter-column gaps stretch/squeeze together.
const spacerTh: React.CSSProperties = { borderBottom: `1px solid ${colors.primary300}`, padding: 0 };
const spacerTd: React.CSSProperties = { padding: 0 };

function StatusDropdown({ appointment, currentStatus, onStatusChange, sessionStartedAt }: {
  appointment: Appointment;
  currentStatus: string;
  onStatusChange: (appointmentId: string, newStatus: string) => void;
  sessionStartedAt?: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  // "In progress" = the consultation session is live. The server owns this
  // (sessionStartedAt, per appointment, from getActiveSessions) — that's the
  // source of truth across devices; the per-device localStorage flag is only a
  // fallback for before the session map has loaded.
  const [localStarted, setLocalStarted] = useState(() =>
    appointment.patientId ? loadStartedSet().has(appointment.patientId) : false
  );
  const timerStarted = !!sessionStartedAt || localStarted;
  const ref = useRef<HTMLDivElement>(null);
  // Lock the status badge while the doctor's actually in a session for
  // this patient — but only if the appointment is in flight. A stale
  // "started" flag from a previous appointment (the flag persists in
  // localStorage indefinitely) shouldn't block status changes on a new
  // BOOKED / AT_DOC row.
  const isLocked = currentStatus === "COMPLETED"
    || (timerStarted && (currentStatus === "IN_PROGRESS" || currentStatus === "AT_DOC"));

  useEffect(() => {
    if (!appointment.patientId) return;
    const pid = appointment.patientId;
    const interval = setInterval(() => {
      setLocalStarted(loadStartedSet().has(pid));
    }, 1000);
    return () => clearInterval(interval);
  }, [appointment.patientId]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setIsOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={ref} style={{ position: "relative", display: "inline-block" }}>
      <StatusBadge
        status={currentStatus}
        sessionStartedAt={sessionStartedAt}
        onClick={isLocked ? undefined : () => setIsOpen(!isOpen)}
      />
      {isOpen && (
        <div style={{
          // Unified menu spec — see also TopNav.dropdown and actionMenu styles.
          position: "absolute",
          top: "calc(100% + 4px)",
          left: "50%",
          transform: "translateX(-50%)",
          backgroundColor: colors.neutral100,
          borderRadius: "12px",
          boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
          zIndex: 100,
          minWidth: "160px",
          padding: "12px 8px",
          display: "flex",
          flexDirection: "column",
          gap: "4px",
        }}>
          {STATUS_OPTIONS.map((opt) => (
            <div
              key={opt.value}
              onClick={() => {
                onStatusChange(appointment.id, opt.value);
                setIsOpen(false);
              }}
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = colors.active.shade200; }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "transparent"; }}
              style={{
                padding: "10px 16px",
                cursor: "pointer",
                borderRadius: "8px",
                fontSize: fonts.size.s,
                color: colors.neutral900,
                fontFamily: fonts.family.primary,
                transition: "background-color 0.15s",
              }}
            >
              {opt.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}



// ── Type badge (☆ New / ↺ Review) ────────────────────────────────────────
function TypeBadge({ type }: { type: "New" | "Review" }) {
  return <span style={styles.typeBadge}>{type === "New" ? "New" : "Review"}</span>;
}

// ── Three-dot action menu ─────────────────────────────────────────────────
function ActionMenu({
  appointment,
  menuItems,
  openUpward,
}: {
  appointment: Appointment;
  menuItems: MenuItem[];
  openUpward?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node))
        setIsOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <button
        style={styles.actionButton}
        onClick={() => setIsOpen(!isOpen)}
      >
        <Icon name="menu" size={24} tone="inherit" />
      </button>
      {isOpen && (
        <div
          style={{
            ...styles.actionMenu,
            ...(openUpward ? { top: "auto", bottom: "100%" } : {}),
          }}
        >
          {menuItems.filter((item) => item.visible?.(appointment) !== false).map((item, i) => (
            <div
              key={i}
              style={styles.actionMenuItem}
              onClick={() => {
                item.onClick(appointment);
                setIsOpen(false);
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = colors.active.shade200;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "transparent";
              }}
            >
              {item.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Main table ────────────────────────────────────────────────────────────
export function QueueTable({
  appointments,
  doctorName,
  menuItems,
  onStatusChange,
  sessionStarts,
}: QueueTableProps) {
  // Patient T-id map — same localStorage-backed counter that BookAppointment
  // and PrescriptionQueue use. Keyed by appointment id; missing keys render
  // a "T---" placeholder so the column stays uniform width.
  const patientIdMap = useMemo<Record<string, number>>(() => {
    try {
      return JSON.parse(localStorage.getItem("docodile_patient_map") || "{}");
    } catch {
      return {};
    }
  }, []);
  const tIdFor = (aptId: string) => {
    const n = patientIdMap[aptId];
    return n ? `T${String(n).padStart(3, "0")}` : "T---";
  };

  if (appointments.length === 0) {
    return <ZeroQueue />;
  }
  return (
    <div style={styles.tableContainer}>
      <table style={styles.table}>
        <colgroup>
          {/* Every real column is a fixed-width cap. The one empty spacer
              (after Name) is the only flexible column, so it absorbs all
              leftover width: Name stays capped at 256 (truncates), the 3-dots
              stays exactly 24px, and the name↔phone gap stretches/squeezes as
              the queue resizes. */}
          <col style={{ width: "56px" }} />   {/* # (T-number e.g. T001) */}
          <col />
          <col style={{ width: "var(--queue-name-w)" }} />  {/* Name (256 / 200, truncates) */}
          <col />
          <col style={{ width: "108px" }} />  {/* Phone */}
          <col />
          <col style={{ width: "72px" }} />   {/* Service */}
          <col />
          <col style={{ width: "96px" }} />   {/* Type */}
          <col />
          <col style={{ width: "84px" }} />   {/* Time */}
          <col />
          <col style={{ width: "98px" }} />   {/* Status */}
          <col />
          <col style={{ width: "44px" }} />   {/* Pay (icon only) */}
          <col />
          <col style={{ width: "24px" }} />   {/* 3-dots */}
        </colgroup>
        <thead>
          <tr>
            {/* Real header cells with empty flexible spacer <th>s between them
                (matching the colgroup) so the inter-column gaps stretch equally. */}
            <th style={{ ...styles.th, textAlign: "left", paddingLeft: 8, paddingRight: 0 }}>#</th>
            <th style={spacerTh} aria-hidden />
            <th style={{ ...styles.th, textAlign: "left", paddingLeft: "0", paddingRight: "4px" }}>Name</th>
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
            <th style={{ ...styles.th, textAlign: "center", paddingLeft: "4px", paddingRight: "4px" }}>Pay</th>
            <th style={spacerTh} aria-hidden />
            <th style={{ ...styles.th, paddingLeft: 0, paddingRight: 0 }}></th>
          </tr>
        </thead>
        <tbody>
          {appointments.length === 0 ? (
            <tr>
              <td
                colSpan={17}
                style={{
                  ...styles.td,
                  textAlign: "center",
                  padding: "48px",
                  color: colors.neutral400,
                }}
              >
                No appointments for {doctorName || "this doctor"} today
              </td>
            </tr>
          ) : (
            appointments.map((apt, index) => {
              const isCompleted = apt.status === "COMPLETED";
              const isNoShow = apt.status === "NO_SHOW";
              const isInProgress = apt.status === "IN_PROGRESS";
              const isCancelled = apt.status === "CANCELLED";
              const baseBg = isInProgress ? colors.primary200 : isCompleted ? colors.secondary50 : (isNoShow || isCancelled) ? colors.neutralAlphaBlack : "transparent";
              const prevStatus = index > 0 ? appointments[index - 1].status : apt.status;
              const groupKey = (s: string) => (s === "CANCELLED" || s === "NO_SHOW") ? "INACTIVE" : s;
              const isNewGroup = index > 0 && groupKey(apt.status) !== groupKey(prevStatus);
              return (
                <React.Fragment key={apt.id}>
                  {isNewGroup && (
                    <tr><td colSpan={17} style={{ height: "40px", border: "none", padding: 0 }}>
                      <div style={{
                        height: "100%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}>
                        <div style={{
                          width: "1.5px",
                          height: "20px",
                          backgroundColor: colors.primary300,
                        }} />
                      </div>
                    </td></tr>
                  )}
                  <tr
                    style={{ ...styles.tr, backgroundColor: baseBg }}
                    onMouseEnter={(e) => {
                      if (!isCompleted && !isNoShow && !isInProgress && !isCancelled) {
                        (e.currentTarget as HTMLElement).style.backgroundColor =
                          "rgba(0,0,0,0.018)";
                      }
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLElement).style.backgroundColor = baseBg;
                    }}
                  >
                    {/* # — T-number (e.g. T001). Falls back to "T---" when
                        the appointment is not in the local id map. */}
                    <td style={{ ...styles.serialCell, paddingLeft: 8 }}>
                      {tIdFor(apt.id)}
                    </td>

                    <td style={spacerTd} aria-hidden />

                    {/* Name — "<name> (M|64)" all in one style. */}
                    <td style={styles.nameCell}>
                      <span style={styles.namePrimary}>
                        {apt.patientName}
                        {(() => {
                          const g = apt.patientGender ? apt.patientGender.charAt(0).toUpperCase() : "";
                          const years = apt.patientAge != null && apt.patientAge > 0 ? Math.floor(apt.patientAge / 12) : null;
                          const parts = [g, years != null ? String(years) : ""].filter(Boolean);
                          return parts.length ? ` (${parts.join("|")})` : "";
                        })()}
                      </span>
                    </td>

                    <td style={spacerTd} aria-hidden />

                    {/* Phone — bare 10 digits (no +91, no mid-space) to save width */}
                    <td style={{ ...styles.td, textAlign: "center", paddingLeft: "4px", paddingRight: "4px" }}>{formatPhone(apt.patientPhone)}</td>

                    <td style={spacerTd} aria-hidden />

                    {/* Service */}
                    <td style={{ ...styles.td, textAlign: "center", paddingLeft: "4px", paddingRight: "4px", maxWidth: 0 }}>
                      <div
                        title={apt.service || ""}
                        style={{
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {apt.service
                          ? apt.service
                            .replace(/Consultation/gi, "C")
                            .replace(/Hydrafacial/gi, "HF")
                            .replace(/Laser Hair Removal/gi, "LHR")
                            .replace(/Skin Tag Removal/gi, "SKR")
                            .replace(/Acne Scar Treatment/gi, "AST")
                          : "—"}
                      </div>
                    </td>

                    <td style={spacerTd} aria-hidden />

                    {/* Type */}
                    <td style={{ ...styles.td, textAlign: "center", padding: "10px 4px" }}>
                      <TypeBadge type={apt.type} />
                    </td>

                    <td style={spacerTd} aria-hidden />

                    {/* Time + Walk-in tag — stacked so the pill doesn't collide
                        with the Status column when the row is narrow. */}
                    <td style={{ ...styles.td, textAlign: "center", padding: "10px 4px" }}>
                      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                        <span style={styles.time}>{apt.scheduledTime}</span>
                        {apt.isWalkin && (
                          <span style={styles.walkinBadge}>Walk-in</span>
                        )}
                      </div>
                    </td>

                    <td style={spacerTd} aria-hidden />

                    {/* Status badge */}
                    <td style={{ ...styles.td, textAlign: "center", padding: "10px 4px" }}>
                      {onStatusChange ? (
                        <StatusDropdown
                          appointment={apt}
                          currentStatus={apt.status}
                          onStatusChange={onStatusChange}
                          sessionStartedAt={sessionStarts?.[apt.id]}
                        />
                      ) : (
                        <StatusBadge status={apt.status} sessionStartedAt={sessionStarts?.[apt.id]} />
                      )}
                    </td>

                    <td style={spacerTd} aria-hidden />

                    {/* Pay status */}
                    <td style={{ ...styles.payCell, textAlign: "center", paddingLeft: "4px", paddingRight: "4px" }}>
                      <PayBadge status={apt.payStatus} />
                    </td>

                    <td style={spacerTd} aria-hidden />

                    {/* Action menu — zero horizontal padding */}
                    <td style={{ ...styles.td, padding: "10px 0" }}>
                      {menuItems && menuItems.length > 0 ? (
                        <ActionMenu
                          appointment={apt}
                          menuItems={menuItems}
                          openUpward={index >= appointments.length - 2}
                        />
                      ) : (
                        <button style={styles.actionButton}>
                          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <circle cx="12" cy="5" r="1.5" fill="#000" />
                            <circle cx="12" cy="12" r="1.5" fill="#000" />
                            <circle cx="12" cy="19" r="1.5" fill="#000" />
                          </svg>
                        </button>
                      )}
                    </td>
                  </tr>
                </React.Fragment>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}
