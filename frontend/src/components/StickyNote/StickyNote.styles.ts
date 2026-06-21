import React from "react";
import { colors, fonts, radii } from "../../styles/theme";

// StickyNote fills its positioned parent (the board item / drag wrapper sizes
// it). All inner layers are absolutely positioned within this box.
export const styles: Record<string, React.CSSProperties> = {
  root: {
    position: "relative",
    width: "100%",
    height: "100%",
    userSelect: "none",
  },

  // Backsheet showing through the folded-corner cut. Same footprint as the
  // face, sits behind it — only visible where the face is clipped away.
  foldBack: {
    position: "absolute",
    inset: 0,
    borderRadius: radii.s,
  },

  // Note face — solid colour, clipped per-note (corner cut + optional tear).
  face: {
    position: "absolute",
    inset: 0,
    borderRadius: radii.s,
    padding: "10px 12px 14px",
    display: "flex",
    flexDirection: "column",
  },

  // Pushpin head — small flat circle sitting on top of the note.
  pushpin: {
    position: "absolute",
    top: "-4px",
    left: "50%",
    width: "12px",
    height: "12px",
    borderRadius: "50%",
    transform: "translateX(-50%)",
    zIndex: 5,
    pointerEvents: "none",
  },

  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "2px",
    height: "20px",
  },
  iconBtn: {
    background: "none",
    border: "none",
    fontSize: "14px",
    cursor: "pointer",
    padding: "2px 4px",
    lineHeight: 1,
    color: colors.neutral500,
  },

  dateStamp: {
    fontFamily: fonts.family.secondary,
    fontStyle: "italic",
    fontSize: fonts.size.caption,
    color: "rgba(0,0,0,0.45)",
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
    padding: "2px 0",
    marginBottom: "6px",
  },
  textArea: {
    flex: 1,
    background: "transparent",
    border: "none",
    resize: "none",
    outline: "none",
    fontFamily: fonts.family.primary,
    fontSize: fonts.size.s,
    color: colors.neutral900,
    lineHeight: 1.4,
  },
};
