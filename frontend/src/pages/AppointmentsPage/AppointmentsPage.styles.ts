import { CSSProperties } from "react";
import { colors, fonts, spacing, radii } from "../../styles/theme";

export const styles: Record<string, CSSProperties> = {
  page: {
    minHeight: "100vh",
    backgroundColor: colors.primary100,
    padding: spacing.xl,
    fontFamily: fonts.family.primary,
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.xl,
  },
  title: {
    fontSize: fonts.size.h4,
    fontWeight: fonts.weight.semibold,
    color: colors.blindBlack,
    margin: 0,
  },
  dateNav: {
    display: "flex",
    alignItems: "center",
    gap: spacing.s,
  },
  dateText: {
    fontSize: fonts.size.m,
    fontWeight: fonts.weight.medium,
    color: colors.neutral700,
  },
  summaryRow: {
    display: "flex",
    gap: spacing.m,
    marginBottom: spacing.xl,
  },
  summaryCard: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    padding: spacing.m,
    borderRadius: radii.primary,
    backgroundColor: colors.neutral100,
    minWidth: 100,
  },
  summaryCount: {
    fontSize: fonts.size.h4,
    fontWeight: fonts.weight.semibold,
    margin: 0,
  },
  summaryLabel: {
    fontSize: fonts.size.xs,
    color: colors.neutral600,
    margin: 0,
  },
  queueContainer: {
    display: "flex",
    flexDirection: "column",
    gap: spacing.s,
  },
  queueRow: {
    display: "flex",
    alignItems: "center",
    padding: spacing.m,
    backgroundColor: colors.neutral100,
    borderRadius: radii.primary,
    gap: spacing.m,
  },
  tokenNumber: {
    width: 40,
    height: 40,
    borderRadius: "50%",
    backgroundColor: colors.secondary100,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: fonts.weight.semibold,
    fontSize: fonts.size.m,
    color: colors.secondary700,
  },
  patientInfo: {
    flex: 1,
  },
  patientName: {
    fontSize: fonts.size.m,
    fontWeight: fonts.weight.medium,
    color: colors.blindBlack,
    margin: 0,
  },
  patientMeta: {
    fontSize: fonts.size.s,
    color: colors.neutral600,
    margin: 0,
  },
  statusBadge: {
    padding: `${spacing.xs} ${spacing.s}`,
    borderRadius: radii.pill,
    fontSize: fonts.size.xs,
    fontWeight: fonts.weight.medium,
  },
  statusWaiting: {
    backgroundColor: colors.yellowAlpha10,
    color: colors.yellow200,
  },
  statusInConsultation: {
    backgroundColor: colors.greenAlpha10,
    color: colors.green200,
  },
  statusDone: {
    backgroundColor: colors.neutral200,
    color: colors.neutral700,
  },
  typeBadge: {
    padding: `${spacing.xs} ${spacing.s}`,
    borderRadius: radii.pill,
    fontSize: fonts.size.xs,
    backgroundColor: colors.primary200,
    color: colors.primary700,
  },
  fee: {
    fontSize: fonts.size.m,
    fontWeight: fonts.weight.medium,
    color: colors.blindBlack,
    minWidth: 80,
    textAlign: "right",
  },
  emptyState: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.xxl,
    color: colors.neutral600,
  },
  emptyIcon: {
    fontSize: "64px",
    marginBottom: spacing.m,
  },
  emptyText: {
    fontSize: fonts.size.m,
    margin: 0,
    textAlign: "center",
  },
  walkInButton: {
    position: "fixed",
    bottom: spacing.xl,
    right: spacing.xl,
  },
};
