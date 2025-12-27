import { CSSProperties } from "react";
import { colors, radii } from "../../styles/theme";

export const styles: Record<string, CSSProperties> = {
  card: {
    backgroundColor: colors.yellowTeeth,
    borderRadius: radii.primary,
    padding: 48,
    width: "100%",
    maxWidth: 720,
    display: "flex",
    flexDirection: "column",
    gap: 32,
  },
};
