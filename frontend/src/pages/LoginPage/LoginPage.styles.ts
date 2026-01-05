import { CSSProperties } from "react";
import { colors } from "../../styles/theme";

export const styles: Record<string, CSSProperties> = {
  page: {
    minHeight: "100vh",
    minWidth: "100vw",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    background: colors.secondary600,
    boxSizing: "border-box",
  },
};
