import React, { useState, useRef, useEffect, useMemo } from "react";
import { styles } from "./AppointmentQueue.styles";
import { fonts, colors } from "../../styles/theme";
import { StatusBadge, PayBadge } from "./StatusBadge";
import { ReactComponent as StarOutlineIcon } from "../../assets/icons/star.svg";
import { ReactComponent as ReorderDotsIcon } from "../../assets/icons/reorder.svg";
import { ReactComponent as RestartArrowIcon } from "../../assets/icons/restart.svg";
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
};

type MenuItem = {
  label: string;
  onClick: (appointment: Appointment) => void;
};

type QueueTableProps = {
  appointments: Appointment[];
  doctorName?: string;
  menuItems?: MenuItem[];
  onStatusChange?: (appointmentId: string, newStatus: string) => void;
};

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

function StatusDropdown({ appointment, currentStatus, onStatusChange }: {
  appointment: Appointment;
  currentStatus: string;
  onStatusChange: (appointmentId: string, newStatus: string) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [timerStarted, setTimerStarted] = useState(() =>
    appointment.patientId ? loadStartedSet().has(appointment.patientId) : false
  );
  const ref = useRef<HTMLDivElement>(null);
  const isLocked = currentStatus === "COMPLETED" || timerStarted;

  useEffect(() => {
    if (!appointment.patientId) return;
    const pid = appointment.patientId;
    const interval = setInterval(() => {
      setTimerStarted(loadStartedSet().has(pid));
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
        patientId={appointment.patientId}
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
  if (type === "New") {
    return (
      <span style={styles.typeBadge}>
        <StarOutlineIcon className="type-badge-icon" width={18} height={18} style={{ flexShrink: 0 }} />
        New
      </span>
    );
  }
  return (
    <span style={styles.typeBadge}>
      <RestartArrowIcon className="type-badge-icon" width={18} height={18} style={{ flexShrink: 0 }} />
      Review
    </span>
  );
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
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLElement).style.backgroundColor = colors.neutral150;
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLElement).style.backgroundColor = "transparent";
        }}
      >
        <ReorderDotsIcon width={24} height={24} />
      </button>
      {isOpen && (
        <div
          style={{
            ...styles.actionMenu,
            ...(openUpward ? { top: "auto", bottom: "100%" } : {}),
          }}
        >
          {menuItems.map((item, i) => (
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
          <col style={{ width: "48px" }} />   {/* # (T-number e.g. T001) */}
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
            <th style={{ ...styles.th, textAlign: "left", paddingLeft: 0, paddingRight: 0 }}>#</th>
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
                    <td style={styles.serialCell}>
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

                    {/* Time */}
                    <td style={{ ...styles.td, textAlign: "center", padding: "10px 4px" }}>
                      <span style={styles.time}>{apt.scheduledTime}</span>
                      {apt.isWalkin && (
                        <span style={styles.walkinBadge}>Walk-in</span>
                      )}
                    </td>

                    <td style={spacerTd} aria-hidden />

                    {/* Status badge */}
                    <td style={{ ...styles.td, textAlign: "center", padding: "10px 4px" }}>
                      {onStatusChange ? (
                        <StatusDropdown
                          appointment={apt}
                          currentStatus={apt.status}
                          onStatusChange={onStatusChange}
                        />
                      ) : (
                        <StatusBadge status={apt.status} patientId={apt.patientId} />
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
