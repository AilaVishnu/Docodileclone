import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import { colors } from "../../styles/theme";
import { Icon } from "../Icon";
import { FloatingBar, FloatingBarButton, FloatingBarDivider } from "../FloatingBar";
import { BoardItem } from "../BoardItem";
import { StickyNote } from "../StickyNote";
import {
  HoursWidget,
  QueueWidget,
  StatsWidget,
  QuickActionsWidget,
  Sticker,
  type TodayStats,
  type QueueEntry,
} from "./widgets";
import { styles } from "./Pinboard.styles";

// ─────────────────────────────────────────────────────────────────────────────
// Pinboard — a free-drag canvas that hosts sticky notes AND functional widgets
// (calendar, queue, today's stats, quick actions) plus decorative stickers.
//
// Generalises MemoBoard from a notes-only board to a heterogeneous one: every
// object is a positioned, draggable, z-ordered BoardItem. Layout persists per
// account (localStorage key derived from the auth token).
// ─────────────────────────────────────────────────────────────────────────────

export type PinboardItemType =
  | "sticky"
  | "calendar"
  | "queue"
  | "stats"
  | "quickActions"
  | "sticker";

type StickyData = {
  title: string;
  text: string;
  color: string;
  pinColor: string;
  torn: boolean;
  createdAt: string;
};

type StickerData = {
  variant: "icon" | "tape";
  name?: string;
  color?: string;
  size?: number;
};

export type PinboardItem = {
  id: string;
  type: PinboardItemType;
  x: number;
  y: number;
  z: number;
  w: number;
  h: number;
  rotation?: number;
  sticky?: StickyData;
  sticker?: StickerData;
};

export type PinboardProps = {
  /** Items used when storage is empty (or always, when persist is false). */
  seed?: PinboardItem[];
  /** Override the per-account storage key (mainly for tests/stories). */
  storageKey?: string;
  /** Persist layout to localStorage. Off → in-memory only (stories). */
  persist?: boolean;
  /** Live data fed to the stats + calendar widgets. */
  stats?: TodayStats;
  /** Live data fed to the queue widget. */
  queue?: { entries?: QueueEntry[]; moreWaiting?: number };
  /** Quick-action launcher. */
  onAction?: (key: string) => void;
  style?: React.CSSProperties;
};

const NOTE_COLORS = ["#EAE5FA", "#E3EEEF", "#CFEED5", "#FFE1F3", colors.neutral100];

const DEFAULT_SIZES: Record<PinboardItemType, [number, number]> = {
  sticky: [156, 152],
  calendar: [224, 192],
  queue: [200, 150],
  stats: [200, 150],
  quickActions: [196, 130],
  sticker: [48, 48],
};

const ADD_OPTIONS: Array<{ type: PinboardItemType; label: string; icon: string }> = [
  { type: "sticky", label: "Sticky note", icon: "pen" },
  { type: "calendar", label: "Calendar", icon: "calendar" },
  { type: "queue", label: "Queue", icon: "appointments" },
  { type: "stats", label: "Today's stats", icon: "visits" },
  { type: "quickActions", label: "Quick actions", icon: "grid" },
  { type: "sticker", label: "Sticker", icon: "star" },
];

const EMPTY_STATS: TodayStats = { totalAppointments: 0, newPatients: 0, reviews: 0, procedures: 0 };

function uid(): string {
  return Math.random().toString(36).slice(2, 10);
}
function randomRotation(): number {
  return Math.round((Math.random() * 8 - 4) * 10) / 10;
}
function clamp(n: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, n));
}
function formatStamp(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString("en-GB", { day: "2-digit", month: "short" });
  } catch {
    return "";
  }
}

function deriveStorageKey(override?: string): string {
  if (override) return override;
  let userId = "me";
  try {
    const token = localStorage.getItem("docodile_token");
    if (token) {
      const payload = JSON.parse(atob(token.split(".")[1] || ""));
      userId = payload.sub || payload.userId || payload.email || "me";
    }
  } catch {
    /* fall back to "me" */
  }
  return `docodile_board_${userId}`;
}

function loadItems(key: string, seed: PinboardItem[], persist: boolean): PinboardItem[] {
  if (!persist) return seed;
  try {
    const raw = localStorage.getItem(key);
    if (raw) {
      const arr = JSON.parse(raw) as PinboardItem[];
      if (Array.isArray(arr)) return arr;
    }
  } catch {
    /* fall through to seed */
  }
  return seed;
}

export function Pinboard({
  seed = [],
  storageKey,
  persist = true,
  stats,
  queue,
  onAction,
  style,
}: PinboardProps) {
  const keyRef = useRef<string>(deriveStorageKey(storageKey));
  const [items, setItems] = useState<PinboardItem[]>(() => loadItems(keyRef.current, seed, persist));
  const [editing, setEditing] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [bounds, setBounds] = useState({ width: 0, height: 0 });
  const boardRef = useRef<HTMLDivElement>(null);
  const addWrapRef = useRef<HTMLDivElement>(null);

  // Close the add-palette when clicking anywhere outside it.
  useEffect(() => {
    if (!menuOpen) return;
    const onDown = (e: PointerEvent) => {
      if (addWrapRef.current && !addWrapRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("pointerdown", onDown);
    return () => document.removeEventListener("pointerdown", onDown);
  }, [menuOpen]);

  // Track the board's layout box so item positions clamp inside it.
  useLayoutEffect(() => {
    const el = boardRef.current;
    if (!el) return;
    const measure = () => setBounds({ width: el.clientWidth, height: el.clientHeight });
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Persist on change.
  useEffect(() => {
    if (!persist) return;
    try {
      localStorage.setItem(keyRef.current, JSON.stringify(items));
    } catch {
      /* storage full / unavailable — keep in-memory state */
    }
  }, [items, persist]);

  const maxZ = () => items.reduce((m, n) => Math.max(m, n.z), 0);

  const bringToFront = (id: string) => {
    setItems((prev) => {
      const top = prev.reduce((m, n) => Math.max(m, n.z), 0) + 1;
      return prev.map((it) => (it.id === id ? { ...it, z: top } : it));
    });
  };

  const moveItem = (id: string, x: number, y: number) => {
    setItems((prev) => prev.map((it) => (it.id === id ? { ...it, x, y } : it)));
  };

  const removeItem = (id: string) => {
    setItems((prev) => prev.filter((it) => it.id !== id));
  };

  const patchSticky = (id: string, patch: Partial<StickyData>) => {
    setItems((prev) =>
      prev.map((it) =>
        it.id === id && it.sticky ? { ...it, sticky: { ...it.sticky, ...patch } } : it
      )
    );
  };

  const addItem = (type: PinboardItemType) => {
    setMenuOpen(false);
    const [w, h] = DEFAULT_SIZES[type];
    const bw = bounds.width || 600;
    const bh = bounds.height || 360;
    const idx = items.length;
    const next: PinboardItem = {
      id: uid(),
      type,
      w,
      h,
      z: maxZ() + 1,
      x: clamp(Math.round(bw / 2 - w / 2 + (Math.random() * 80 - 40)), 8, Math.max(8, bw - w - 8)),
      y: clamp(40 + Math.round(Math.random() * 40), 8, Math.max(8, bh - h - 8)),
      rotation: type === "sticky" || type === "sticker" ? randomRotation() : 0,
    };
    if (type === "sticky") {
      next.sticky = {
        title: "",
        text: "",
        color: NOTE_COLORS[idx % NOTE_COLORS.length],
        pinColor: colors.primary400,
        torn: Math.random() < 0.4,
        createdAt: new Date().toISOString(),
      };
    } else if (type === "sticker") {
      next.sticker = { variant: "icon", name: "star", color: colors.yellow200, size: 36 };
    }
    setItems((prev) => [...prev, next]);
    if (type === "sticky") {
      setTimeout(() => document.getElementById(`pin-note-${next.id}`)?.focus(), 0);
    }
  };

  const renderContent = (item: PinboardItem) => {
    switch (item.type) {
      case "sticky": {
        const s = item.sticky!;
        return (
          <StickyNote
            color={s.color}
            pinColor={s.pinColor}
            torn={s.torn}
            dateStamp={formatStamp(s.createdAt)}
            title={s.title}
            text={s.text}
            textId={`pin-note-${item.id}`}
            onTitleChange={(v) => patchSticky(item.id, { title: v })}
            onTextChange={(v) => patchSticky(item.id, { text: v })}
          />
        );
      }
      case "calendar":
        return <HoursWidget variant="agenda" />;
      case "queue":
        return <QueueWidget entries={queue?.entries} moreWaiting={queue?.moreWaiting} />;
      case "stats":
        return <StatsWidget stats={stats ?? EMPTY_STATS} variant="spotlight" />;
      case "quickActions":
        return <QuickActionsWidget onAction={onAction} />;
      case "sticker": {
        const k = item.sticker ?? { variant: "icon" as const };
        return (
          <Sticker variant={k.variant} name={k.name} color={k.color} size={k.size} />
        );
      }
      default:
        return null;
    }
  };

  const ordered = [...items].sort((a, b) => a.z - b.z);

  return (
    <div style={{ ...styles.wrapper, ...style }}>
      <div ref={boardRef} style={styles.board}>
        {ordered.length === 0 && (
          <div style={styles.empty}>
            {editing ? "Add notes, widgets and stickers with the Add button." : "Your board is empty."}
          </div>
        )}

        {ordered.map((item) => (
          <BoardItem
            key={item.id}
            x={item.x}
            y={item.y}
            z={item.z}
            width={item.w}
            height={item.h}
            autoHeight={item.type === "sticky"}
            rotation={item.rotation}
            bounds={bounds}
            removable={editing}
            onChange={(p) => moveItem(item.id, p.x, p.y)}
            onFocus={() => bringToFront(item.id)}
            onRemove={() => removeItem(item.id)}
          >
            {renderContent(item)}
          </BoardItem>
        ))}

        <FloatingBar position="fixed">
          <div ref={addWrapRef} style={styles.addWrap}>
            <FloatingBarButton
              iconName="plus"
              label="Add"
              variant="primary"
              active={menuOpen}
              onClick={() => setMenuOpen((o) => !o)}
            />
            {menuOpen && (
              <div style={styles.menu} role="menu">
                {ADD_OPTIONS.map((o) => (
                  <button
                    key={o.type}
                    style={styles.menuItem}
                    onClick={() => addItem(o.type)}
                    role="menuitem"
                  >
                    <Icon name={o.icon} size={16} tone="muted" />
                    {o.label}
                  </button>
                ))}
              </div>
            )}
          </div>
          <FloatingBarDivider />
          <FloatingBarButton
            iconName={editing ? "check" : "edit-pencil"}
            label={editing ? "Done" : "Edit"}
            active={editing}
            onClick={() => {
              setEditing((e) => !e);
              setMenuOpen(false);
            }}
          />
        </FloatingBar>
      </div>
    </div>
  );
}
