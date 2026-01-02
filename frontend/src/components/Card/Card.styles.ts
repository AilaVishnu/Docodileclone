import { CSSProperties } from "react";
import { colors, radii } from "../../styles/theme";

export const styles: Record<string, CSSProperties> = {
  card: {
    backgroundColor: colors.yellowTeeth,
    borderRadius: radii.primary,
    width: "100%",
    display: "flex",
    flexDirection: "column",
    gap: 18,
    marginTop: -1
  },
};
