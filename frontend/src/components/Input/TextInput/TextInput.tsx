import React, { useRef, useCallback, useEffect } from "react";
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
  multiline?: boolean;
};

function AutoGrowTextarea({ value, onChange, placeholder, maxLength }: {
  value: string; onChange: (v: string) => void; placeholder?: string; maxLength?: number;
}) {
  const ref = useRef<HTMLTextAreaElement>(null);

  const maxHeight = 80; // ~4 lines max

  const resize = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = "auto";
    const scrollH = el.scrollHeight;
    if (scrollH > maxHeight) {
      el.style.height = maxHeight + "px";
      el.style.overflowY = "auto";
    } else {
      el.style.height = scrollH + "px";
      el.style.overflowY = "hidden";
    }
  }, []);

  useEffect(() => { resize(); }, [value, resize]);

  return (
    <textarea
      ref={ref}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      maxLength={maxLength}
      rows={1}
      style={{ ...styles.input, resize: "none" as const, overflow: "hidden" }}
    />
  );
}

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
  multiline,
}: TextInputProps) {
  const containerStyle = {
    ...styles.container,
    ...(multiline ? { alignItems: "flex-start" as const } : {}),
    ...(error ? styles.errorContainer : {}),
  };

  return (
    <div style={containerStyle}>
      {iconLeft && <span style={{ ...styles.icon, ...(multiline ? { marginTop: 4 } : {}) }}>{iconLeft}</span>}

      {multiline ? (
        <AutoGrowTextarea
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          maxLength={maxLength}
        />
      ) : (
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
      )}

      {iconRight && <span style={styles.icon}>{iconRight}</span>}
    </div>
  );
}
