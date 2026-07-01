import React from "react";
import { AutocompleteTags } from "../../components/Autocomplete/AutocompleteTags";
import { IconButton } from "../../components/IconButton";
import { Icon } from "../../components/Icon";
import { PopoverMenu } from "../../components/PopoverMenu/PopoverMenu";
import { noteCardField, noteCardDictate, noteTagbox } from "./noteCardStyles";
import {
  noteRow,
  noteLabel,
  noteLabelText,
  noteFieldWrap,
  dictateIcons,
  reorderHandle,
  sectionIcon,
  TESTS_TAGBOX_STYLE,
} from "./bottomRowStyles";

// Tag-note blocks (Complaints / Diagnosis / Tests) — the real AutocompleteTags
// chip input inside the exact cream note-card field, with the rewind
// (copy-from-previous) + mic (load-template) icons docked bottom-right, mirroring
// the prescription page. Copy/template actions are wired via optional props so the
// page can supply the visit/template context; without them the icons stay inert.
export type TagsData = { tags: string[] };
export const emptyTags = (): TagsData => ({ tags: [] });

export type TagsBlockProps = {
  value: TagsData;
  onChange: (next: TagsData) => void;
  /** Copy this field from the previous visit (rewind icon). Omit to disable it. */
  onCopyPrev?: () => void;
  copyPrevDisabled?: boolean;
  /** Load a saved template into this field (mic icon). */
  onLoadTemplate?: () => void;
};

function makeTagsBlock(field: string, ariaLabel: string, placeholder: string, tall: boolean) {
  return function TagsBlock({ value, onChange, onCopyPrev, copyPrevDisabled, onLoadTemplate }: TagsBlockProps) {
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
          <IconButton ariaLabel="Copy from previous visit" size={28} disabled={copyPrevDisabled ?? !onCopyPrev} onClick={onCopyPrev}>
            <Icon name="rewind-back-circle" size={20} tone="inherit" />
          </IconButton>
          <IconButton ariaLabel="Load template" size={28} onClick={onLoadTemplate ?? (() => {})}>
            <Icon name="microphone" size={20} tone="inherit" />
          </IconButton>
        </span>
      </div>
    );
  };
}

export const ComplaintsBlock = makeTagsBlock("complaints", "Complaints", "Type here...", true);
export const DiagnosisBlock = makeTagsBlock("diagnosis", "Diagnosis", "Type here...", true);

// TestsBlock — unlike Complaints/Diagnosis (card bodies), Tests is a compact
// labelled row inside the page's `bottomRows` card: an icon + "Tests" label on
// the left, the AutocompleteTags chip input (in the cream noteFieldWrap) with the
// rewind/mic dictate icons on the right, and the "Save as template" kebab after
// it. Lifted VERBATIM from PrescriptionPage's inline Tests row. The page owns
// testsValue (comma-joined string); the block bridges via value.tags.
export type TestsBlockProps = {
  value: TagsData;
  onChange: (next: TagsData) => void;
  /** Copy tests from the previous visit (rewind icon). Omit to disable. */
  onCopyPrev?: () => void;
  copyPrevDisabled?: boolean;
  /** Load a saved template into Tests (mic icon). */
  onLoadTemplate?: () => void;
  /** Save the current Tests as a template (kebab). */
  onSaveTemplate?: () => void;
};

export function TestsBlock({ value, onChange, onCopyPrev, copyPrevDisabled, onLoadTemplate, onSaveTemplate }: TestsBlockProps) {
  return (
    <div style={noteRow}>
      <div style={noteLabel}>
        <Icon name="document-school" tone="inherit" style={sectionIcon} />
        <span style={noteLabelText}>Tests</span>
      </div>
      <div style={noteFieldWrap}>
        <AutocompleteTags
          field="tests"
          value={value.tags}
          onChange={(next) => onChange({ tags: next })}
          placeholder="Add tests..."
          ariaLabel="Tests"
          containerStyle={TESTS_TAGBOX_STYLE}
        />
        <span style={dictateIcons}>
          <IconButton
            ariaLabel="Copy tests from previous visit"
            size={28}
            disabled={copyPrevDisabled ?? !onCopyPrev}
            onClick={onCopyPrev}
          >
            <Icon name="rewind-back-circle" size={20} tone="inherit" />
          </IconButton>
          <IconButton ariaLabel="Load template" size={28} onClick={onLoadTemplate ?? (() => {})}>
            <Icon name="microphone" size={20} tone="inherit" />
          </IconButton>
                                </span>
      </div>
      <PopoverMenu
          trigger={<Icon name="menu" size={20} tone="inherit" style={reorderHandle} />}
          items={[{ label: "Save as template", onClick: onSaveTemplate ?? (() => {}) }]}
          ariaLabel="Template options"
        />
    </div>
  );
}
