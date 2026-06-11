import React, { useState, useEffect } from "react";
import { fonts, colors } from "../../styles/theme";
import { ReactComponent as DangerTriangleIcon } from "../../assets/icons/danger-triangle.svg";
import { ReactComponent as CheckCircleIcon } from "../../assets/icons/check-circle.svg";

// H:MM:SS once past an hour, MM:SS below.
const formatTimer = (s: number) => {
  const h = Math.floor(s / 3600);
  const mm = String(Math.floor((s % 3600) / 60)).padStart(2, "0");
  const ss = String(s % 60).padStart(2, "0");
  return h > 0 ? `${h}:${mm}:${ss}` : `${mm}:${ss}`;
};

// A consultation counts live for this long; past it we stop ticking and show
// a static "Since <start time>" instead — so a visit left open for hours
// doesn't run a forever-counter, but is still clearly visible as in-progress.
const SESSION_LIVE_SEC = 6 * 60 * 60;
const formatSince = (iso: string) =>
  `Since ${new Date(iso).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}`;

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
  BOOKED: { bg: colors.primary200, color: colors.neutral900, label: "Booked" },
  WAITING: { bg: colors.yellow100, color: colors.neutral900, label: "Waiting" },
  SCHEDULED: { bg: colors.primary200, color: colors.neutral900, label: "Booked" },
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
  /**
   * Prescription-queue use: when true and status is IN_PROGRESS, the badge
   * reads "Ongoing" on sage (no live timer). The appointment queue instead
   * passes `sessionStartedAt` to get the running live timer. One badge, both.
   */
  started?: boolean;
  /**
   * Backend session start (ISO). When set and status is IN_PROGRESS, the badge
   * shows a live timer counting up from this instant — server-owned, so it's
   * the real elapsed consultation time and stays correct across devices/reloads.
   */
  sessionStartedAt?: string;
};

export function StatusBadge({ status, started, sessionStartedAt, onClick }: StatusBadgeProps) {
  const key = status?.toUpperCase();
  const baseCfg = STATUS_CONFIG[key] ?? { bg: colors.neutral200, color: colors.neutral700, label: status };

  const [liveSeconds, setLiveSeconds] = useState<number | null>(null);

  useEffect(() => {
    if (key !== "IN_PROGRESS" || !sessionStartedAt) { setLiveSeconds(null); return; }
    const startMs = new Date(sessionStartedAt).getTime();
    if (Number.isNaN(startMs)) { setLiveSeconds(null); return; }
    const compute = () => Math.max(0, Math.floor((Date.now() - startMs) / 1000));
    setLiveSeconds(compute());
    // Already past the live window → static "Since …", never start an interval.
    if (compute() >= SESSION_LIVE_SEC) return;
    const id = window.setInterval(() => {
      const e = compute();
      setLiveSeconds(e);
      // Crossed the 6h mark while watching → stop ticking, switch to static.
      if (e >= SESSION_LIVE_SEC) window.clearInterval(id);
    }, 1000);
    return () => window.clearInterval(id);
  }, [key, sessionStartedAt]);

  const cfg = key === "IN_PROGRESS" && liveSeconds != null
    ? {
        ...baseCfg,
        // Live elapsed for the first 6h, then the static start time.
        label: liveSeconds >= SESSION_LIVE_SEC && sessionStartedAt
          ? formatSince(sessionStartedAt)
          : formatTimer(liveSeconds),
      }
    : baseCfg;

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
        fontSize: fonts.size.xs,
        fontFamily: fonts.family.primary,
        fontWeight: fonts.weight.regular,
        lineHeight: "16px",
        letterSpacing: 0,
        cursor: onClick ? "pointer" : "default",
        userSelect: "none",
        whiteSpace: "nowrap",
        minWidth: key === "IN_PROGRESS" && liveSeconds != null ? "auto" : "90px",
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
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "4px",
        width: "80px",
        fontSize: fonts.size.s,
        fontFamily: fonts.family.primary,
        fontWeight: 400,
        lineHeight: "16px",
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
      {cfg.label}
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
