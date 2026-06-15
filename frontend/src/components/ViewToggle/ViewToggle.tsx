import React from "react";
import { Icon } from "../Icon";
import { styles } from "./ViewToggle.styles";

export type ViewMode = "list" | "grid";

type ViewToggleProps = {
  value: ViewMode;
  onChange: (mode: ViewMode) => void;
  /** Icon size. Default 24. */
  size?: number;
  /** Extra style for the track (e.g. `marginLeft: "auto"` to push it right). */
  style?: React.CSSProperties;
};

// ─────────────────────────────────────────────────────────────────────────────
// ViewToggle — the canonical list ⇄ grid view switch (a segmented control of
// two icon buttons). Replaces the hand-rolled toggles that diverged across the
// prescription queue, the patient Files tab, etc. Icons are neutral900 at the
// shared 1.5 stroke; the active view gets a white pill on the grey track.
// ─────────────────────────────────────────────────────────────────────────────
export function ViewToggle({ value, onChange, size = 24, style }: ViewToggleProps) {
  const renderBtn = (mode: ViewMode, icon: string, label: string) => (
    <button
      type="button"
      aria-label={label}
      aria-pressed={value === mode}
      onClick={() => onChange(mode)}
      style={{ ...styles.button, ...(value === mode ? styles.buttonActive : {}) }}
    >
      <Icon name={icon} size={size} tone="inherit" />
    </button>
  );
  return (
    <div role="group" aria-label="View mode" style={{ ...styles.track, ...style }}>
      {renderBtn("list", "list-sort", "List view")}
      {renderBtn("grid", "grid", "Grid view")}
    </div>
  );
}
