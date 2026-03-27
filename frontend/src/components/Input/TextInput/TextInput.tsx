import React from "react";
import { styles } from "./TextInput.styles";

type TextInputProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  iconLeft?: React.ReactNode;
  iconRight?: React.ReactNode;
  type?: "text" | "password" | "email";
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
  error?: boolean;
  maxLength?: number;
};

export function TextInput({
  value,
  onChange,
  placeholder,
  iconLeft,
  iconRight,
  type = "text",
  onKeyDown,
  onBlur,
  error,
  maxLength,
}: TextInputProps) {
  const containerStyle = error
    ? { ...styles.container, ...styles.errorContainer }
    : styles.container;

  return (
    <div style={containerStyle}>
      {iconLeft && <span style={styles.icon}>{iconLeft}</span>}

      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={onKeyDown}
        onBlur={onBlur}
        placeholder={placeholder}
        maxLength={maxLength}
        style={styles.input}
      />

      {iconRight && <span style={styles.icon}>{iconRight}</span>}
    </div>
  );
}
