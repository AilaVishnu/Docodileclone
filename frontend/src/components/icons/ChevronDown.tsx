import React from "react";
import { colors } from "../../styles/theme";

type ChevronDownProps = {
  /** px size of the (square) icon. Default 16. */
  size?: number;
  /** When true the chevron points up (rotated 180°) — e.g. an open dropdown. */
  open?: boolean;
  /** Stroke colour. Default neutral600. */
  color?: string;
  strokeWidth?: number;
  style?: React.CSSProperties;
};

/**
 * Shared down-chevron used by every header selector chip (the doctor picker in
 * Book Appointment, and the date pickers in the Appointments / Rx Pad queues),
 * so the affordance is identical everywhere. Polyline form, rotates on open.
 */
export function ChevronDown({
  size = 16,
  open = false,
  color = colors.neutral600,
  strokeWidth = 1.5,
  style,
}: ChevronDownProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{
        transform: open ? "rotate(180deg)" : "rotate(0deg)",
        transition: "transform 160ms",
        flexShrink: 0,
        ...style,
      }}
    >
      <path d="M19 9L12 15L5 9" />
    </svg>
  );
}
