import React from "react";
import { Field } from "../../components/Field";

// TextBlock — a single free-text section body (Complaints, Diagnosis, Notes for
// patient, Private notes). One auto-growing textarea; the section title/chrome
// comes from <SectionBlock>.
export type TextData = { text: string };
export const emptyText = (): TextData => ({ text: "" });

export function TextBlock({ value, onChange }: { value: TextData; onChange: (next: TextData) => void }) {
  return (
    <Field
      variant="box"
      fill="filled"
      multiline
      value={value.text}
      onChange={(t) => onChange({ text: t })}
      placeholder="Type here…"
      inputStyle={{ minHeight: 76 }}
    />
  );
}
