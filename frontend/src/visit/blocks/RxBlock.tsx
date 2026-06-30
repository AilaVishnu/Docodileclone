import React from "react";
import type { CSSProperties } from "react";
import { MedicineAutocomplete } from "../../components/MedicineAutocomplete/MedicineAutocomplete";
import { FrequencyPicker } from "../../components/FrequencyPicker/FrequencyPicker";
import { WhenPicker } from "../../components/WhenPicker/WhenPicker";
import { FrequencyIntervalPicker } from "../../components/FrequencyIntervalPicker/FrequencyIntervalPicker";
import { DurationPicker } from "../../components/DurationPicker/DurationPicker";
import { Field } from "../../components/Field";
import { Button } from "../../components/Button";
import { Icon } from "../../components/Icon";
import { IconButton } from "../../components/IconButton";
import { colors, fonts, spacing } from "../../styles/theme";

// RxBlock — the prescription rows, composed from the REAL Rx-pad components
// (MedicineAutocomplete + frequency/when/interval/duration pickers + notes), the
// same pieces the PrescriptionPage uses inline — including the generic-name line
// and the tapering ("then…") sub-rows that share a medicine.
export type RxThen = { id: string; frequency: string; whenToTake: string; frequencyInterval: string; duration: string; notes: string };
export type RxRow = RxThen & { medicine: string; genericName: string; thenRows: RxThen[] };
export type RxData = { rows: RxRow[] };

let _n = 0;
const uid = (p: string) => `${p}-${(_n += 1)}`;
const newThen = (): RxThen => ({ id: uid("then"), frequency: "", whenToTake: "", frequencyInterval: "", duration: "", notes: "" });
const newRow = (): RxRow => ({ ...newThen(), id: uid("rx"), medicine: "", genericName: "", thenRows: [] });
export const emptyRx = (): RxData => ({ rows: [newRow()] });

const listStyle: CSSProperties = { display: "flex", flexDirection: "column", gap: spacing.m };
const groupStyle: CSSProperties = { display: "flex", gap: spacing.s, alignItems: "flex-start", flexWrap: "wrap" };
const leftStyle: CSSProperties = { display: "flex", gap: spacing.s, alignItems: "flex-start", flex: "1 1 240px", minWidth: 220 };
const serialStyle: CSSProperties = { fontFamily: fonts.family.primary, fontSize: fonts.control.sm, color: colors.neutral500, width: 14, flexShrink: 0, paddingTop: 8 };
const medColStyle: CSSProperties = { display: "flex", flexDirection: "column", gap: spacing["2xs"], flex: 1, minWidth: 0 };
const rightStyle: CSSProperties = { flex: "999 1 320px", display: "flex", flexDirection: "column", gap: spacing.s, minWidth: 0 };
const dataRowStyle: CSSProperties = { display: "flex", gap: spacing.s, alignItems: "flex-start", flexWrap: "wrap" };
const cellStyle: CSSProperties = { minWidth: 0 };
const taperBtnStyle: CSSProperties = { display: "inline-flex", alignItems: "center", gap: 4, alignSelf: "flex-start", background: "transparent", border: "none", cursor: "pointer", color: colors.neutral500, fontFamily: fonts.family.primary, fontSize: fonts.control.xs, padding: 0 };

// One dose line (the main row's schedule, or a tapering "then" row).
function DoseRow({ data, onChange, onRemove }: { data: RxThen; onChange: (patch: Partial<RxThen>) => void; onRemove?: () => void }) {
  return (
    <div style={dataRowStyle}>
      <div style={cellStyle}><FrequencyPicker value={data.frequency} onChange={(v) => onChange({ frequency: v })} /></div>
      <div style={cellStyle}><WhenPicker value={data.whenToTake} onChange={(v) => onChange({ whenToTake: v })} /></div>
      <div style={cellStyle}><FrequencyIntervalPicker value={data.frequencyInterval} onChange={(v) => onChange({ frequencyInterval: v })} /></div>
      <div style={cellStyle}><DurationPicker value={data.duration} onChange={(v) => onChange({ duration: v })} /></div>
      <div style={{ flex: 1, minWidth: 120 }}>
        <Field variant="box" fill="filled" value={data.notes} onChange={(v) => onChange({ notes: v })} placeholder="Notes" />
      </div>
      {onRemove ? (
        <IconButton ariaLabel="Remove" title="Remove" size={32} onClick={onRemove}><Icon name="trash" tone="inherit" size={16} /></IconButton>
      ) : (
        <span style={{ width: 32, flexShrink: 0 }} />
      )}
    </div>
  );
}

export function RxBlock({ value, onChange }: { value: RxData; onChange: (next: RxData) => void }) {
  const setRows = (rows: RxRow[]) => onChange({ rows });
  const patchRow = (id: string, patch: Partial<RxRow>) => setRows(value.rows.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  const addRow = () => setRows([...value.rows, newRow()]);
  const removeRow = (id: string) => setRows(value.rows.filter((r) => r.id !== id));
  const addThen = (row: RxRow) => patchRow(row.id, { thenRows: [...row.thenRows, newThen()] });
  const patchThen = (row: RxRow, thenId: string, patch: Partial<RxThen>) =>
    patchRow(row.id, { thenRows: row.thenRows.map((t) => (t.id === thenId ? { ...t, ...patch } : t)) });
  const removeThen = (row: RxRow, thenId: string) => patchRow(row.id, { thenRows: row.thenRows.filter((t) => t.id !== thenId) });

  return (
    <div style={listStyle}>
      {value.rows.map((r, i) => (
        <div key={r.id} style={groupStyle}>
          <div style={leftStyle}>
            <span style={serialStyle}>{i + 1}</span>
            <div style={medColStyle}>
              <MedicineAutocomplete
                value={r.medicine}
                placeholder="Medicine"
                onChange={(v) => patchRow(r.id, { medicine: v })}
                onSelect={(name, generic) => patchRow(r.id, { medicine: name, genericName: generic })}
              />
              {r.medicine.trim() ? (
                <Field variant="underline" value={r.genericName} onChange={(v) => patchRow(r.id, { genericName: v })} placeholder="Unknown" />
              ) : null}
              {r.medicine.trim() ? (
                <button type="button" style={taperBtnStyle} title="Add tapering dose" onClick={() => addThen(r)}>
                  <Icon name="plus" tone="inherit" size={12} /> Taper
                </button>
              ) : null}
            </div>
          </div>
          <div style={rightStyle}>
            <DoseRow data={r} onChange={(patch) => patchRow(r.id, patch)} onRemove={value.rows.length > 1 ? () => removeRow(r.id) : undefined} />
            {r.thenRows.map((t) => (
              <DoseRow key={t.id} data={t} onChange={(patch) => patchThen(r, t.id, patch)} onRemove={() => removeThen(r, t.id)} />
            ))}
          </div>
        </div>
      ))}
      <Button variant="light" size="sm" iconLeft={<Icon name="plus" tone="inherit" size={14} />} onClick={addRow} style={{ alignSelf: "flex-start" }}>
        Add medicine
      </Button>
    </div>
  );
}
