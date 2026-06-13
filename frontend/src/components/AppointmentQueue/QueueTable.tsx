import React, { useState, useRef, useEffect, useMemo } from "react";
import { styles } from "./AppointmentQueue.styles";
import { fonts, colors, radii } from "../../styles/theme";
import { StatusBadge, PayBadge } from "./StatusBadge";
import { ZeroQueue } from "./ZeroQueue";
import { loadStartedSet } from "../../utils/sessionStarted";
import { QueueTable as SharedQueueTable, type QueueColumn } from "../QueueTable/QueueTable";
import { PopoverMenu } from "../PopoverMenu/PopoverMenu";

export type AppointmentStatus =
  | "WAITING"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "NO_SHOW"
  | "CANCELLED";

export type PayStatus = "PAID" | "DUE" | "NO PAY";

export type Appointment = {
  id: string;
  patientId?: string;
  patientName: string;
  patientPhone: string;
  patientEmail?: string;
  patientGender?: string;
  patientDob?: string;
  patientAge?: number;
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
  pharmacyAmount?: number;
  patientArchived?: boolean;
  createdAt?: string;
};

type MenuItem = {
  label: string;
  onClick: (appointment: Appointment) => void;
  visible?: (appointment: Appointment) => boolean;
};

type QueueTableProps = {
  appointments: Appointment[];
  doctorName?: string;
  menuItems?: MenuItem[];
  onStatusChange?: (appointmentId: string, newStatus: string) => void;
  sessionStarts?: Record<string, string>;
  /** Maps a service name → its catalog short form (e.g. "Consultation" → "GC"). */
  serviceCode?: (serviceName: string) => string | undefined;
};

// Front-desk status actions. Completion is intentionally NOT here — only the
// doctor marks a visit complete (via "Complete visit" on the prescription pad).
const STATUS_OPTIONS = [
  { label: "No-Show", value: "NO_SHOW" },
  { label: "Arrived", value: "WAITING" },
  { label: "Send to Doc", value: "IN_PROGRESS" },
  { label: "Cancel", value: "CANCELLED" },
];

// Bare local digits: drop a leading 91 country code + spaces/symbols.
function formatPhone(raw: string): string {
  if (!raw) return raw;
  const digits = raw.replace(/\D/g, "");
  return digits.length > 10 && digits.startsWith("91") ? digits.slice(2) : digits;
}

// Fallback abbreviation when no catalog code is available.
function abbreviate(service?: string): string {
  if (!service) return "";
  return service
    .replace(/Consultation/gi, "C")
    .replace(/Hydrafacial/gi, "HF")
    .replace(/Laser Hair Removal/gi, "LHR")
    .replace(/Skin Tag Removal/gi, "SKR")
    .replace(/Acne Scar Treatment/gi, "AST");
}

const serviceBadge: React.CSSProperties = {
  display: "inline-block",
  fontSize: fonts.control.xs,
  fontWeight: fonts.weight.semibold,
  color: colors.neutral700,
  backgroundColor: colors.neutral100,
  border: `1px solid ${colors.primary300}`,
  borderRadius: radii.s,
  padding: `2px ${6}px`,
  letterSpacing: "0.04em",
};

function StatusDropdown({ appointment, currentStatus, onStatusChange, sessionStartedAt }: {
  appointment: Appointment;
  currentStatus: string;
  onStatusChange: (appointmentId: string, newStatus: string) => void;
  sessionStartedAt?: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [timerStarted, setTimerStarted] = useState(() =>
    appointment.patientId ? loadStartedSet().has(appointment.patientId) : false
  );
  const ref = useRef<HTMLDivElement>(null);
  const isLocked = currentStatus === "COMPLETED"
    || (timerStarted && (currentStatus === "IN_PROGRESS" || currentStatus === "AT_DOC"));

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
        sessionStartedAt={sessionStartedAt}
        onClick={isLocked ? undefined : () => setIsOpen(!isOpen)}
      />
      {isOpen && (
        <div style={{
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

// ── Type badge (New / Review) ─────────────────────────────────────────────
function TypeBadge({ type }: { type: "New" | "Review" }) {
  return <span style={styles.typeBadge}>{type === "New" ? "New" : "Review"}</span>;
}

// ── Vertical 3-dot (kebab) trigger icon ───────────────────────────────────
function KebabIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="5" r="1.5" fill="currentColor" />
      <circle cx="12" cy="12" r="1.5" fill="currentColor" />
      <circle cx="12" cy="19" r="1.5" fill="currentColor" />
    </svg>
  );
}

// ── Main table ────────────────────────────────────────────────────────────
export function QueueTable({
  appointments,
  doctorName,
  menuItems,
  onStatusChange,
  sessionStarts,
  serviceCode,
}: QueueTableProps) {
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

  // Status → row tint. Cancelled / no-show share the muted "inactive" tone.
  const rowTone = (apt: Appointment): string | undefined => {
    switch (apt.status) {
      case "IN_PROGRESS": return colors.primary200;
      case "COMPLETED": return colors.secondary50;
      case "NO_SHOW":
      case "CANCELLED": return colors.neutralAlphaBlack;
      default: return undefined;
    }
  };
  // Cancelled + no-show collapse into one "INACTIVE" group for the separator.
  const groupKey = (s: string) => (s === "CANCELLED" || s === "NO_SHOW") ? "INACTIVE" : s;

  const columns: QueueColumn<Appointment>[] = [
    { key: "id", header: "#", width: 56, align: "left", render: (apt) => <span style={styles.serialCell}>{tIdFor(apt.id)}</span> },
    {
      key: "name", header: "Name", grow: 1, align: "left",
      render: (apt) => {
        const g = apt.patientGender ? apt.patientGender.charAt(0).toUpperCase() : "";
        const years = apt.patientAge != null && apt.patientAge > 0 ? Math.floor(apt.patientAge / 12) : null;
        const meta = [g, years != null ? String(years) : ""].filter(Boolean).join(" ");
        return <span style={styles.namePrimary}>{apt.patientName}{meta ? ` - ${meta}` : ""}</span>;
      },
    },
    { key: "phone", header: "Phone", width: 108, render: (apt) => formatPhone(apt.patientPhone) },
    {
      key: "service", header: "Service", width: 72,
      render: (apt) => {
        const code = (serviceCode ? serviceCode(apt.service ?? "") : abbreviate(apt.service)) || "";
        return code ? <span style={serviceBadge}>{code}</span> : "—";
      },
    },
    { key: "type", header: "Type", width: 84, render: (apt) => <TypeBadge type={apt.type} /> },
    {
      key: "time", header: "Time", width: 84,
      render: (apt) => (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
          <span style={styles.time}>{apt.scheduledTime}</span>
          {apt.isWalkin && <span style={styles.walkinBadge}>Walk-in</span>}
        </div>
      ),
    },
    {
      key: "status", header: "Status", width: 100, clip: false,
      render: (apt) => onStatusChange
        ? <StatusDropdown appointment={apt} currentStatus={apt.status} onStatusChange={onStatusChange} sessionStartedAt={sessionStarts?.[apt.id]} />
        : <StatusBadge status={apt.status} sessionStartedAt={sessionStarts?.[apt.id]} />,
    },
    { key: "pay", header: "Pay", width: 48, render: (apt) => <PayBadge status={apt.payStatus} /> },
    {
      key: "actions", header: "", width: 44, align: "center", clip: false,
      render: (apt, index) => {
        if (!menuItems || menuItems.length === 0) return null;
        const items = menuItems
          .filter((item) => item.visible?.(apt) !== false)
          .map((item) => ({ label: item.label, onClick: () => item.onClick(apt) }));
        return (
          <PopoverMenu
            ariaLabel="Row actions"
            align="right"
            openUpward={index >= appointments.length - 2}
            trigger={<KebabIcon />}
            items={items}
          />
        );
      },
    },
  ];

  return (
    <div style={styles.tableContainer}>
      <SharedQueueTable
        columns={columns}
        rows={appointments}
        rowKey={(apt) => apt.id}
        rowTone={rowTone}
        groupBy={(apt) => groupKey(apt.status)}
        hover
      />
    </div>
  );
}
