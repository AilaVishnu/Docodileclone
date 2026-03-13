import React from "react";
import { styles } from "./DomainInput.styles";

type DomainInputProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  suffix?: string;
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  disabled?: boolean;
};

export function DomainInput({
  value,
  onChange,
  placeholder = "your-clinic-domain",
  suffix = ".docodile.app",
  onKeyDown,
  disabled = false,
}: DomainInputProps) {
  return (
    <div style={{ ...styles.container, ...(disabled ? { opacity: 0.6, cursor: "not-allowed" } : {}) }}>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={onKeyDown}
        placeholder={placeholder}
        disabled={disabled}
        style={{ ...styles.input, ...(disabled ? { cursor: "not-allowed" } : {}) }}
      />
      <div style={styles.suffix}>{suffix}</div>
    </div>
  );
}
