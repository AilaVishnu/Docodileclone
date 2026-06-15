import React from "react";
import { Modal } from "../Modal";
import { IconButton } from "../IconButton";
import { colors, fonts, radii, shadows, spacing } from "../../styles/theme";

// ─────────────────────────────────────────────────────────────────────────────
// BillLayout — the shared frame for the clinic's bill/invoice modals
// (BillModal = services, BillMedicinesModal = pharmacy). Three cards floating on
// a transparent tray: a line-item list on the left, a bill summary + total band
// top-right, and a payment card bottom-right.
//
// Callers supply ONLY the content that differs — their line-item list, summary
// rows, payment controls and action buttons. Everything visual (the 3-card
// frame, gaps, shadows, the "Bill"/"Payment" headers, the total band) lives
// here so the two modals share one source of truth and can't drift apart.
// ─────────────────────────────────────────────────────────────────────────────
type BillLayoutProps = {
  isOpen: boolean;
  onClose: () => void;
  /** Modal content width. Default 1040. */
  width?: number;
  /** Full-width header block (e.g. the patient identity). When provided, the
      close button (and any `headerActions`) live here instead of the Bill card. */
  header?: React.ReactNode;
  /** Extra icons shown at the right of the header, before the × close
      (e.g. print / share). Only rendered when `header` is present. */
  headerActions?: React.ReactNode;
  /** Left card — the line-item list and its header. */
  left: React.ReactNode;
  /** Summary card title. Default "Bill". */
  billTitle?: React.ReactNode;
  /** Rows shown in the summary card, above the total band. */
  summary: React.ReactNode;
  /** Total band label. Default "Total". */
  totalLabel?: React.ReactNode;
  /** Total band value (already formatted). */
  total: React.ReactNode;
  /** Payment card title. Default "Payment". */
  paymentTitle?: React.ReactNode;
  /** Payment controls (split-payment rows, radios, …). */
  payment: React.ReactNode;
  /** Action row pinned to the bottom of the payment card. */
  action: React.ReactNode;
};

export function BillLayout({
  isOpen,
  onClose,
  width = 1040,
  header,
  headerActions,
  left,
  billTitle = "Bill",
  summary,
  totalLabel = "Total",
  total,
  paymentTitle = "Payment",
  payment,
  action,
}: BillLayoutProps) {
  const hasHeader = Boolean(header || headerActions);
  return (
    <Modal isOpen={isOpen} onClose={onClose} surface="transparent" shadow="none" width={width} padding={0} radius={16}>
      {/* Independent cards floating on a transparent tray, 6px gaps; each carries
          its own shadow — no enclosing frame around the group. Optional full-width
          header bar on top, then the line-item list + bill/payment column. */}
      <div style={styles.root}>
        {hasHeader && (
          <div style={styles.headerCard}>
            <div style={styles.headerLeft}>{header}</div>
            <div style={styles.headerRight}>
              {headerActions}
              <IconButton ariaLabel="Close" onClick={onClose} />
            </div>
          </div>
        )}

        <div style={styles.body}>
          {/* Left — line items */}
          <div style={styles.leftCard}>{left}</div>

          {/* Right — bill summary + payment, stacked */}
          <div style={styles.rightCol}>
            <div style={styles.billCard}>
              <div style={styles.cardHeader}>
                <h3 style={styles.title}>{billTitle}</h3>
                {!hasHeader && <div style={styles.cardHeaderClose}><IconButton ariaLabel="Close" onClick={onClose} /></div>}
              </div>
              {summary}
              <div style={styles.totalRow}>
                <span style={styles.totalLabel}>{totalLabel}</span>
                <span style={styles.totalValue}>{total}</span>
              </div>
            </div>

            <div style={styles.payCard}>
              <div style={styles.payHeader}>
                <h3 style={styles.title}>{paymentTitle}</h3>
              </div>
              {payment}
              <div style={styles.actionRow}>{action}</div>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
}

const styles: Record<string, React.CSSProperties> = {
  root: {
    display: "flex",
    flexDirection: "column",
    gap: 6,
    fontFamily: fonts.family.primary,
  },
  headerCard: {
    backgroundColor: colors.neutral100,
    borderRadius: radii.m,
    boxShadow: shadows.modal,
    padding: `${spacing.m} ${spacing.xl}`,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.m,
    flexShrink: 0,
  },
  headerLeft: {
    minWidth: 0,
    display: "flex",
    alignItems: "center",
    gap: spacing.s,
  },
  headerRight: {
    display: "flex",
    alignItems: "center",
    gap: spacing.xs,
    flexShrink: 0,
  },
  body: {
    display: "flex",
    gap: 6,
    minHeight: 460,
    maxHeight: "calc(100vh - 64px)",
  },
  leftCard: {
    flex: "2.1 1 0",
    minWidth: 0,
    backgroundColor: colors.neutral100,
    borderRadius: radii.m,
    boxShadow: shadows.modal,
    padding: spacing.xl,
    display: "flex",
    flexDirection: "column",
    gap: spacing.m,
    overflowY: "auto",
  },
  rightCol: {
    flex: "1 1 0",
    minWidth: 0,
    display: "flex",
    flexDirection: "column",
    gap: 6,
  },
  billCard: {
    backgroundColor: colors.neutral100,
    borderRadius: radii.m,
    boxShadow: shadows.modal,
    padding: spacing.xl,
    display: "flex",
    flexDirection: "column",
    gap: 14,
  },
  payCard: {
    backgroundColor: colors.neutral100,
    borderRadius: radii.m,
    boxShadow: shadows.modal,
    padding: spacing.xl,
    flex: 1,
    display: "flex",
    flexDirection: "column",
    gap: 14,
  },
  cardHeader: {
    position: "relative",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  cardHeaderClose: {
    position: "absolute",
    right: 0,
  },
  payHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    margin: 0,
    fontFamily: fonts.family.secondary,
    fontSize: fonts.size.h5,
    fontWeight: fonts.weight.regular,
    color: colors.neutral900,
    lineHeight: fonts.lineHeight.h5,
    textAlign: "center",
  },
  totalRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "8px 12px",
    backgroundColor: colors.neutral150,
    borderRadius: radii.m,
  },
  totalLabel: {
    fontSize: fonts.size.m,
    fontWeight: 600,
    color: colors.neutral900,
    lineHeight: 1,
  },
  totalValue: {
    fontSize: fonts.size.h4,
    fontWeight: fonts.weight.regular,
    fontFamily: fonts.family.secondary,
    color: colors.neutral900,
    lineHeight: 1,
  },
  actionRow: {
    marginTop: "auto",
    display: "flex",
    gap: spacing.s,
    alignItems: "center",
  },
};
