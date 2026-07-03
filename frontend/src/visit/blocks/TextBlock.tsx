import React from "react";
import { colors } from "../../styles/theme";
import { noteCardField, noteCardTextarea } from "./noteCardStyles";

// TextBlock — a plain note (Private notes): the exact cream note-card textarea,
// no dictate icons. `variant="private"` swaps the field to the internal grey
// tint (alphaBlack0) the page uses to mark private, non-patient-facing notes.
export type TextData = { text: string };
export const emptyText = (): TextData => ({ text: "" });

export function TextBlock({ value, onChange, variant }: { value: TextData; onChange: (next: TextData) => void; variant?: "private" }) {
  const field = variant === "private" ? { ...noteCardField(true), backgroundColor: colors.alphaBlack0 } : noteCardField(true);
  return (
    <div style={field}>
      <textarea style={noteCardTextarea} placeholder="Type here..." value={value.text} onChange={(e) => onChange({ text: e.target.value })} />
    </div>
  );
}
