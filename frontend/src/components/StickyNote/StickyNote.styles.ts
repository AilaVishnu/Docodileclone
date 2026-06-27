import React from "react";
import { colors, fonts, radii, shadows } from "../../styles/theme";

// The note sizes to its width (set by the board) and grows in height with its
// copy. All inner content flows so the root height tracks the text.
export const styles: Record<string, React.CSSProperties> = {
  root: {
    position: "relative",
    width: "100%",
    minHeight: 120,
    userSelect: "none",
    // Subtle card elevation. drop-shadow (not box-shadow) so it follows the
    // clipped fold/torn silhouette rather than the bounding box.
    filter: `drop-shadow(${shadows.card})`,
  },

  // Darker backsheet revealed through the folded-corner cut. Fills the root.
  foldBack: {
    position: "absolute",
    inset: 0,
    borderRadius: radii.s,
  },

  // Note face — in flow, so its content drives the note's height.
  face: {
    position: "relative",
    zIndex: 1,
    minHeight: 120,
    borderRadius: radii.s,
    padding: "12px 12px 10px",
    display: "flex",
    flexDirection: "column",
    boxSizing: "border-box",
  },

  pushpin: {
    position: "absolute",
    top: "-4px",
    left: "50%",
    width: "12px",
    height: "12px",
    borderRadius: "50%",
    transform: "translateX(-50%)",
    backgroundColor: colors.primary400,
    zIndex: 5,
    pointerEvents: "none",
  },

  deleteBtn: {
    position: "absolute",
    top: "6px",
    right: "8px",
    background: "none",
    border: "none",
    fontSize: "14px",
    cursor: "pointer",
    padding: "2px 4px",
    lineHeight: 1,
    color: colors.neutral500,
    zIndex: 2,
  },

  titleInput: {
    background: "transparent",
    border: "none",
    borderBottom: `1px solid rgba(0,0,0,0.18)`,
    fontFamily: fonts.family.secondary,
    fontStyle: "italic",
    fontSize: fonts.control.sm,
    color: colors.neutral900,
    outline: "none",
    padding: "2px 16px 2px 0",
    marginBottom: "6px",
    width: "100%",
    boxSizing: "border-box",
  },

  // Auto-resized in JS to fit its content (capped by maxLength on the field).
  textArea: {
    background: "transparent",
    border: "none",
    resize: "none",
    outline: "none",
    overflow: "hidden",
    fontFamily: fonts.family.primary,
    fontSize: fonts.size.s,
    color: colors.neutral900,
    lineHeight: 1.4,
    width: "100%",
    minHeight: "3.2em",
    boxSizing: "border-box",
  },

  // Date stamp lives at the END of the note; marginTop:auto pins it to the
  // bottom when the copy is short, and it trails the copy when it's long.
  dateStamp: {
    marginTop: "auto",
    paddingTop: "8px",
    textAlign: "right",
    fontFamily: fonts.family.secondary,
    fontStyle: "italic",
    fontSize: fonts.size.caption,
    color: "rgba(0,0,0,0.45)",
  },
};
