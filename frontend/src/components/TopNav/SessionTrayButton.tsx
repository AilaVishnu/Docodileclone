import React from "react";
import { colors, fonts, radii, spacing } from "../../styles/theme";
import { PrescriptionIcon } from "../../iconsUtil";
import type { Patient } from "../../hooks/usePatients";
import type { NavTab } from "../SideNav";

// ─── Active-session metadata persisted across reloads ────────────────────────
//
// The SessionBar already persists timer state under `docodile_session_state`
// keyed by visit id. This module adds a parallel map keyed by visit id with
// just enough patient context (name, ids) to render a header tray entry and
// route the doctor back to that prescription form on click.
//
// Meta is written when a session starts, kept while running/paused, and
// removed when the session ends. The header polls every second so the
// timer stays in sync with the SessionBar's own clock.

export type ActiveSessionMeta = {
  visitId: string;
  patient: Patient;
  appointmentId: string | null;
};

const META_KEY = "docodile_session_meta";
const STATE_KEY = "docodile_session_state";
const PENDING_NAV_KEY = "docodile_pending_session_nav";

type SessionState = {
  baseSeconds: number;
  runStartedAtMs: number | null;
  paused: boolean;
  ended: boolean;
};

function readMap<T>(key: string): Record<string, T> {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as Record<string, T>) : {};
  } catch {
    return {};
  }
}

function writeMap<T>(key: string, map: Record<string, T>) {
  try {
    localStorage.setItem(key, JSON.stringify(map));
  } catch {
    /* quota / private mode — ignore */
  }
}

export function recordActiveSession(meta: ActiveSessionMeta) {
  const map = readMap<ActiveSessionMeta>(META_KEY);
  map[meta.visitId] = meta;
  writeMap(META_KEY, map);
}

export function clearActiveSession(visitId: string) {
  const map = readMap<ActiveSessionMeta>(META_KEY);
  if (visitId in map) {
    delete map[visitId];
    writeMap(META_KEY, map);
  }
}

// Snapshot of all sessions still considered live (i.e. not ended in their
// SessionBar state). Used by the header tray to render its list.
function listActiveSessions(): Array<{ meta: ActiveSessionMeta; state: SessionState | null; seconds: number }> {
  const metaMap = readMap<ActiveSessionMeta>(META_KEY);
  const stateMap = readMap<SessionState>(STATE_KEY);
  const out: Array<{ meta: ActiveSessionMeta; state: SessionState | null; seconds: number }> = [];
  for (const visitId of Object.keys(metaMap)) {
    const meta = metaMap[visitId];
    const state = stateMap[visitId] ?? null;
    if (state?.ended) continue;
    const seconds = state == null
      ? 0
      : state.runStartedAtMs == null
        ? state.baseSeconds
        : state.baseSeconds + Math.max(0, Math.floor((Date.now() - state.runStartedAtMs) / 1000));
    out.push({ meta, state, seconds });
  }
  return out;
}

// Set when the doctor clicks a tray item — picked up by PrescriptionPage on
// next mount so it can pre-select the right patient/appointment.
export type PendingSessionNav = { patient: Patient; appointmentId: string | null };

export function setPendingSessionNav(nav: PendingSessionNav) {
  try {
    localStorage.setItem(PENDING_NAV_KEY, JSON.stringify(nav));
    window.dispatchEvent(new CustomEvent("docodile:session-nav", { detail: nav }));
  } catch {
    /* ignore */
  }
}

export function consumePendingSessionNav(): PendingSessionNav | null {
  try {
    const raw = localStorage.getItem(PENDING_NAV_KEY);
    if (!raw) return null;
    localStorage.removeItem(PENDING_NAV_KEY);
    return JSON.parse(raw) as PendingSessionNav;
  } catch {
    return null;
  }
}

const formatTimer = (totalSec: number): string => {
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
};

// ─── Component ───────────────────────────────────────────────────────────────

type SessionTrayButtonProps = {
  // Switches the home tab. Passed in so the parent (TopNav → HomePage) owns
  // the tab-state contract instead of this component poking localStorage.
  onNavigate: (tab: NavTab) => void;
};

export function SessionTrayButton({ onNavigate }: SessionTrayButtonProps) {
  const [open, setOpen] = React.useState(false);
  const [hovered, setHovered] = React.useState(false);
  const [sessions, setSessions] = React.useState<ReturnType<typeof listActiveSessions>>(() => listActiveSessions());
  const wrapperRef = React.useRef<HTMLDivElement>(null);

  // Refresh every second while the tray is open so timers tick. When closed,
  // refresh every 5s so the badge count stays correct without burning cycles.
  React.useEffect(() => {
    setSessions(listActiveSessions());
    const id = window.setInterval(() => setSessions(listActiveSessions()), open ? 1000 : 5000);
    return () => window.clearInterval(id);
  }, [open]);

  // Close on outside click — same pattern as the profile dropdown next to it.
  React.useEffect(() => {
    if (!open) return;
    function onMouseDown(e: MouseEvent) {
      if (!wrapperRef.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onMouseDown);
    return () => document.removeEventListener("mousedown", onMouseDown);
  }, [open]);

  if (sessions.length === 0) return null;

  const handleSessionClick = (meta: ActiveSessionMeta) => {
    setPendingSessionNav({ patient: meta.patient, appointmentId: meta.appointmentId });
    setOpen(false);
    onNavigate("Prescription");
  };

  return (
    <div ref={wrapperRef} style={styles.wrapper}>
      <button
        type="button"
        aria-label={`${sessions.length} active session${sessions.length === 1 ? "" : "s"}`}
        style={{ ...styles.iconButton, ...(hovered ? styles.iconButtonHover : {}) }}
        onClick={() => setOpen((v) => !v)}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        <PrescriptionIcon />
        <span style={styles.badge}>{sessions.length}</span>
      </button>

      {open && (
        <div style={styles.dropdown}>
          <p style={styles.dropdownTitle}>Active sessions</p>
          {sessions.map(({ meta, state, seconds }) => {
            const isPaused = state?.paused === true;
            return (
              <button
                key={meta.visitId}
                type="button"
                style={styles.sessionRow}
                onClick={() => handleSessionClick(meta)}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = colors.active.shade100)}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
              >
                <span style={styles.sessionName}>{meta.patient.name}</span>
                <span style={styles.sessionTimerWrap}>
                  <span
                    style={{
                      ...styles.sessionTimer,
                      color: isPaused ? colors.neutral500 : colors.green200,
                    }}
                  >
                    {formatTimer(seconds)}
                  </span>
                  {isPaused && <span style={styles.sessionPausedLabel}>· Paused</span>}
                </span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  wrapper: {
    position: "relative",
  },
  iconButton: {
    position: "relative",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: 48,
    height: 48,
    borderRadius: "50%",
    backgroundColor: "transparent",
    border: "none",
    cursor: "pointer",
    transition: "background-color 0.15s ease",
  },
  iconButtonHover: {
    backgroundColor: colors.neutralAlphaBlack,
  },
  // Numeric pill at the top-right of the icon, similar to a notification dot.
  badge: {
    position: "absolute",
    top: 6,
    right: 6,
    minWidth: 18,
    height: 18,
    padding: "0 5px",
    borderRadius: 999,
    backgroundColor: colors.neutral900,
    color: colors.neutral100,
    fontFamily: fonts.family.primary,
    fontSize: fonts.size.xs,
    lineHeight: "18px",
    textAlign: "center",
    boxSizing: "border-box",
  },
  dropdown: {
    position: "absolute",
    top: 56,
    right: 0,
    minWidth: 280,
    backgroundColor: colors.neutral100,
    borderRadius: radii.m,
    boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
    border: `1px solid ${colors.neutral200}`,
    padding: `${spacing.m} ${spacing.xs} ${spacing.xs}`,
    zIndex: 3100,
    display: "flex",
    flexDirection: "column",
    gap: 2,
  },
  dropdownTitle: {
    fontFamily: fonts.family.primary,
    fontSize: fonts.size.xs,
    color: colors.neutral500,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    margin: `${spacing["2xs"]} ${spacing.s}`,
  },
  sessionRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.s,
    padding: "10px 16px",
    borderRadius: radii.m,
    border: "none",
    backgroundColor: "transparent",
    cursor: "pointer",
    width: "100%",
    textAlign: "left",
    transition: "background-color 0.15s ease",
  },
  sessionName: {
    fontFamily: fonts.family.primary,
    fontSize: fonts.size.s,
    color: colors.neutral900,
  },
  sessionTimerWrap: {
    display: "inline-flex",
    alignItems: "baseline",
    gap: 6,
    whiteSpace: "nowrap",
  },
  sessionTimer: {
    fontFamily: fonts.family.secondary,
    fontSize: fonts.size.l,
    fontVariantNumeric: "tabular-nums",
    whiteSpace: "nowrap",
  },
  // "· Paused" suffix — sans-serif so it reads as a label rather than part
  // of the timer numerals. Same family/size as the patient name on the left.
  sessionPausedLabel: {
    fontFamily: fonts.family.primary,
    fontSize: fonts.size.s,
    color: colors.neutral500,
    whiteSpace: "nowrap",
  },
};
