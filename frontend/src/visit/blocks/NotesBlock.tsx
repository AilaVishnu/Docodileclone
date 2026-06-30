import React from "react";
import { IconButton } from "../../components/IconButton";
import { Icon } from "../../components/Icon";
import { noteCardField, noteCardTextarea, noteCardDictate } from "./noteCardStyles";

// NotesBlock — Notes for patient: the exact cream note-card textarea + the
// rewind/mic icons docked bottom-right, like the page. Actions are no-ops here.
export type NotesData = { text: string };
export const emptyNotes = (): NotesData => ({ text: "" });

export function NotesBlock({ value, onChange }: { value: NotesData; onChange: (next: NotesData) => void }) {
  return (
    <div style={noteCardField(true)}>
      <textarea style={noteCardTextarea} placeholder="Type here..." value={value.text} onChange={(e) => onChange({ text: e.target.value })} />
      <span style={noteCardDictate}>
        <IconButton ariaLabel="Copy from previous visit" size={28} disabled>
          <Icon name="rewind-back-circle" size={20} tone="inherit" />
        </IconButton>
        <IconButton ariaLabel="Load template" size={28} onClick={() => {}}>
          <Icon name="microphone" size={20} tone="inherit" />
        </IconButton>
      </span>
    </div>
  );
}
