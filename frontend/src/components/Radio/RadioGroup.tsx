import React from "react";
import { spacing } from "../../styles/theme";
import { Radio } from "./Radio";

// A set of mutually-exclusive radios. Pass `options` as plain strings (label =
// value) or as objects for per-option colour/disabled (e.g. a red "Waive").
export type RadioOption = { label: React.ReactNode; value: string; color?: string; disabled?: boolean };

type RadioGroupProps = {
  /** Native radio group name — must be unique per group on the page. */
  name: string;
  value: string;
  onChange: (value: string) => void;
  options: Array<RadioOption | string>;
  orientation?: "row" | "column";
  /** Lay options out in a grid of N equal columns (overrides orientation). */
  columns?: number;
  /** Gap between options. Default = spacing.m (16). */
  gap?: number | string;
  /** Disable the whole group. */
  disabled?: boolean;
};

export function RadioGroup({ name, value, onChange, options, orientation = "row", columns, gap, disabled }: RadioGroupProps) {
  const norm: RadioOption[] = options.map((o) => (typeof o === "string" ? { label: o, value: o } : o));
  const row = orientation === "row";
  return (
    <div
      style={
        columns != null
          ? {
              display: "grid",
              gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
              alignItems: "center",
              gap: gap ?? spacing.m,
            }
          : {
              display: "flex",
              flexDirection: row ? "row" : "column",
              flexWrap: row ? "wrap" : "nowrap",
              alignItems: row ? "center" : "flex-start",
              gap: gap ?? spacing.m,
            }
      }
    >
      {norm.map((o) => (
        <Radio
          key={o.value}
          name={name}
          value={o.value}
          label={o.label}
          color={o.color}
          checked={value === o.value}
          disabled={disabled || o.disabled}
          onChange={onChange}
        />
      ))}
    </div>
  );
}
