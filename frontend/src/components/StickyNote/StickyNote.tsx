import React, { useLayoutEffect, useRef } from "react";
import { colors } from "../../styles/theme";
import { styles } from "./StickyNote.styles";

// ─────────────────────────────────────────────────────────────────────────────
// StickyNote — the paper note visual (fold/tear + pushpin + editable text).
//
// Presentational: it fills its parent's width and grows in height with its copy
// (capped by maxLength). Positioning, rotation, drag and z-order belong to the
// board (see BoardItem / Pinboard).
// ─────────────────────────────────────────────────────────────────────────────

export type StickyNoteProps = {
  /** Note body text. */
  text: string;
  /** Optional title (rendered as an italic underline field). */
  title?: string;
  /** Paper colour (hex). */
  color: string;
  /** Pushpin accent colour. Defaults to the brand pin (primary400). */
  pinColor?: string;
  /** Render an irregular torn bottom edge instead of a folded corner. */
  torn?: boolean;
  /** Short date stamp shown at the bottom of the note (already formatted). */
  dateStamp?: string;
  /** When set, text/title are read-only and the delete control is hidden. */
  readOnly?: boolean;
  /** Max characters for the body — keeps a note from growing too tall. */
  maxLength?: number;
  onTitleChange?: (value: string) => void;
  onTextChange?: (value: string) => void;
  onDelete?: () => void;
  /** id for the textarea, so callers can focus a freshly-added note. */
  textId?: string;
  style?: React.CSSProperties;
};

const FOLD_CUT = 14; // size of the folded-corner cut, in px

/** Darken a hex colour by `factor` (0..1). 0.9 ≈ 10% darker (gentle on white). */
function darken(hex: string, factor = 0.88): string {
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
 * - Torn:     irregular ripped bottom edge; no folded corner. Percent-based so
 *             it scales as the note grows.
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
  pinColor = colors.primary400,
  torn = false,
  dateStamp,
  readOnly = false,
  maxLength = 160,
  onTitleChange,
  onTextChange,
  onDelete,
  textId,
  style,
}: StickyNoteProps) {
  const taRef = useRef<HTMLTextAreaElement>(null);
  const fold = darken(color);

  // Grow the textarea to fit its copy (so the whole note expands vertically).
  useLayoutEffect(() => {
    const ta = taRef.current;
    if (!ta) return;
    ta.style.height = "auto";
    ta.style.height = `${ta.scrollHeight}px`;
  }, [text]);

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
        {!readOnly && onDelete && (
          <button
            data-no-drag
            onClick={onDelete}
            style={styles.deleteBtn}
            title="Delete"
            aria-label="Delete note"
          >
            ✕
          </button>
        )}

        <input
          data-no-drag
          value={title}
          readOnly={readOnly}
          maxLength={48}
          onChange={(e) => onTitleChange?.(e.target.value)}
          placeholder="Title…"
          style={styles.titleInput}
          aria-label="Note title"
        />

        <textarea
          ref={taRef}
          id={textId}
          data-no-drag
          rows={1}
          value={text}
          readOnly={readOnly}
          maxLength={maxLength}
          onChange={(e) => onTextChange?.(e.target.value)}
          placeholder="Type your thoughts…"
          style={styles.textArea}
          aria-label="Note text"
        />

        <span style={styles.dateStamp}>{dateStamp}</span>
      </div>

      {/* Pushpin — sits on top of the note, anchored to the cork. */}
      <span style={{ ...styles.pushpin, backgroundColor: pinColor }} />
    </div>
  );
}
