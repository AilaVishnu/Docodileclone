import React from "react";
import type { CSSProperties } from "react";
import { AutocompleteTags } from "../../components/Autocomplete/AutocompleteTags";
import { IconButton } from "../../components/IconButton";
import { Icon } from "../../components/Icon";
import { spacing } from "../../styles/theme";

// Tag-note blocks (Complaints / Diagnosis / Tests) — the real AutocompleteTags
// chip input with the rewind (copy-from-previous) + mic (load-template) icons
// docked bottom-right, mirroring the prescription page. The copy/template
// actions are no-ops here — they need the visit/template context the page owns.
export type TagsData = { tags: string[] };
export const emptyTags = (): TagsData => ({ tags: [] });

const wrapStyle: CSSProperties = { position: "relative" };
const dictateStyle: CSSProperties = { position: "absolute", right: spacing.s, bottom: spacing.xs, display: "flex", gap: spacing["2xs"] };

function makeTagsBlock(field: string, ariaLabel: string, placeholder: string, tall: boolean) {
  return function TagsBlock({ value, onChange }: { value: TagsData; onChange: (next: TagsData) => void }) {
    return (
      <div style={wrapStyle}>
        <AutocompleteTags
          field={field}
          value={value.tags}
          onChange={(next) => onChange({ tags: next })}
          placeholder={placeholder}
          ariaLabel={ariaLabel}
          containerStyle={{ paddingRight: 64, ...(tall ? { minHeight: 76, alignItems: "flex-start" } : {}) }}
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
  };
}

export const ComplaintsBlock = makeTagsBlock("complaints", "Complaints", "Type here…", true);
export const DiagnosisBlock = makeTagsBlock("diagnosis", "Diagnosis", "Type here…", true);
export const TestsBlock = makeTagsBlock("tests", "Tests", "Add tests…", false);
