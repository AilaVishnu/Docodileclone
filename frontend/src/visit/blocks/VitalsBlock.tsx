import React from "react";
import type { CSSProperties } from "react";
import { MeasureField } from "../../components/MeasureField";
import { colors, fonts, spacing } from "../../styles/theme";

// VitalsBlock — lifted verbatim from PrescriptionPage's Vitals: the column model,
// BMI auto-calc (Height/Weight ⇄ BMI mutual-exclusion + lock), unit toggles
// (mmHg↔kPa, cm↔in, kg↔lb, °C↔°F), range validation, and the BP sys/dia split.
// Self-contained: owns the keyed vital state via value/onChange.

type VitalCell = { label: string; unit: string; unitWidth?: number; placeholder?: string };
const VITAL_COLUMNS: VitalCell[][] = [
  [{ label: "BP", unit: "mmHg", unitWidth: 64 }, { label: "BMI", unit: "kg/m²", unitWidth: 64 }],
  [{ label: "Height", unit: "cm", unitWidth: 44 }, { label: "Weight", unit: "kg", unitWidth: 44 }],
  [{ label: "Temperature", unit: "°C", unitWidth: 44 }, { label: "Pulse", unit: "bpm", unitWidth: 44 }],
  [{ label: "Waist", unit: "cm", unitWidth: 44 }, { label: "Hip", unit: "cm", unitWidth: 44 }],
  [{ label: "SPO2", unit: "%", unitWidth: 44 }],
];
const VITAL_CELLS: { cell: VitalCell; cellKey: string }[] = VITAL_COLUMNS.flatMap((col, ci) => col.map((cell, ri) => ({ cell, cellKey: `${ci}-${ri}` })));
const VITAL_KEY_BY_LABEL: Record<string, string> = {};
VITAL_COLUMNS.forEach((col, ci) => col.forEach((v, ri) => { VITAL_KEY_BY_LABEL[v.label] = `${ci}-${ri}`; }));
const BMI_KEY = VITAL_KEY_BY_LABEL["BMI"];
const HEIGHT_KEY = VITAL_KEY_BY_LABEL["Height"];
const WEIGHT_KEY = VITAL_KEY_BY_LABEL["Weight"];

export type VitalCellState = { value: string; unit: string };
export type VitalsData = Record<string, VitalCellState>;
export const emptyVitals = (): VitalsData => {
  const state: VitalsData = {};
  VITAL_COLUMNS.forEach((col, ci) => col.forEach((v, ri) => { state[`${ci}-${ri}`] = { value: "", unit: v.unit }; }));
  return state;
};

const computeBmi = (height: VitalCellState | undefined, weight: VitalCellState | undefined): string => {
  if (!height || !weight) return "";
  const h = parseFloat(height.value);
  const w = parseFloat(weight.value);
  if (!Number.isFinite(h) || !Number.isFinite(w) || h <= 0 || w <= 0) return "";
  const heightM = height.unit === "in" ? h * 0.0254 : h / 100;
  const weightKg = weight.unit === "lb" ? w * 0.453592 : w;
  if (heightM <= 0) return "";
  const bmi = weightKg / (heightM * heightM);
  if (!Number.isFinite(bmi) || bmi <= 0) return "";
  return bmi.toFixed(1);
};

const convertNum = (v: string, factor: number, decimals = 1): string => {
  const n = parseFloat(v);
  return Number.isNaN(n) ? v : (n * factor).toFixed(decimals);
};
const convertTemp = (v: string, to: "F" | "C"): string => {
  const n = parseFloat(v);
  if (Number.isNaN(n)) return v;
  return (to === "F" ? (n * 9) / 5 + 32 : ((n - 32) * 5) / 9).toFixed(1);
};
const convertBp = (v: string, to: "mmHg" | "kPa"): string =>
  v.split("/").map((p) => {
    const n = parseFloat(p.trim());
    if (Number.isNaN(n)) return p;
    return to === "kPa" ? (n * 0.133322).toFixed(1) : Math.round(n / 0.133322).toString();
  }).join("/");

type VitalRange = { min: number; max: number };
const VITAL_RANGES: Record<string, Record<string, VitalRange>> = {
  BP_sys: { mmHg: { min: 60, max: 220 }, kPa: { min: 8, max: 30 } },
  BP_dia: { mmHg: { min: 30, max: 140 }, kPa: { min: 4, max: 19 } },
  BMI: { "kg/m²": { min: 10, max: 60 } },
  Height: { cm: { min: 30, max: 250 }, in: { min: 12, max: 100 } },
  Weight: { kg: { min: 1, max: 300 }, lb: { min: 2, max: 660 } },
  Temperature: { "°C": { min: 30, max: 45 }, "°F": { min: 86, max: 113 } },
  Pulse: { bpm: { min: 30, max: 220 } },
  Waist: { cm: { min: 30, max: 200 }, in: { min: 12, max: 80 } },
  Hip: { cm: { min: 30, max: 200 }, in: { min: 12, max: 80 } },
  SPO2: { "%": { min: 50, max: 100 } },
};
const isVitalValid = (rangeKey: string, value: string, unit: string): boolean => {
  if (value.trim() === "") return true;
  const r = VITAL_RANGES[rangeKey]?.[unit];
  if (!r) return true;
  const n = parseFloat(value);
  if (Number.isNaN(n)) return false;
  return n >= r.min && n <= r.max;
};
const UNIT_TOGGLES: Record<string, { altUnit: string; convert: (v: string) => string }> = {
  mmHg: { altUnit: "kPa", convert: (v) => convertBp(v, "kPa") },
  kPa: { altUnit: "mmHg", convert: (v) => convertBp(v, "mmHg") },
  cm: { altUnit: "in", convert: (v) => convertNum(v, 0.393701) },
  in: { altUnit: "cm", convert: (v) => convertNum(v, 2.54) },
  kg: { altUnit: "lb", convert: (v) => convertNum(v, 2.20462) },
  lb: { altUnit: "kg", convert: (v) => convertNum(v, 0.453592) },
  "°C": { altUnit: "°F", convert: (v) => convertTemp(v, "F") },
  "°F": { altUnit: "°C", convert: (v) => convertTemp(v, "C") },
};

const gridStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(var(--vital-cols), minmax(0, 1fr))",
  columnGap: "var(--vital-col-gap)",
  rowGap: "var(--vital-row-gap)",
  alignItems: "start",
  paddingBottom: spacing.s,
};
const cellStyle: CSSProperties = { position: "relative", display: "flex", flexDirection: "column", gap: spacing.xs };
const labelStyle: CSSProperties = { fontSize: fonts.control.xs, lineHeight: fonts.lineHeight.xs, color: colors.neutral500 };
const inputRowStyle: CSSProperties = { display: "flex", alignItems: "center", height: 28 };
const errorStyle: CSSProperties = { position: "absolute", top: "100%", left: 0, marginTop: 2, fontSize: fonts.control.xs, lineHeight: fonts.lineHeight.xs, color: colors.red200, whiteSpace: "nowrap" };

export function VitalsBlock({ value, onChange }: { value: VitalsData; onChange: (next: VitalsData) => void }) {
  const setVitalValue = (key: string, v: string) => onChange({ ...value, [key]: { ...value[key], value: v } });
  const toggleVitalUnit = (key: string) => {
    const cell = value[key];
    const toggle = UNIT_TOGGLES[cell.unit];
    if (!toggle) return;
    onChange({ ...value, [key]: { value: toggle.convert(cell.value), unit: toggle.altUnit } });
  };

  // BMI auto-calc — derived (and locked) while Height/Weight present; a manually
  // typed BMI (H/W empty) is never overwritten.
  const hCell = value[HEIGHT_KEY];
  const wCell = value[WEIGHT_KEY];
  React.useEffect(() => {
    const hwFilled = (hCell?.value ?? "").trim() !== "" || (wCell?.value ?? "").trim() !== "";
    if (!hwFilled) return;
    const next = computeBmi(hCell, wCell);
    if ((value[BMI_KEY]?.value ?? "") !== next) {
      onChange({ ...value, [BMI_KEY]: { value: next, unit: value[BMI_KEY]?.unit ?? "kg/m²" } });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hCell?.value, hCell?.unit, wCell?.value, wCell?.unit]);

  const vitalsHaveHeightWeight = (hCell?.value ?? "").trim() !== "" || (wCell?.value ?? "").trim() !== "";
  const vitalsHaveBmi = (value[BMI_KEY]?.value ?? "").trim() !== "";
  const lockBmiField = vitalsHaveHeightWeight;
  const lockHeightWeightFields = vitalsHaveBmi && !vitalsHaveHeightWeight;

  return (
    <div style={gridStyle}>
      {VITAL_CELLS.map(({ cell: v, cellKey }) => {
        const cell = value[cellKey];
        const canToggle = !!UNIT_TOGGLES[cell.unit];
        const isBp = v.label === "BP";
        const isBmi = v.label === "BMI";
        const isHeightOrWeight = v.label === "Height" || v.label === "Weight";
        const cellLocked = (isBmi && lockBmiField) || (isHeightOrWeight && lockHeightWeightFields);
        const [bpSys = "", bpDia = ""] = isBp ? cell.value.split("/") : [];
        const setBpPart = (sys: string, dia: string) => setVitalValue(cellKey, `${sys}/${dia}`);
        const sysValid = isBp ? isVitalValid("BP_sys", bpSys, cell.unit) : true;
        const diaValid = isBp ? isVitalValid("BP_dia", bpDia, cell.unit) : true;
        const valueValid = isBmi && lockBmiField ? true : isBp ? sysValid && diaValid : isVitalValid(v.label, cell.value, cell.unit);
        const rangeForLabel = isBp ? VITAL_RANGES.BP_sys?.[cell.unit] : VITAL_RANGES[v.label]?.[cell.unit];
        const rangeHint = rangeForLabel ? `Valid: ${rangeForLabel.min}–${rangeForLabel.max} ${cell.unit}` : undefined;
        return (
          <div key={cellKey} style={cellStyle}>
            <span style={labelStyle}>{v.label}</span>
            <div style={inputRowStyle} title={!valueValid ? rangeHint : undefined}>
              <MeasureField
                bp={isBp}
                value={isBp ? bpSys : cell.value}
                readOnly={cellLocked}
                onChange={isBp ? (val) => setBpPart(val, bpDia) : cellLocked ? () => {} : (val) => setVitalValue(cellKey, val)}
                value2={isBp ? bpDia : undefined}
                onChange2={isBp ? (val) => setBpPart(bpSys, val) : undefined}
                unit={cell.unit}
                unitWidth={v.unitWidth}
                onToggleUnit={canToggle && !cellLocked ? () => toggleVitalUnit(cellKey) : undefined}
                invalid={!valueValid}
                dense
                placeholder={v.placeholder ?? ""}
                ariaLabel={isBp ? "Systolic" : v.label}
                ariaLabel2={isBp ? "Diastolic" : undefined}
              />
            </div>
            {!valueValid && (
              <span style={errorStyle}>
                {rangeForLabel ? `Enter valid details (${rangeForLabel.min}–${rangeForLabel.max} ${cell.unit})` : "Enter valid details"}
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}
