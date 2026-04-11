import React from "react";
import { fonts } from "../../styles/theme";

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
  ARRIVED: { bg: "#f3f3dcff", color: "#1349A0", label: "Arrived" },
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
    color: "#122525",
    label: "Due",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <path
          d="M12 3L2 21h20L12 3Z"
          fill="#DFB400"
          strokeLinejoin="round"
        />
        <line x1="12" y1="10" x2="12" y2="15" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
        <circle cx="12" cy="17.5" r="1" fill="#fff" />
      </svg>
    ),
  },
  UNPAID: {
    color: "#122525",
    label: "Unpaid",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <path
          d="M12 3L2 21h20L12 3Z"
          fill="#DFB400"
          strokeLinejoin="round"
        />
        <line x1="12" y1="10" x2="12" y2="15" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
        <circle cx="12" cy="17.5" r="1" fill="#fff" />
      </svg>
    ),
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
        gap: "5px",
        fontSize: "14px",
        fontFamily: fonts.family.primary,
        fontWeight: 500,
        lineHeight: "20px",
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
