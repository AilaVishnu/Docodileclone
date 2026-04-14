import React from "react";
import { fonts } from "../../styles/theme";
import { ReactComponent as DangerTriangleIcon } from "../../assets/icons/danger-triangle.svg";

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
  WAITING: { bg: "#FFDB43", color: "#122525", label: "Waiting" },
  SCHEDULED: { bg: "#F3F4F6", color: "#4B4B4B", label: "Scheduled" },
  ARRIVED: { bg: "#f3f3dcff", color: "#122525", label: "Arrived" },
  IN_PROGRESS: { bg: "#ffffffff", color: "#122525", label: "In Progress" },
  COMPLETED: { bg: "#84EBB4", color: "#0D5C30", label: "Completed" },
  NO_SHOW: { bg: "#B0B0B0", color: "#FFFFFF", label: "No Show" },
  CANCELLED: { bg: "#FB3748", color: "#FFFFFF", label: "Cancelled" },
};

const PAY_CONFIG: Record<
  string,
  { color: string; label: string; icon: React.ReactNode }
> = {
  PAID: {
    color: "#122525",
    label: "Paid",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="10" fill="#6B8E23" />
        <path
          d="M7.5 12.5L10.5 15.5L16.5 9.5"
          stroke="#fff"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  DUE: {
    color: "#202020",
    label: "Due",
    icon: <DangerTriangleIcon width={20} height={20} />,
  },
  UNPAID: {
    color: "#202020",
    label: "Unpaid",
    icon: <DangerTriangleIcon width={20} height={20} />,
  },
  "NO PAY": {
    color: "#6B7280",
    label: "No Pay",
    icon: null,
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// StatusBadge — appointment status pill
// Figma specs: Radius/xs=4px, Spacing/xs=8px H, Spacing/2xs=4px V,
//              Inter paragraph-s 14px Regular, Colors/Green/100=#84EBB4 bg
// ─────────────────────────────────────────────────────────────────────────────
type StatusBadgeProps = {
  status: string;
  /** If true, badge is clickable and calls onClick */
  onClick?: () => void;
};

export function StatusBadge({ status, onClick }: StatusBadgeProps) {
  const key = status?.toUpperCase();
  const cfg = STATUS_CONFIG[key] ?? { bg: "#E9E9E9", color: "#4B4B4B", label: status };

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
        fontSize: "13px",
        fontFamily: fonts.family.primary,
        fontWeight: 500,
        lineHeight: "18px",
        letterSpacing: 0,
        cursor: onClick ? "pointer" : "default",
        userSelect: "none",
        whiteSpace: "nowrap",
        minWidth: "90px",
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
        justifyContent: "flex-start",
        gap: "4px",
        width: "80px",
        fontSize: "12px",
        fontFamily: fonts.family.primary,
        fontWeight: 400,
        lineHeight: "16px",
        color: cfg.color,
      }}
    >
      {cfg.icon}
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
  STATUS_CONFIG[status?.toUpperCase()]?.bg ?? "#E9E9E9";

export const getStatusColor = (status: string): string =>
  STATUS_CONFIG[status?.toUpperCase()]?.color ?? "#4B4B4B";
