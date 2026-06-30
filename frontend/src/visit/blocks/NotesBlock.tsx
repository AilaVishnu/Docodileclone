import React from "react";
import type { CSSProperties } from "react";
import { Field } from "../../components/Field";
import { IconButton } from "../../components/IconButton";
import { Icon } from "../../components/Icon";
import { spacing } from "../../styles/theme";

// NotesBlock — a free-text note (Notes for patient) with the rewind/mic icons
// docked bottom-right, like the page. Actions are no-ops here.
export type NotesData = { text: string };
export const emptyNotes = (): NotesData => ({ text: "" });

const wrapStyle: CSSProperties = { position: "relative" };
const dictateStyle: CSSProperties = { position: "absolute", right: spacing.s, bottom: spacing.xs, display: "flex", gap: spacing["2xs"] };

export function NotesBlock({ value, onChange }: { value: NotesData; onChange: (next: NotesData) => void }) {
  return (
    <div style={wrapStyle}>
      <Field
        variant="box"
        fill="filled"
        multiline
        value={value.text}
        onChange={(t) => onChange({ text: t })}
        placeholder="Type here…"
        inputStyle={{ minHeight: 76, paddingRight: 56 }}
      />
      <span style={dictateStyle}>
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
