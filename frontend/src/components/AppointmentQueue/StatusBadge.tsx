import React, { useState, useEffect } from "react";
import { fonts, colors } from "../../styles/theme";
import { ReactComponent as DangerTriangleIcon } from "../../assets/icons/danger-triangle.svg";
import { ReactComponent as CheckCircleIcon } from "../../assets/icons/check-circle.svg";
import { loadStartedSet, getSessionSecondsForPatient } from "../../utils/sessionStarted";

const formatTimer = (s: number) =>
  `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────
export type AppointmentStatusValue =
  | "WAITING"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "NO_SHOW"
  | "CANCELLED";

export type PayStatusValue = "PAID" | "DUE" | "NO PAY";

// ─────────────────────────────────────────────────────────────────────────────
// Token maps — directly from Figma variable defs
// Colors/Green/100  = #84EBB4  (Completed bg)
// Colors/Yellow/200 = #DFB400  (Waiting text)
// ─────────────────────────────────────────────────────────────────────────────
const STATUS_CONFIG: Record<
  string,
  { bg: string; color: string; label: string }
> = {
  BOOKED: { bg: colors.active.shade300, color: colors.neutral900, label: "Booked" },
  WAITING: { bg: colors.yellow100, color: colors.neutral900, label: "Waiting" },
  SCHEDULED: { bg: colors.active.shade300, color: colors.neutral900, label: "Booked" },
  ARRIVED: { bg: colors.primary200, color: colors.neutral900, label: "Arrived" },
  IN_PROGRESS: { bg: colors.neutral100, color: colors.neutral900, label: "At Doc" },
  COMPLETED: { bg: colors.green100, color: colors.secondary800, label: "Completed" },
  NO_SHOW: { bg: colors.neutral400, color: colors.neutral100, label: "No Show" },
  CANCELLED: { bg: colors.red100, color: colors.neutral100, label: "Cancelled" },
};

const PAY_CONFIG: Record<
  string,
  { color: string; label: string; icon: React.ReactNode }
> = {
  PAID: {
    color: colors.neutral900,
    label: "Paid",
    icon: <CheckCircleIcon width={20} height={20} />,
  },
  DUE: {
    color: colors.neutral900,
    label: "Due",
    icon: <DangerTriangleIcon width={20} height={20} />,
  },
  UNPAID: {
    color: colors.neutral900,
    label: "Due",
    icon: <DangerTriangleIcon width={20} height={20} />,
  },
  "NO PAY": {
    color: colors.neutral900,
    label: "Due",
    icon: <DangerTriangleIcon width={20} height={20} />,
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// StatusBadge — appointment status pill
// Figma specs: Radius/xs=4px, Spacing/xs=8px H, Spacing/2xs=4px V,
//              Inter paragraph-s 14px Regular, Colors/Green/100=#84EBB4 bg
// ─────────────────────────────────────────────────────────────────────────────
type StatusBadgeProps = {
  status: string;
  /**
   * Optional patient id — when supplied, the IN_PROGRESS pill flips
   * from "At Doc" → "In Progress" once the doctor has clicked Start
   * Session for that patient (tracked per-device via localStorage).
   */
  patientId?: string;
  /** If true, badge is clickable and calls onClick */
  onClick?: () => void;
};

export function StatusBadge({ status, patientId, onClick }: StatusBadgeProps) {
  const key = status?.toUpperCase();
  const baseCfg = STATUS_CONFIG[key] ?? { bg: colors.neutral200, color: colors.neutral700, label: status };

  const [liveStarted, setLiveStarted] = useState(false);
  const [liveSeconds, setLiveSeconds] = useState<number | null>(null);

  useEffect(() => {
    if (key !== "IN_PROGRESS" || !patientId) return;
    const tick = () => {
      const started = loadStartedSet().has(patientId);
      setLiveStarted(started);
      setLiveSeconds(started ? getSessionSecondsForPatient(patientId) : null);
    };
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, [key, patientId]);

  const cfg = liveStarted
    ? {
        ...baseCfg,
        label: `In Progress${liveSeconds != null ? ` (${formatTimer(liveSeconds)})` : ""}`,
      }
    : baseCfg;

  // Emphasize the "active" states (Waiting, At Doc / In Progress) at m (16);
  // the other states (Booked, No Show, Completed, …) sit at s (14).
  const badgeFontSize =
    key === "WAITING" || key === "IN_PROGRESS" ? fonts.size.m : fonts.size.s;

  return (
    <span
      onClick={onClick}
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: cfg.bg,
        color: cfg.color,
        borderRadius: "4px",
        padding: "4px 8px",
        fontSize: badgeFontSize,
        fontFamily: fonts.family.primary,
        fontWeight: fonts.weight.regular,
        lineHeight: "16px",
        letterSpacing: 0,
        cursor: onClick ? "pointer" : "default",
        userSelect: "none",
        whiteSpace: "nowrap",
        minWidth: liveStarted ? "auto" : "90px",
        textAlign: "center" as const,
      }}
    >
      {cfg.label}
    </span>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// PayBadge — pay status with icon
// ─────────────────────────────────────────────────────────────────────────────
type PayBadgeProps = {
  status: string;
};

export function PayBadge({ status }: PayBadgeProps) {
  const key = status?.toUpperCase();
  const cfg = PAY_CONFIG[key] ?? PAY_CONFIG["NO PAY"];

  return (
    <span
      // `title` is the native hover tooltip — shows "Paid" / "Due" / "No Pay"
      // when the label text is hidden at 1024 (see globals.css).
      title={cfg.label}
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        // Icon only — the Paid/Due word is dropped at all sizes; the native
        // `title` (above) provides the label on hover.
        width: "auto",
        color: cfg.color,
      }}
    >
      <span
        style={{
          width: 20,
          height: 20,
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        {cfg.icon}
      </span>
    </span>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Helper functions (backwards-compat exports used by other components)
// ─────────────────────────────────────────────────────────────────────────────
export const getStatusLabel = (status: string): string =>
  STATUS_CONFIG[status?.toUpperCase()]?.label ?? status;

export const getStatusBg = (status: string): string =>
  STATUS_CONFIG[status?.toUpperCase()]?.bg ?? colors.neutral200;

export const getStatusColor = (status: string): string =>
  STATUS_CONFIG[status?.toUpperCase()]?.color ?? colors.neutral700;
