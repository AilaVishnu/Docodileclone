import React from "react";
import { styles } from "./DomainInput.styles";

type DomainInputProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  suffix?: string;
};

export function DomainInput({
  value,
  onChange,
  placeholder = "your-clinic",
  suffix = ".docodile.app",
}: DomainInputProps) {
  return (
    <div style={styles.container}>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        style={styles.input}
      />
      <div style={styles.suffix}>{suffix}</div>
    </div>
  );
}
