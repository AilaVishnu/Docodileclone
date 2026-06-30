import React from "react";
import type { CSSProperties } from "react";
import { MeasureField } from "../../components/MeasureField";
import { colors, fonts, spacing } from "../../styles/theme";

// VitalsBlock — the nine vitals in a responsive cell grid. Each cell is a
// MeasureField (cream value box + unit chip — the canonical vitals look); BP is
// the two-input split. (A first pass: no BMI auto-calc or unit toggles yet.)
export type VitalsData = {
  bpSys: string;
  bpDia: string;
  bmi: string;
  height: string;
  weight: string;
  temp: string;
  pulse: string;
  waist: string;
  hip: string;
  spo2: string;
};
export const emptyVitals = (): VitalsData => ({
  bpSys: "", bpDia: "", bmi: "", height: "", weight: "", temp: "", pulse: "", waist: "", hip: "", spo2: "",
});

const gridStyle: CSSProperties = { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(116px, 1fr))", gap: spacing.m };
const wrapStyle: CSSProperties = { display: "flex", flexDirection: "column", gap: spacing["2xs"], minWidth: 0 };
const labelStyle: CSSProperties = {
  fontFamily: fonts.family.primary,
  fontSize: fonts.control.sm,
  fontWeight: fonts.weight.medium,
  color: colors.neutral700,
};

export function VitalsBlock({ value, onChange }: { value: VitalsData; onChange: (next: VitalsData) => void }) {
  const set = (patch: Partial<VitalsData>) => onChange({ ...value, ...patch });
  const cell = (label: string, key: keyof VitalsData, unit: string) => (
    <label style={wrapStyle}>
      <span style={labelStyle}>{label}</span>
      <MeasureField value={value[key]} onChange={(v) => set({ [key]: v } as Partial<VitalsData>)} unit={unit} dense />
    </label>
  );
  return (
    <div style={gridStyle}>
      <label style={wrapStyle}>
        <span style={labelStyle}>BP</span>
        <MeasureField bp value={value.bpSys} onChange={(v) => set({ bpSys: v })} value2={value.bpDia} onChange2={(v) => set({ bpDia: v })} unit="mmHg" dense />
      </label>
      {cell("BMI", "bmi", "kg/m²")}
      {cell("Height", "height", "cm")}
      {cell("Weight", "weight", "kg")}
      {cell("Temperature", "temp", "°C")}
      {cell("Pulse", "pulse", "bpm")}
      {cell("Waist", "waist", "cm")}
      {cell("Hip", "hip", "cm")}
      {cell("SpO2", "spo2", "%")}
    </div>
  );
}
