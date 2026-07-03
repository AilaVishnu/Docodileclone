import React from "react";
import { MedicineAutocomplete } from "../../components/MedicineAutocomplete/MedicineAutocomplete";
import { FrequencyPicker } from "../../components/FrequencyPicker/FrequencyPicker";
import { WhenPicker } from "../../components/WhenPicker/WhenPicker";
import { FrequencyIntervalPicker } from "../../components/FrequencyIntervalPicker/FrequencyIntervalPicker";
import { DurationPicker } from "../../components/DurationPicker/DurationPicker";
import { Field } from "../../components/Field";
import { Icon } from "../../components/Icon";
import { IconButton } from "../../components/IconButton";
import { PopoverMenu } from "../../components/PopoverMenu/PopoverMenu";
import { styles } from "../../pages/PrescriptionPage/PrescriptionPage.styles";
import { fonts, spacing } from "../../styles/theme";

// RxBlock — the prescription rows, lifted VERBATIM from PrescriptionPage's inline
// Rx section: MedicineAutocomplete (cream box), the frequency/when/interval/
// duration pickers, the generic-name overlay input, tapering ("then…") sub-rows,
// the drug-interaction banner, the auto-trailing empty row, and the Rx-actions
// row (copy from previous + load/save template). The page owns rxRows + every
// page-state-dependent handler; the block receives them as props and only owns
// the markup. Rendered inside a <SectionBlock title="Rx" surface="card"> whose
// header supplies the icon + collapse chevron.

// The Rx row shapes mirror the page's RxRowDraft / ThenRow. Kept structural so
// the page can pass its own state straight through without a data adapter.
export type RxThenRow = {
  dosage: string;
  whenToTake: string;
  frequency: string;
  frequencyInterval: string;
  duration: string;
  notes: string;
};
export type RxRow = {
  id: string | null;
  position: number;
  medicine: string;
  genericName: string;
  medicineNote: string;
  dosage: string;
  whenToTake: string;
  frequency: string;
  frequencyInterval: string;
  duration: string;
  notes: string;
  thenRows: RxThenRow[];
};

export type RxInteraction = { drug: string; interactsWith: string; comment: string };

export type RxBlockProps = {
  rows: RxRow[];
  interactions: RxInteraction[];
  /** Patch a single field on the row at `index` (medicine cell + generic name). */
  onUpdateField: (index: number, key: keyof RxRow, value: string) => void;
  /** Edit the medicine on the row at `index` (also runs autofill on the page). */
  onMedicineChange: (index: number, value: string) => void;
  onMedicineSelect: (index: number, name: string, genericName: string) => void;
  onAddThenRow: (index: number) => void;
  onRemoveRxRow: (index: number) => void;
  onUpdateThenField: (index: number, thenIndex: number, key: keyof RxThenRow, value: string) => void;
  onRemoveThenRow: (index: number, thenIndex: number) => void;
  /** Copy the previous visit's prescriptions into the pad (rewind icon). */
  onCopyPrev?: () => void;
  copyPrevDisabled?: boolean;
  /** Load a saved Rx template (mic icon). */
  onLoadTemplate?: () => void;
  /** Save the current Rx as a template (kebab). */
  onSaveTemplate?: () => void;
};

export function RxBlock({
  rows,
  interactions,
  onUpdateField,
  onMedicineChange,
  onMedicineSelect,
  onAddThenRow,
  onRemoveRxRow,
  onUpdateThenField,
  onRemoveThenRow,
  onCopyPrev,
  copyPrevDisabled,
  onLoadTemplate,
  onSaveTemplate,
}: RxBlockProps) {
  return (
    <div style={styles.rxTable}>
      {interactions.length > 0 && (
        <div style={styles.rxInteractionBanner}>
          {interactions.map((w, i) => (
            <div key={i} style={styles.rxInteractionRow}>
              <span style={styles.rxInteractionIcon}>⚠</span>
              <span style={styles.rxInteractionText}>
                <strong style={{ textTransform: "capitalize" }}>{w.drug}</strong>
                {" + "}
                <strong style={{ textTransform: "capitalize" }}>{w.interactsWith}</strong>
                {w.comment ? `: ${w.comment}` : ""}
              </span>
            </div>
          ))}
        </div>
      )}
      {rows.map((row, i) => {
        const updateField = (key: keyof RxRow, value: string) => onUpdateField(i, key, value);
        return (
          <div key={row.id ?? `draft-${i}`} style={{ ...styles.rxGroup, zIndex: rows.length + 5 - i }}>
            {/* Left: serial + medicine cell — visually anchors for all tapering rows */}
            <div style={styles.rxGroupLeft}>
              <span style={styles.rxSerial}>{i + 1}</span>
              <div style={{ ...styles.rxMedicineCell, flex: 1, position: "relative" }}>
                <div style={styles.rxMedicineInputCol}>
                  <MedicineAutocomplete
                    inputStyle={styles.rxMedicineInput}
                    placeholder="Medicine"
                    value={row.medicine}
                    onChange={(v) => onMedicineChange(i, v)}
                    onSelect={(name, genericName) => onMedicineSelect(i, name, genericName)}
                  />
                </div>
                {row.medicine.trim() && (
                  <input
                    type="text"
                    style={{
                      ...styles.rxGenericName,
                      position: "absolute",
                      left: spacing.s,
                      top: "calc(100% + 2px)",
                      width: "auto",
                      right: 8,
                    }}
                    placeholder="Unknown"
                    value={row.genericName}
                    onChange={(e) => updateField("genericName", e.target.value)}
                  />
                )}
                <div style={styles.rxGenericRow}>
                  <button
                    type="button"
                    style={styles.rxAddNoteBtn}
                    title="Add tapering dose"
                    onClick={() => onAddThenRow(i)}
                  >
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <line x1="6" y1="1" x2="6" y2="11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                      <line x1="1" y1="6" x2="11" y2="6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                    </svg>
                  </button>
                </div>
              </div>
            </div>
            {/* Right: stacked tapering rows */}
            <div style={styles.rxGroupRight}>
              <div style={styles.rxDataRow}>
                <div style={styles.rxDataCell}><FrequencyPicker value={row.frequency} onChange={(v) => updateField("frequency", v)} /></div>
                <div style={styles.rxDataCell}><WhenPicker value={row.whenToTake} onChange={(v) => updateField("whenToTake", v)} /></div>
                <div style={styles.rxDataCell}><FrequencyIntervalPicker value={row.frequencyInterval} onChange={(v) => updateField("frequencyInterval", v)} /></div>
                <div style={styles.rxDataCell}><DurationPicker value={row.duration} onChange={(v) => updateField("duration", v)} /></div>
                <div style={{ flex: "1 1 96px", minWidth: 84 }}>
                  <Field multiline variant="box" fill="filled" placeholder="Notes" value={row.notes} onChange={(v) => updateField("notes", v)} style={{ minHeight: 40, padding: `${spacing.xs} ${spacing.s}` }} inputStyle={{ fontSize: fonts.control.sm }} />
                </div>
                {row.medicine.trim() && (
                  <button type="button" style={styles.rxDeleteBtn} onClick={() => onRemoveRxRow(i)} title="Remove medicine">
                    <Icon name="trash" size={16} tone="inherit" />
                  </button>
                )}
              </div>
              {row.thenRows.map((thenRow, ti) => (
                <div key={`then-${i}-${ti}`} style={styles.rxDataRow}>
                  <div style={styles.rxDataCell}><FrequencyPicker value={thenRow.frequency} onChange={(v) => onUpdateThenField(i, ti, "frequency", v)} /></div>
                  <div style={styles.rxDataCell}><WhenPicker value={thenRow.whenToTake} onChange={(v) => onUpdateThenField(i, ti, "whenToTake", v)} /></div>
                  <div style={styles.rxDataCell}><FrequencyIntervalPicker value={thenRow.frequencyInterval} onChange={(v) => onUpdateThenField(i, ti, "frequencyInterval", v)} /></div>
                  <div style={styles.rxDataCell}><DurationPicker value={thenRow.duration} onChange={(v) => onUpdateThenField(i, ti, "duration", v)} /></div>
                  <div style={{ flex: "1 1 96px", minWidth: 84 }}>
                    <Field multiline variant="box" fill="filled" placeholder="Notes" value={thenRow.notes} onChange={(v) => onUpdateThenField(i, ti, "notes", v)} style={{ minHeight: 40, padding: `${spacing.xs} ${spacing.s}` }} inputStyle={{ fontSize: fonts.control.sm }} />
                  </div>
                  <button type="button" style={styles.rxDeleteBtn} onClick={() => onRemoveThenRow(i, ti)} title="Remove tapering row">
                    <Icon name="trash" size={16} tone="inherit" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        );
      })}
      {/* Rx-level actions row — copy from previous visit, load /
          save template. (Adding a row is now the trailing empty
          row: type a medicine and the next empty appears.) */}
      <div style={styles.addMedicineRow}>
        <span style={styles.dictateIcons}>
          <IconButton
            ariaLabel="Copy Rx from previous visit"
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
        <PopoverMenu
        trigger={<Icon name="menu" size={20} tone="inherit" style={styles.reorderHandle} />}
        items={[{ label: "Save as template", onClick: onSaveTemplate ?? (() => {}) }]}
        ariaLabel="Template options"
      />
      </div>
    </div>
  );
}
