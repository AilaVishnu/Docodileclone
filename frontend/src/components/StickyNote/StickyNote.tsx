import React from "react";
import { styles } from "./StickyNote.styles";

// ─────────────────────────────────────────────────────────────────────────────
// StickyNote — the paper note visual (fold/tear + pushpin + editable text).
//
// Presentational only: it fills its positioned parent. Positioning, rotation,
// drag and z-order are the board's responsibility (see BoardItem / Pinboard).
// Extracted from MemoBoard so the note can be reused and catalogued on its own.
// ─────────────────────────────────────────────────────────────────────────────

export type StickyNoteProps = {
  /** Note body text. */
  text: string;
  /** Optional title (rendered as an italic underline field). */
  title?: string;
  /** Paper colour (hex). */
  color: string;
  /** Pushpin accent colour (hex). */
  pinColor?: string;
  /** Render an irregular torn bottom edge instead of a folded corner. */
  torn?: boolean;
  /** Short date stamp shown top-left (already formatted). */
  dateStamp?: string;
  /** When set, text/title are read-only and the delete control is hidden. */
  readOnly?: boolean;
  onTitleChange?: (value: string) => void;
  onTextChange?: (value: string) => void;
  onDelete?: () => void;
  /** id for the textarea, so callers can focus a freshly-added note. */
  textId?: string;
  style?: React.CSSProperties;
};

const FOLD_CUT = 14; // size of the folded-corner cut, in px

/** Darken a hex colour by `factor` (0..1). 0.78 ≈ 22% darker. */
function darken(hex: string, factor = 0.78): string {
  const m = /^#?([0-9a-f]{6})$/i.exec(hex.trim());
  if (!m) return hex;
  const num = parseInt(m[1], 16);
  const r = Math.round(((num >> 16) & 0xff) * factor);
  const g = Math.round(((num >> 8) & 0xff) * factor);
  const b = Math.round((num & 0xff) * factor);
  return `#${[r, g, b].map((c) => c.toString(16).padStart(2, "0")).join("")}`;
}

/**
 * Clip path for the note face.
 * - Non-torn: cuts the bottom-right corner (folded-corner look).
 * - Torn:     irregular ripped bottom edge; no folded corner. Shape derived
 *             from a designer SVG, points as percentages so it scales freely.
 */
function noteClipPath(torn: boolean): string {
  if (!torn) {
    return `polygon(0 0, 100% 0, 100% calc(100% - ${FOLD_CUT}px), calc(100% - ${FOLD_CUT}px) 100%, 0 100%)`;
  }
  return [
    "polygon(",
    "0 0, 100% 0,",
    "100% 96.80%,",
    "85.77% 92.33%, 74.33% 95.94%, 66.42% 94.13%,",
    "40.31% 99.90%, 25.51% 93.29%, 16.23% 98.00%, 8.02% 93.29%,",
    "0 96.80%",
    ")",
  ].join(" ");
}

export function StickyNote({
  text,
  title = "",
  color,
  pinColor,
  torn = false,
  dateStamp,
  readOnly = false,
  onTitleChange,
  onTextChange,
  onDelete,
  textId,
  style,
}: StickyNoteProps) {
  const fold = darken(color);
  return (
    <div style={{ ...styles.root, ...style }}>
      {/* Backsheet — visible only through the folded-corner cut. Torn notes
          have no fold, so the cork shows through the tear instead. */}
      {!torn && <div style={{ ...styles.foldBack, backgroundColor: fold }} />}

      <div
        style={{
          ...styles.face,
          backgroundColor: color,
          clipPath: noteClipPath(torn),
        }}
      >
        <div style={styles.header}>
          <span style={styles.dateStamp}>{dateStamp}</span>
          {!readOnly && onDelete && (
            <button
              data-no-drag
              onClick={onDelete}
              style={styles.iconBtn}
              title="Delete"
              aria-label="Delete note"
            >
              ✕
            </button>
          )}
        </div>

        <input
          data-no-drag
          value={title}
          readOnly={readOnly}
          onChange={(e) => onTitleChange?.(e.target.value)}
          placeholder="Title…"
          style={styles.titleInput}
          aria-label="Note title"
        />

        <textarea
          id={textId}
          data-no-drag
          value={text}
          readOnly={readOnly}
          onChange={(e) => onTextChange?.(e.target.value)}
          placeholder="Type your thoughts…"
          style={styles.textArea}
          aria-label="Note text"
        />
      </div>

      {/* Pushpin — sits on top of the note, anchored to the cork. */}
      <span style={{ ...styles.pushpin, backgroundColor: pinColor }} />
    </div>
  );
}
