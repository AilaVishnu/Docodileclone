import { CSSProperties } from "react";
import { spacing } from "../../styles/theme";

export const styles: Record<string, CSSProperties> = {
  outerCard: {
    display: "flex",
    flexDirection: "column",
    gap: spacing.xl,
    marginTop: spacing.xl,
  },

  innerCard: {
    display: "flex",
    flexDirection: "column",
    gap: spacing.s,
  },

  rowWithAction: {
    display: "flex",
    alignItems: "center",
    gap: spacing.xs,
  },
};
