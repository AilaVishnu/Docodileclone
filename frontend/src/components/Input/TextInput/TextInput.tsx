import React from "react";
import { styles } from "./TextInput.styles";

type TextInputProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  icon?: React.ReactNode; // emoji or icon component
  type?: "text" | "password" | "email";
};

export function TextInput({
  value,
  onChange,
  placeholder,
  icon,
  type = "text",
}: TextInputProps) {
  return (
    <div style={styles.container}>
      {icon && <span style={styles.icon}>{icon}</span>}

      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        style={styles.input}
      />
    </div>
  );
}
