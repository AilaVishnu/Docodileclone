import React from "react";
import { styles } from "./TextInput.styles";

type TextInputProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  iconLeft?: React.ReactNode;
  iconRight?: React.ReactNode;
  type?: "text" | "password" | "email";
};

export function TextInput({
  value,
  onChange,
  placeholder,
  iconLeft,
  iconRight,
  type = "text",
}: TextInputProps) {
  return (
    <div style={styles.container}>
      {iconLeft && <span style={styles.icon}>{iconLeft}</span>}

      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        style={styles.input}
      />

      {iconRight && <span style={styles.icon}>{iconRight}</span>}
    </div>
  );
}
