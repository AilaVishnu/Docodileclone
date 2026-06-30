import React from "react";
import { AutocompleteTags } from "../../components/Autocomplete/AutocompleteTags";
import { IconButton } from "../../components/IconButton";
import { Icon } from "../../components/Icon";
import { noteCardField, noteCardDictate, noteTagbox } from "./noteCardStyles";

// Tag-note blocks (Complaints / Diagnosis / Tests) — the real AutocompleteTags
// chip input inside the exact cream note-card field, with the rewind
// (copy-from-previous) + mic (load-template) icons docked bottom-right, mirroring
// the prescription page. The copy/template actions are no-ops here — they need
// the visit/template context the page owns.
export type TagsData = { tags: string[] };
export const emptyTags = (): TagsData => ({ tags: [] });

function makeTagsBlock(field: string, ariaLabel: string, placeholder: string, tall: boolean) {
  return function TagsBlock({ value, onChange }: { value: TagsData; onChange: (next: TagsData) => void }) {
    return (
      <div style={noteCardField(tall)}>
        <AutocompleteTags
          field={field}
          value={value.tags}
          onChange={(next) => onChange({ tags: next })}
          placeholder={placeholder}
          ariaLabel={ariaLabel}
          containerStyle={noteTagbox(tall)}
        />
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
  };
}

export const ComplaintsBlock = makeTagsBlock("complaints", "Complaints", "Type here...", true);
export const DiagnosisBlock = makeTagsBlock("diagnosis", "Diagnosis", "Type here...", true);
export const TestsBlock = makeTagsBlock("tests", "Tests", "Add tests...", false);
