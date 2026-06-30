import React from "react";
import { noteCardField, noteCardTextarea } from "./noteCardStyles";

// TextBlock — a plain note (Private notes): the exact cream note-card textarea,
// no dictate icons (matching the page's private-notes card).
export type TextData = { text: string };
export const emptyText = (): TextData => ({ text: "" });

export function TextBlock({ value, onChange }: { value: TextData; onChange: (next: TextData) => void }) {
  return (
    <div style={noteCardField(true)}>
      <textarea style={noteCardTextarea} placeholder="Type here..." value={value.text} onChange={(e) => onChange({ text: e.target.value })} />
    </div>
  );
}
