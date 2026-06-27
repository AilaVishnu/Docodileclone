import React, { useEffect, useState, useRef } from "react";
import { styles } from "./DomainInput.styles";
import { colors, fonts } from "../../../styles/theme";
import { API_BASE_URL } from "../../../apiConfig";

type DomainInputProps = {
  value: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  suffix?: string;
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  disabled?: boolean;
  /** Display-only (e.g. on a ClinicCard): the input bg goes transparent and
   *  the availability check is skipped. */
  readOnly?: boolean;
};

export function DomainInput({
  value,
  onChange,
  placeholder = "your-clinic-domain",
  suffix = ".docodile.app",
  onKeyDown,
  disabled = false,
  readOnly = false,
}: DomainInputProps) {
  const [availability, setAvailability] = useState<"idle" | "checking" | "available" | "taken">("idle");
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!value || value.trim().length < 2 || disabled || readOnly) {
      setAvailability("idle");
      return;
    }

    setAvailability("checking");

    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(async () => {
      try {
        const res = await fetch(
          `${API_BASE_URL}/api/tenant/domain/check?domain=${encodeURIComponent(value.trim())}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("docodile_token")}`,
            },
          }
        );
        if (res.ok) {
          const data = await res.json();
          setAvailability(data.available ? "available" : "taken");
        } else {
          setAvailability("idle");
        }
      } catch {
        setAvailability("idle");
      }
    }, 500);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [value, disabled, readOnly]);

  const statusText =
    availability === "checking" ? "Checking..." :
    availability === "available" ? "Available" :
    availability === "taken" ? "Already taken" :
    null;

  const statusColor =
    availability === "available" ? colors.secondary700 :
    availability === "taken" ? colors.red200 :
    colors.neutral700;

  // "taken" is the invalid state — match the canonical Field error look:
  // red200 border + a soft redAlpha10 fill. "available" is a non-error accent
  // (secondary700 border only).
  const stateStyle: React.CSSProperties =
    availability === "taken"
      ? { borderColor: colors.red200, backgroundColor: colors.redAlpha10 }
      : availability === "available"
      ? { borderColor: colors.secondary700 }
      : {};

  return (
    <div>
      <div style={{
        ...styles.container,
        ...(disabled ? { opacity: 0.6, cursor: "not-allowed" } : {}),
        ...stateStyle,
      }}>
        <input
          type="text"
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          readOnly={readOnly}
          style={{
            ...styles.input,
            // editable → white input; read-only → transparent (shows the card).
            backgroundColor: readOnly ? "transparent" : colors.neutral100,
            ...(disabled ? { cursor: "not-allowed" } : {}),
          }}
        />
        <div style={styles.suffix}>{suffix}</div>
      </div>
      {statusText && (
        <div style={{
          fontSize: fonts.size.xs,
          fontFamily: fonts.family.primary,
          color: statusColor,
          marginTop: 4,
          marginLeft: 4,
        }}>
          {statusText}
        </div>
      )}
    </div>
  );
}
