import React, { CSSProperties } from "react";
import { Icon } from "../Icon";
import { IconButton } from "../IconButton";
import { colors } from "../../styles/theme";
import { styles } from "./SearchField.styles";

export interface SearchFieldProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  /** Cap the width (default 320). A number is px; any CSS width string works. */
  maxWidth?: number | string;
  ariaLabel?: string;
  /** Merged into the pill wrapper. */
  style?: CSSProperties;
}

/**
 * Pill-shaped toolbar search — a leading magnifier, an input, and a clear (✕)
 * button that appears once there's text. The shared idiom previously inlined in
 * the Pharmacy / Services / Patient Files / Bills toolbars.
 */
export function SearchField({ value, onChange, placeholder = "Search…", maxWidth = 320, ariaLabel = "Search", style }: SearchFieldProps) {
  return (
    <div style={{ ...styles.wrap, maxWidth, ...style }}>
      <Icon name="search" size={18} tone="inherit" style={styles.icon} />
      <input
        type="text"
        aria-label={ariaLabel}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={styles.input}
      />
      {value && <IconButton ariaLabel="Clear search" size={20} color={colors.neutral500} onClick={() => onChange("")} />}
    </div>
  );
}
