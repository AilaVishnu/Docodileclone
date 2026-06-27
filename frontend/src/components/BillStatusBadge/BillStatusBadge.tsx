import React from "react";
import { Icon } from "../Icon";
import { colors } from "../../styles/theme";
import { styles } from "./BillStatusBadge.styles";

export type BillStatus = "paid" | "due" | "refunded" | "waived";

/** Derive a bill's status from its amounts + flags. Partial + unpaid both → "due". */
export function billStatusOf(b: { payStatus?: string | null; refund?: number; due?: number; paid?: number }): BillStatus {
  if (b.payStatus === "WAIVED") return "waived";
  if ((b.refund ?? 0) > 0) return "refunded";
  if ((b.due ?? 0) > 0) return "due";
  return "paid";
}

const GLYPH = 19;

// Paid/Due reuse the appointment-queue line glyphs; Refunded/Waived use bespoke
// filled-circle glyphs (exact SVGs, colours tokenised).
const CONFIG: Record<BillStatus, { tint: string; icon: string; iconColor: string; label: string }> = {
  paid: { tint: colors.greenAlpha20, icon: "check-circle", iconColor: colors.green200, label: "Paid" },
  due: { tint: colors.yellowAlpha20, icon: "danger-triangle", iconColor: colors.yellow200, label: "Due" },
  refunded: { tint: colors.maroonAlpha20, icon: "", iconColor: "", label: "Refunded" },
  waived: { tint: colors.blueAlpha20, icon: "", iconColor: "", label: "Waived" },
};

// Refunded — maroon circle with a cream back-arrow.
const RefundGlyph = () => (
  <svg width={GLYPH} height={GLYPH} viewBox="0 0 20 20" fill="none" style={{ flexShrink: 0 }} aria-hidden="true">
    <circle cx="9.99935" cy="10.0001" r="8.33333" fill={colors.maroon200} stroke={colors.maroon200} />
    <path d="M6.51667 10.0001L13.4832 10M9.25888 12.3461L6.51667 10.0001L9.25888 7.43275" stroke={colors.primary100} strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
// Waived — soft-blue circle with a cream dash.
const WaivedGlyph = () => (
  <svg width={GLYPH} height={GLYPH} viewBox="0 0 20 20" fill="none" style={{ flexShrink: 0 }} aria-hidden="true">
    <circle cx="9.99935" cy="10.0001" r="8.33333" fill={colors.blue100} stroke={colors.blue100} />
    <path d="M6.51758 10L13.4841 10" stroke={colors.primary100} strokeLinecap="round" />
  </svg>
);

export interface BillStatusBadgeProps {
  status: BillStatus;
  /** On a state-tinted surface the alpha pill would vanish — set this to give
      the pill a solid white fill (keeps the colour icon + dark word). */
  onTint?: boolean;
}

/** Status pill for a bill — Paid / Due / Refunded / Waived. */
export function BillStatusBadge({ status, onTint = false }: BillStatusBadgeProps) {
  const c = CONFIG[status];
  return (
    <span style={{ ...styles.pill, backgroundColor: onTint ? colors.neutral100 : c.tint, color: colors.neutral800 }}>
      {status === "waived" ? <WaivedGlyph />
        : status === "refunded" ? <RefundGlyph />
        : <Icon name={c.icon} size={GLYPH} tone="inherit" style={{ color: c.iconColor }} />}
      {c.label}
    </span>
  );
}
