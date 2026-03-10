import React from "react";
import { styles } from "./DomainInput.styles";

type DomainInputProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  suffix?: string;
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
};

export function DomainInput({
  value,
  onChange,
  placeholder = "your-clinic-domain",
  suffix = ".docodile.app",
  onKeyDown,
}: DomainInputProps) {
  return (
    <div style={styles.container}>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={onKeyDown}
        placeholder={placeholder}
        style={styles.input}
      />
      <div style={styles.suffix}>{suffix}</div>
    </div>
  );
}
