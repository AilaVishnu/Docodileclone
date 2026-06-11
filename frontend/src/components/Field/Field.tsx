import React, { useRef, useCallback, useEffect } from "react";
import { colors, fonts, radii, spacing, strokes } from "../../styles/theme";

// ─────────────────────────────────────────────────────────────────────────────
// Field — the one canonical text-input primitive. Three looks, assigned by
// context (decided 2026-06-11):
//   • "underline" — a line under the text (the default; = the old TextInput).
//   • "box"       — a bordered, filled rounded box (forms, modals).
//   • "pill"      — a fully-rounded box. SEARCH inputs only.
//
// Heights are RESPONSIVE via --input-h (40px → 32px on the 1200–1439 tier) and
// --input-pady (6 → 3), so every Field compacts together on smaller laptops.
// One invalid state everywhere: red200 border + a soft redAlpha10 fill.
// ─────────────────────────────────────────────────────────────────────────────
export type FieldVariant = "underline" | "box" | "pill";

type FieldProps = {
  value: string;
  onChange: (value: string) => void;
  variant?: FieldVariant;
  placeholder?: string;
  iconLeft?: React.ReactNode;
  iconRight?: React.ReactNode;
  type?: "text" | "password" | "email" | "tel" | "number" | "search";
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  onBlur?: (e?: React.FocusEvent<HTMLInputElement>) => void;
  onFocus?: (e?: React.FocusEvent<HTMLInputElement>) => void;
  error?: boolean;
  errorMessage?: string;
  maxLength?: number;
  multiline?: boolean;
  disabled?: boolean;
  inputMode?: React.HTMLAttributes<HTMLInputElement>["inputMode"];
  name?: string;
  autoFocus?: boolean;
  ariaLabel?: string;
  /** Override the outer container. */
  style?: React.CSSProperties;
  /** Override the inner input/textarea. */
  inputStyle?: React.CSSProperties;
};

const inputBase: React.CSSProperties = {
  flex: 1,
  minWidth: 0,
  border: "none",
  outline: "none",
  backgroundColor: "transparent",
  fontFamily: fonts.family.primary,
  fontSize: fonts.size.m,
  color: colors.neutral900,
};

const containerBase: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: spacing.xs,
  width: "100%",
  boxSizing: "border-box",
};

const variantStyles: Record<FieldVariant, { container: React.CSSProperties; error: React.CSSProperties }> = {
  underline: {
    container: {
      // Vertical padding is var-driven so the row compacts at 1200–1439.
      padding: "var(--input-pady, 6px) 8px",
      borderBottom: `${strokes.xs} solid ${colors.neutral300}`,
    },
    error: {
      borderBottom: `${strokes.xs} solid ${colors.red200}`,
      backgroundColor: colors.redAlpha10,
    },
  },
  box: {
    container: {
      height: "var(--input-h, 40px)",
      padding: `0 ${spacing.s}`,
      border: `${strokes.xs} solid ${colors.neutral300}`,
      borderRadius: radii.m,
      backgroundColor: colors.neutral150,
    },
    error: {
      border: `${strokes.xs} solid ${colors.red200}`,
      backgroundColor: colors.redAlpha10,
    },
  },
  pill: {
    container: {
      height: "var(--input-h, 40px)",
      padding: `0 ${spacing.l}`,
      border: `${strokes.xs} solid ${colors.primary300}`,
      borderRadius: radii.full,
      backgroundColor: colors.neutral100,
    },
    error: {
      border: `${strokes.xs} solid ${colors.red200}`,
      backgroundColor: colors.redAlpha10,
    },
  },
};

function AutoGrowTextarea({ value, onChange, placeholder, maxLength, disabled, inputStyle }: {
  value: string; onChange: (v: string) => void; placeholder?: string; maxLength?: number;
  disabled?: boolean; inputStyle?: React.CSSProperties;
}) {
  const ref = useRef<HTMLTextAreaElement>(null);
  const maxHeight = 80; // ~4 lines

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
      disabled={disabled}
      rows={1}
      className="text-input-field"
      style={{ ...inputBase, resize: "none", overflow: "hidden", lineHeight: 1.6, ...inputStyle }}
    />
  );
}

export function Field({
  value, onChange, variant = "underline", placeholder, iconLeft, iconRight,
  type = "text", onKeyDown, onBlur, onFocus, error, errorMessage, maxLength,
  multiline, disabled, inputMode, name, autoFocus, ariaLabel, style, inputStyle,
}: FieldProps) {
  const v = variantStyles[variant];
  const containerStyle: React.CSSProperties = {
    ...containerBase,
    ...v.container,
    // multiline drops the fixed height so the textarea can grow.
    ...(multiline ? { height: undefined, alignItems: "flex-start" } : {}),
    ...(error ? v.error : {}),
    ...(disabled ? { opacity: 0.6 } : {}),
    ...style,
  };

  return (
    <div style={{ width: "100%" }}>
      <div style={containerStyle}>
        {iconLeft && <span style={{ fontSize: fonts.size.m, lineHeight: 1, color: colors.neutral900, opacity: 0.8, ...(multiline ? { marginTop: 4 } : {}) }}>{iconLeft}</span>}

        {multiline ? (
          <AutoGrowTextarea value={value} onChange={onChange} placeholder={placeholder} maxLength={maxLength} disabled={disabled} inputStyle={inputStyle} />
        ) : (
          <input
            type={type}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={onKeyDown}
            onBlur={onBlur}
            onFocus={onFocus}
            placeholder={placeholder}
            maxLength={maxLength}
            disabled={disabled}
            inputMode={inputMode}
            name={name}
            autoFocus={autoFocus}
            aria-label={ariaLabel}
            className="text-input-field"
            style={{ ...inputBase, ...inputStyle }}
          />
        )}

        {iconRight && <span style={{ fontSize: fonts.size.m, lineHeight: 1, color: colors.neutral900, opacity: 0.8 }}>{iconRight}</span>}
      </div>
      {error && errorMessage && (
        <div style={{ color: colors.red200, fontSize: fonts.size.xs, fontFamily: fonts.family.primary, marginTop: 2, marginLeft: 4 }}>
          {errorMessage}
        </div>
      )}
    </div>
  );
}
