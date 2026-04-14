import React, { useState, useRef, useEffect } from "react";
import { styles } from "./AppointmentQueue.styles";
import { StatusBadge, PayBadge } from "./StatusBadge";
import { ReactComponent as StarOutlineIcon } from "../../assets/icons/star.svg";
import { ReactComponent as ReorderDotsIcon } from "../../assets/icons/reorder.svg";
import { ReactComponent as RestartArrowIcon } from "../../assets/icons/restart.svg";

export type AppointmentStatus =
  | "WAITING"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "NO_SHOW"
  | "CANCELLED";

export type PayStatus = "PAID" | "DUE" | "NO PAY";

export type Appointment = {
  id: string;
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
  { label: "Arrived", value: "ARRIVED" },
  { label: "In Progress", value: "IN_PROGRESS" },
  { label: "Reschedule", value: "WAITING" },
  { label: "Cancel", value: "CANCELLED" },
  { label: "No-Show", value: "NO_SHOW" },
];

function StatusDropdown({ appointment, currentStatus, onStatusChange }: {
  appointment: Appointment;
  currentStatus: string;
  onStatusChange: (appointmentId: string, newStatus: string) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setIsOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={ref} style={{ position: "relative", display: "inline-block" }}>
      <StatusBadge status={currentStatus} onClick={() => setIsOpen(!isOpen)} />
      {isOpen && (
        <div style={{
          position: "absolute",
          top: "calc(100% + 4px)",
          left: "50%",
          transform: "translateX(-50%)",
          backgroundColor: "#fff",
          borderRadius: "12px",
          boxShadow: "0 4px 20px rgba(0,0,0,0.12)",
          zIndex: 100,
          minWidth: "150px",
          padding: "6px",
          border: `1px solid #e5e7eb`,
        }}>
          {STATUS_OPTIONS.map((opt) => (
            <div
              key={opt.value}
              onClick={() => {
                onStatusChange(appointment.id, opt.value);
                setIsOpen(false);
              }}
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "#f5f5f5"; }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "transparent"; }}
              style={{
                padding: "10px 14px",
                cursor: "pointer",
                borderRadius: "8px",
                fontSize: "14px",
                fontWeight: 500,
                color: "#1f2937",
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
        <StarOutlineIcon width={18} height={18} style={{ flexShrink: 0 }} />
        New
      </span>
    );
  }
  return (
    <span style={styles.typeBadge}>
      <RestartArrowIcon width={18} height={18} style={{ flexShrink: 0 }} />
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
          (e.currentTarget as HTMLElement).style.backgroundColor = "#f3f4f6";
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLElement).style.backgroundColor = "transparent";
        }}
      >
        <ReorderDotsIcon width={18} height={18} />
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
                e.currentTarget.style.backgroundColor = "#f5f5f5";
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
  return (
    <div style={styles.tableContainer}>
      <table style={styles.table}>
        <thead>
          <tr>
            <th style={styles.th}>#</th>
            <th style={styles.th}>Name</th>
            <th style={{ ...styles.th, textAlign: "center" }}>Phone</th>
            <th style={{ ...styles.th, textAlign: "center" }}>Service</th>
            <th style={{ ...styles.th, textAlign: "center" }}>Type</th>
            <th style={{ ...styles.th, textAlign: "center" }}>Time</th>
            <th style={{ ...styles.th, textAlign: "center" }}>Status</th>
            <th style={{ ...styles.th, textAlign: "center" }}>Pay</th>
            <th style={{ ...styles.th, width: "40px" }}></th>
          </tr>
        </thead>
        <tbody>
          {appointments.length === 0 ? (
            <tr>
              <td
                colSpan={9}
                style={{
                  ...styles.td,
                  textAlign: "center",
                  padding: "48px",
                  color: "#9CA3AF",
                }}
              >
                No appointments for {doctorName || "this doctor"} today
              </td>
            </tr>
          ) : (
            appointments.map((apt, index) => (
              <tr
                key={apt.id}
                style={styles.tr}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.backgroundColor =
                    "rgba(0,0,0,0.018)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.backgroundColor =
                    "transparent";
                }}
              >
                {/* # */}
                <td style={styles.serialCell}>{String(index + 1).padStart(2, "0")}</td>

                {/* Name + gender/age */}
                <td style={styles.nameCell}>
                  <div style={styles.nameInner}>
                    <span style={styles.namePrimary}>{apt.patientName}</span>
                    {(apt.patientGender || apt.patientAge) && (
                      <span style={styles.nameMeta}>
                        {apt.patientGender && (
                          <span>{apt.patientGender.charAt(0).toUpperCase()}</span>
                        )}
                        {apt.patientGender && apt.patientAge && (
                          <span style={styles.nameMetaDot}>|</span>
                        )}
                        {apt.patientAge && <span>{apt.patientAge}</span>}
                      </span>
                    )}
                  </div>
                </td>

                {/* Phone */}
                <td style={{ ...styles.td, textAlign: "center" }}>{apt.patientPhone}</td>

                {/* Service */}
                <td style={{ ...styles.td, textAlign: "center" }}>
                  {apt.service === "Consultation"
                    ? "C"
                    : apt.service || "—"}
                </td>

                {/* Type */}
                <td style={{ ...styles.td, textAlign: "center" }}>
                  <TypeBadge type={apt.type} />
                </td>

                {/* Time */}
                <td style={{ ...styles.td, textAlign: "center" }}>
                  <span style={styles.time}>{apt.scheduledTime}</span>
                  {apt.isWalkin && (
                    <span style={styles.walkinBadge}>Walk-in</span>
                  )}
                </td>

                {/* Status badge */}
                <td style={{ ...styles.td, textAlign: "center" }}>
                  {onStatusChange ? (
                    <StatusDropdown
                      appointment={apt}
                      currentStatus={apt.status}
                      onStatusChange={onStatusChange}
                    />
                  ) : (
                    <StatusBadge status={apt.status} />
                  )}
                </td>

                {/* Pay status */}
                <td style={{ ...styles.payCell, textAlign: "center" }}>
                  <PayBadge status={apt.payStatus} />
                </td>

                {/* Action menu */}
                <td style={{ ...styles.td, padding: "14px 8px" }}>
                  {menuItems && menuItems.length > 0 ? (
                    <ActionMenu
                      appointment={apt}
                      menuItems={menuItems}
                      openUpward={index >= appointments.length - 2}
                    />
                  ) : (
                    <button style={styles.actionButton}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <circle cx="12" cy="5"  r="1.5" fill="#8F8F8F" />
                        <circle cx="12" cy="12" r="1.5" fill="#8F8F8F" />
                        <circle cx="12" cy="19" r="1.5" fill="#8F8F8F" />
                      </svg>
                    </button>
                  )}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
