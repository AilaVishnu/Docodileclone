import React, { useEffect, useMemo, useState } from "react";
import { colors } from "../../styles/theme";
import { Pinboard, type PinboardItem } from "../../components/Pinboard";
import { API_BASE_URL } from "../../apiConfig";

// ─── Stats (fetched from today's appointment queue) ───────────────────────────

const EMPTY_STATS = { totalAppointments: 0, newPatients: 0, reviews: 0, procedures: 0 };
const NON_PROCEDURE_SERVICES = new Set(["Consultation", ""]);

function useTodayStats() {
  const [stats, setStats] = useState(EMPTY_STATS);
  useEffect(() => {
    const token = localStorage.getItem("docodile_token");
    if (!token) return;
    const today = new Date();
    const dateStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
    fetch(`${API_BASE_URL}/api/tenant/appointments?date=${dateStr}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => (r.ok ? r.json() : []))
      .then((apts: any[]) => {
        const active = apts.filter((a) => !["CANCELLED", "NO_SHOW"].includes(a.status));
        setStats({
          totalAppointments: active.length,
          newPatients: active.filter((a) => a.type?.toUpperCase() === "NEW").length,
          reviews: active.filter((a) => a.type?.toUpperCase() === "REVIEW").length,
          procedures: active.filter((a) => a.service && !NON_PROCEDURE_SERVICES.has(a.service)).length,
        });
      })
      .catch(() => {
        /* network error — keep zeros */
      });
  }, []);
  return stats;
}

// ─── Starter board ────────────────────────────────────────────────────────────
// First-time layout for an account: the functional widgets across the top, plus
// either the user's migrated sticky notes or a single welcome note. Pinboard
// only uses this `seed` when the per-account store is empty, so it's a one-time
// thing; after that the user's own arrangement persists.

const WIDGET_SEED: PinboardItem[] = [
  { id: "w-cal", type: "calendar", x: 24, y: 24, z: 1, w: 344, h: 392 },
  { id: "w-stats", type: "stats", x: 392, y: 24, z: 2, w: 200, h: 150 },
  { id: "w-actions", type: "quickActions", x: 392, y: 190, z: 3, w: 196, h: 130 },
];

/** Carry over notes from the old MemoBoard so they don't disappear. */
function migrateLegacyNotes(): PinboardItem[] {
  try {
    const raw = localStorage.getItem("docodile_memo_board");
    if (!raw) return [];
    const arr = JSON.parse(raw);
    if (!Array.isArray(arr)) return [];
    return arr.map((m: any, i: number): PinboardItem => ({
      id: m.id || `legacy-${i}`,
      type: "sticky",
      x: typeof m.x === "number" ? m.x : 24,
      // Nudge below the widget row so migrated notes don't land under them.
      y: (typeof m.y === "number" ? m.y : 24) + 220,
      z: 10 + (m.z ?? i),
      w: 156,
      h: 152,
      rotation: m.rotation ?? 0,
      sticky: {
        title: m.title || "",
        text: m.text || "",
        color: m.color || "#EAE5FA",
        pinColor: m.pinColor || colors.red100,
        torn: !!m.torn,
        createdAt: m.createdAt || new Date().toISOString(),
      },
    }));
  } catch {
    return [];
  }
}

function buildSeed(): PinboardItem[] {
  const notes = migrateLegacyNotes();
  if (notes.length) return [...WIDGET_SEED, ...notes];
  const welcome: PinboardItem = {
    id: "w-welcome",
    type: "sticky",
    x: 620,
    y: 40,
    z: 4,
    w: 156,
    h: 152,
    rotation: -3,
    sticky: {
      title: "Welcome",
      text: "Drag things around. Add notes, widgets and stickers with the Add button.",
      color: "#EAE5FA",
      pinColor: colors.red100,
      torn: false,
      createdAt: new Date().toISOString(),
    },
  };
  return [...WIDGET_SEED, welcome];
}

// ─── Component ────────────────────────────────────────────────────────────────

export type HomeViewProps = {
  /** Routes the board's quick-action tiles (book / patient / script / records). */
  onQuickAction?: (key: string) => void;
};

export function HomeView({ onQuickAction }: HomeViewProps) {
  const stats = useTodayStats();
  const seed = useMemo(() => buildSeed(), []);

  return (
    <div style={styles.container}>
      <Pinboard seed={seed} stats={stats} onAction={onQuickAction} style={styles.board} />
    </div>
  );
}

// ─── Styles ────────────────────────────────────────────────────────────────────

const styles: Record<string, React.CSSProperties> = {
  // Full-bleed: cancel the page padding so the dotted board IS the whole
  // content background, edge to edge (the panel's rounded corner still clips it).
  container: {
    flex: 1,
    minHeight: 0,
    display: "flex",
    flexDirection: "column",
    marginTop: "calc(-1 * var(--page-pad-top))",
    marginBottom: "calc(-1 * var(--page-pad-bottom))",
    marginLeft: "calc(-1 * var(--page-pad-x))",
    marginRight: "calc(-1 * var(--page-pad-x))",
  },
  board: {
    flex: 1,
    minHeight: 0,
  },
};
