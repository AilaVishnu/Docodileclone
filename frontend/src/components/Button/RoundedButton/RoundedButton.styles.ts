import { CSSProperties } from "react";

export const roundedButtonStyles: Record<string, CSSProperties> = {
  button: {
    borderRadius: 9999,
    backgroundColor: "#142726",
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: 500,
    border: "none",
    cursor: "pointer",
    transition: "background-color 0.2s ease, opacity 0.2s ease",
  },
  disabled: {
    opacity: 0.6,
    cursor: "not-allowed",
  },
};
