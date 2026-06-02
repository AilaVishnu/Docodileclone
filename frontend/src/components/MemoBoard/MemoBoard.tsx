import React, { useEffect, useRef, useState } from "react";
import { colors, fonts, radii, spacing } from "../../styles/theme";
import { Toast } from "../Toast";

// ─────────────────────────────────────────────────────────────────────────────
// MemoBoard — free-floating sticky notes on a dotted board.
//
// Storage: localStorage key "docodile_memo_board".
// Migrates from legacy "docodile_sticky_notes" (string[]) on first load.
// ─────────────────────────────────────────────────────────────────────────────

type Memo = {
  id: string;
  title: string;
  text: string;
  color: string;
  pinColor?: string; // pushpin accent color
  torn?: boolean;    // if true, render irregular torn bottom edge
  rotation: number; // degrees, -4..+4
  x: number; // px from board left
  y: number; // px from board top
  z: number; // stacking order — higher = on top
  pinned: boolean;
  createdAt: string; // ISO
};

const STORAGE_KEY = "docodile_memo_board";
const LEGACY_KEY = "docodile_sticky_notes";
const BOARD_HEIGHT = 360;
const NOTE_W = 156;
const NOTE_H = 152;

// One-time keyframes for hover lift + entrance animation
const STYLE_ID = "docodile-memo-keyframes";
function ensureMemoKeyframes() {
  if (typeof document === "undefined") return;
  if (document.getElementById(STYLE_ID)) return;
  const style = document.createElement("style");
  style.id = STYLE_ID;
  style.innerHTML = `
    .docodile-memo:hover {
      transform: translateY(-2px) rotate(var(--rot, 0deg)) !important;
    }
    .docodile-memo {
      transition: transform 0.18s ease !important;
    }
  `;
  document.head.appendChild(style);
}

const COLORS = [
  "#EAE5FA", // purple
  "#E3EEEF", // blue
  "#CFEED5", // green
  "#FFE1F3", // pink
] as const;

// Pushpin colors cycle independently of note color so the same color combos
// don't always pair up. Uses the existing accent palette from theme.
const PIN_COLORS = [
  colors.red100,
  colors.yellow200,
  colors.green200,
  colors.primary600,
] as const;

const FOLD_CUT = 14; // size of the folded-corner cut in px

/** Darken a hex color by `factor` (0..1). 0.78 = ~22% darker. */
function darken(hex: string, factor = 0.78): string {
  const m = /^#?([0-9a-f]{6})$/i.exec(hex.trim());
  if (!m) return hex;
  const num = parseInt(m[1], 16);
  const r = Math.round(((num >> 16) & 0xff) * factor);
  const g = Math.round(((num >> 8) & 0xff) * factor);
  const b = Math.round((num & 0xff) * factor);
  return `#${[r, g, b].map((c) => c.toString(16).padStart(2, "0")).join("")}`;
}

// ─── Utilities ────────────────────────────────────────────────────────────────

function uid(): string {
  return Math.random().toString(36).slice(2, 10);
}

function randomRotation(): number {
  return Math.round((Math.random() * 8 - 4) * 10) / 10; // -4.0 .. +4.0
}

function pickPin(idx: number): string {
  return PIN_COLORS[idx % PIN_COLORS.length];
}

/**
 * Clip path for the note face.
 *
 * - Non-torn: cuts the bottom-right corner (folded-corner look).
 * - Torn:    irregular ripped bottom edge; no folded corner. Shape derived
 *            from a designer-provided SVG (254×284 viewBox), points expressed
 *            as percentages so the path scales with any note size.
 */
function noteClipPath(torn: boolean): string {
  if (!torn) {
    return `polygon(0 0, 100% 0, 100% calc(100% - ${FOLD_CUT}px), calc(100% - ${FOLD_CUT}px) 100%, 0 100%)`;
  }
  // Going clockwise from top-left → top-right → right side → tear (right→left) → left side.
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

function todayIso(): string {
  return new Date().toISOString();
}

function formatStamp(iso: string): string {
  try {
    const d = new Date(iso);
    return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short" });
  } catch {
    return "";
  }
}

function pickColor(idx: number): string {
  return COLORS[idx % COLORS.length];
}

function loadMemos(): Memo[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const arr = JSON.parse(raw) as Memo[];
      if (Array.isArray(arr)) return arr;
    }
    // One-time migration from legacy string[]
    const legacy = localStorage.getItem(LEGACY_KEY);
    if (legacy) {
      const strings = JSON.parse(legacy) as string[];
      if (Array.isArray(strings)) {
        return strings
          .map((s, i): Memo | null => {
            if (typeof s !== "string") return null;
            return {
              id: uid(),
              title: "",
              text: s,
              color: pickColor(i),
              pinColor: pickPin(i),
              torn: Math.random() < 0.4,
              rotation: randomRotation(),
              x: 24 + (i % 3) * (NOTE_W + 24),
              y: 24 + Math.floor(i / 3) * (NOTE_H + 24),
              z: i + 1,
              pinned: false,
              createdAt: todayIso(),
            };
          })
          .filter(Boolean) as Memo[];
      }
    }
  } catch {
    /* fall through */
  }
  return seedDefault();
}

function seedDefault(): Memo[] {
  return [];
}

function saveMemos(memos: Memo[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(memos));
}

// ─── Component ────────────────────────────────────────────────────────────────

export function MemoBoard() {
  const [memos, setMemos] = useState<Memo[]>(() => loadMemos());
  const [dragging, setDragging] = useState<{ id: string; offX: number; offY: number } | null>(null);
  const [recentlyDeleted, setRecentlyDeleted] = useState<Memo | null>(null);
  const boardRef = useRef<HTMLDivElement>(null);
  const undoTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // One-time keyframe injection
  useEffect(() => {
    ensureMemoKeyframes();
  }, []);

  // Persist on every change
  useEffect(() => {
    saveMemos(memos);
  }, [memos]);

  // Drag move + release handlers attached to window
  useEffect(() => {
    if (!dragging) return;
    const onMove = (e: MouseEvent) => {
      const rect = boardRef.current?.getBoundingClientRect();
      if (!rect) return;
      const x = clamp(e.clientX - rect.left - dragging.offX, 0, rect.width - NOTE_W);
      const y = clamp(e.clientY - rect.top - dragging.offY, 0, rect.height - NOTE_H);
      setMemos((prev) => prev.map((m) => (m.id === dragging.id ? { ...m, x, y } : m)));
    };
    const onUp = () => setDragging(null);
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
  }, [dragging]);

  const bringToFront = (id: string) => {
    setMemos((prev) => {
      const maxZ = prev.reduce((m, n) => Math.max(m, n.z), 0);
      return prev.map((m) => (m.id === id ? { ...m, z: maxZ + 1 } : m));
    });
  };

  const handleDragStart = (memo: Memo, e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest("[data-no-drag]")) return;
    const noteEl = e.currentTarget as HTMLElement;
    const noteRect = noteEl.getBoundingClientRect();
    bringToFront(memo.id);
    setDragging({
      id: memo.id,
      offX: e.clientX - noteRect.left,
      offY: e.clientY - noteRect.top,
    });
  };

  const handleAdd = () => {
    const rect = boardRef.current?.getBoundingClientRect();
    const w = rect?.width ?? 600;
    const idx = memos.length;
    const maxZ = memos.reduce((m, n) => Math.max(m, n.z), 0);
    const next: Memo = {
      id: uid(),
      title: "",
      text: "",
      color: pickColor(idx),
      pinColor: pickPin(idx),
      torn: Math.random() < 0.4,
      rotation: randomRotation(),
      // Place near top-center, offset so notes don't perfectly stack
      x: clamp(Math.round(w / 2 - NOTE_W / 2 + (Math.random() * 80 - 40)), 8, Math.max(8, w - NOTE_W - 8)),
      y: clamp(40 + Math.round(Math.random() * 40), 8, BOARD_HEIGHT - NOTE_H - 8),
      z: maxZ + 1,
      pinned: false,
      createdAt: todayIso(),
    };
    setMemos((prev) => [...prev, next]);
    // Focus the new note's body on next paint
    setTimeout(() => {
      document.getElementById(`memo-text-${next.id}`)?.focus();
    }, 0);
  };

  const handleDelete = (memo: Memo) => {
    setMemos((prev) => prev.filter((m) => m.id !== memo.id));
    setRecentlyDeleted(memo);
    if (undoTimer.current) clearTimeout(undoTimer.current);
    undoTimer.current = setTimeout(() => setRecentlyDeleted(null), 5000);
  };

  const handleUndo = () => {
    if (!recentlyDeleted) return;
    setMemos((prev) => [...prev, recentlyDeleted]);
    setRecentlyDeleted(null);
    if (undoTimer.current) clearTimeout(undoTimer.current);
  };

  const updateMemo = (id: string, patch: Partial<Memo>) => {
    setMemos((prev) => prev.map((m) => (m.id === id ? { ...m, ...patch } : m)));
  };

  // Render order: by z (bring-to-front on drag)
  const ordered = [...memos].sort((a, b) => a.z - b.z);

  return (
    <div style={styles.wrapper}>
      <div ref={boardRef} style={styles.board}>
        {/* Nail heads — one in each corner of the frame */}
        <span style={{ ...styles.nail, top: "-3px", left: "-3px" }} />
        <span style={{ ...styles.nail, top: "-3px", right: "-3px" }} />
        <span style={{ ...styles.nail, bottom: "-3px", left: "-3px" }} />
        <span style={{ ...styles.nail, bottom: "-3px", right: "-3px" }} />

        <button onClick={handleAdd} style={styles.fab} aria-label="Add a memo" title="Add a memo">
          <span style={styles.fabPlus}>+</span>
        </button>

        {ordered.map((m) => {
          const pinColor = m.pinColor || PIN_COLORS[0];
          const fold = darken(m.color);
          return (
            <div
              key={m.id}
              className="docodile-memo"
              onMouseDown={(e) => handleDragStart(m, e)}
              style={{
                ...styles.noteWrap,
                left: `${m.x}px`,
                top: `${m.y}px`,
                transform: `rotate(${m.rotation}deg)`,
                zIndex: m.z,
                cursor: dragging?.id === m.id ? "grabbing" : "grab",
                ["--rot" as any]: `${m.rotation}deg`,
              }}
            >
              {/* Backsheet — visible only through the folded-corner cut.
                  Torn notes don't have a fold, so we skip it (cork shows through the tear instead). */}
              {!m.torn && <div style={{ ...styles.foldBack, backgroundColor: fold }} />}

              {/* Note face (clipped to cut bottom-right corner; optionally torn) */}
              <div
                style={{
                  ...styles.noteFace,
                  backgroundColor: m.color,
                  clipPath: noteClipPath(!!m.torn),
                }}
              >
                <div style={styles.noteHeader}>
                  <span style={styles.dateStamp}>{formatStamp(m.createdAt)}</span>
                  <button
                    data-no-drag
                    onClick={() => handleDelete(m)}
                    style={{ ...styles.iconBtn, color: colors.neutral500 }}
                    title="Delete"
                  >
                    ✕
                  </button>
                </div>

                <input
                  data-no-drag
                  value={m.title}
                  onChange={(e) => updateMemo(m.id, { title: e.target.value })}
                  placeholder="Title…"
                  style={styles.titleInput}
                />

                <textarea
                  id={`memo-text-${m.id}`}
                  data-no-drag
                  value={m.text}
                  onChange={(e) => updateMemo(m.id, { text: e.target.value })}
                  placeholder="Type your thoughts…"
                  style={styles.textArea}
                />
              </div>

              {/* Pushpin — sits on top of the note, anchored to the cork */}
              <span style={{ ...styles.pushpin, backgroundColor: pinColor }} />
            </div>
          );
        })}
      </div>

      <Toast
        message="Memo deleted"
        isVisible={!!recentlyDeleted}
        onClose={() => setRecentlyDeleted(null)}
        actionLabel="Undo"
        onAction={handleUndo}
      />
    </div>
  );
}

function clamp(n: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, n));
}

// ─── Styles ────────────────────────────────────────────────────────────────────

const styles: Record<string, React.CSSProperties> = {
  wrapper: {
    width: "100%",
    display: "flex",
    flexDirection: "column",
    gap: spacing.s,
  },
  fab: {
    position: "absolute",
    bottom: "12px",
    right: "12px",
    width: "44px",
    height: "44px",
    borderRadius: "50%",
    backgroundColor: colors.primary600,
    color: colors.neutral100,
    border: "none",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 50,
    transition: "background-color 0.15s, transform 0.05s",
  },
  fabPlus: {
    fontSize: "26px",
    fontWeight: 300,
    lineHeight: 1,
    color: colors.neutral100,
    marginTop: "-2px",
  },

  board: {
    position: "relative",
    width: "100%",
    height: `${BOARD_HEIGHT}px`,
    borderRadius: radii.l,
    border: `8px solid ${colors.primary400}`,
    backgroundColor: colors.neutral100,
    backgroundImage: `radial-gradient(${colors.neutral300} 1px, transparent 1px)`,
    backgroundSize: "16px 16px",
    backgroundPosition: "8px 8px",
  },
  nail: {
    position: "absolute",
    width: "10px",
    height: "10px",
    borderRadius: "50%",
    backgroundColor: colors.primary600,
    zIndex: 60,
    pointerEvents: "none",
  },

  // Wrapper that holds the layered note (fold + face + pin)
  noteWrap: {
    position: "absolute",
    width: `${NOTE_W}px`,
    height: `${NOTE_H}px`,
    userSelect: "none",
  },

  // Backsheet showing through the folded-corner cut. Same shape as the note,
  // sits behind the face. Only visible where the face is clipped.
  foldBack: {
    position: "absolute",
    inset: 0,
    borderRadius: radii.s,
  },

  // Note face — solid color, clipped per-memo (corner cut + optional tear).
  noteFace: {
    position: "absolute",
    inset: 0,
    borderRadius: radii.s,
    padding: "10px 12px 14px",
    display: "flex",
    flexDirection: "column",
  },

  // Pushpin head — small flat circle sitting on top of the note.
  pushpin: {
    position: "absolute",
    top: "-4px",
    left: "50%",
    width: "12px",
    height: "12px",
    borderRadius: "50%",
    transform: "translateX(-50%)",
    zIndex: 5,
    pointerEvents: "none",
  },

  noteHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "2px",
    height: "20px",
  },
  iconBtn: {
    background: "none",
    border: "none",
    fontSize: "14px",
    cursor: "pointer",
    padding: "2px 4px",
    lineHeight: 1,
  },

  titleInput: {
    background: "transparent",
    border: "none",
    borderBottom: `1px solid rgba(0,0,0,0.18)`,
    fontFamily: fonts.family.secondary,
    fontStyle: "italic",
    fontSize: fonts.control.sm,
    color: colors.neutral900,
    outline: "none",
    padding: "2px 0",
    marginBottom: "6px",
  },
  textArea: {
    flex: 1,
    background: "transparent",
    border: "none",
    resize: "none",
    outline: "none",
    fontFamily: fonts.family.primary,
    fontSize: fonts.size.s,
    color: colors.neutral900,
    lineHeight: 1.4,
  },
  dateStamp: {
    fontFamily: fonts.family.secondary,
    fontStyle: "italic",
    fontSize: fonts.size.caption,
    color: "rgba(0,0,0,0.45)",
  },
};
