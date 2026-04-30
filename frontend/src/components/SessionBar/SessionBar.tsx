import React, { CSSProperties } from "react";
import { colors, fonts, radii, spacing } from "../../styles/theme";
import { ReactComponent as PlayCircleIcon } from "../../assets/icons/play-circle.svg";
import { ReactComponent as PrinterIcon } from "../../assets/icons/printer.svg";
import { ReactComponent as DownloadIcon } from "../../assets/icons/download.svg";
import { ReactComponent as ShareIcon } from "../../assets/icons/share.svg";
import { ReactComponent as RestartIcon } from "../../assets/icons/restart.svg";
import { ReactComponent as StopCircleIcon } from "../../assets/icons/stop-circle.svg";

// ─────────────────────────────────────────────────────────────────────────────
// Floating session toolbar — Figma nodes 2255:10871 (idle) and 2036:5233
// (running). Renders fixed at the bottom-center of the viewport so the
// background scrolls behind it.
//
//  - Idle state  → dark `neutral900` pill, cream timer, green "Start
//    Session" pill on the left + printer / download / share icons on the
//    right.
//  - Running state → cream `primary100` pill, dark timer, three controls
//    on the right: yellow "Pause" pill, light-green Restart square, red
//    Stop square.
// ─────────────────────────────────────────────────────────────────────────────

type SessionBarProps = {
  onPrint?: () => void;
  onDownload?: () => void;
  onShare?: () => void;
  /**
   * Fires whenever the session goes active/inactive. "Active" = running
   * AND not paused — i.e. the form behind the bar should be editable.
   * Paused / ended / idle all report `false` so the host can lock the form.
   */
  onActiveChange?: (active: boolean) => void;
  /**
   * Fires when the doctor clicks the green Start Session button. Used
   * by the host to flip the appointment's "in progress" flag.
   */
  onStart?: () => void;
  /**
   * Fires when the doctor clicks the red End button. The host typically
   * uses this to save the form and persist the elapsed seconds so a
   * later visit can show the same final time.
   */
  onEnd?: (totalSeconds: number) => void;
  /**
   * When provided, the bar persists its full state (seconds, running,
   * paused, ended) under `docodile_session_state[<storageKey>]` so the
   * doctor can pause, navigate away, and come back to find the bar in
   * the exact same state at the same time. Typically set to the active
   * visit id.
   */
  storageKey?: string;
};

type SessionState = {
  seconds: number;
  running: boolean;
  paused: boolean;
  ended: boolean;
};

const STORE_KEY = "docodile_session_state";

function loadState(key: string): SessionState | null {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (!raw) return null;
    const map = JSON.parse(raw) as Record<string, SessionState>;
    return map[key] ?? null;
  } catch {
    return null;
  }
}

function saveState(key: string, state: SessionState | null) {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    const map = (raw ? JSON.parse(raw) : {}) as Record<string, SessionState>;
    if (state == null) delete map[key];
    else map[key] = state;
    localStorage.setItem(STORE_KEY, JSON.stringify(map));
  } catch {
    /* quota / private mode — ignore */
  }
}

export function SessionBar({
  onPrint,
  onDownload,
  onShare,
  onActiveChange,
  onStart,
  onEnd,
  storageKey,
}: SessionBarProps) {
  // Restore previous state if the visit had one — covers Pause + navigate
  // away + come back, plus reopening a visit that ended earlier.
  const initial = storageKey ? loadState(storageKey) : null;
  // State machine:
  //   idle    →  Start clicked → running (paused = false, seconds = 0)
  //   running →  Pause toggles paused; Restart resets seconds=0; End → idle
  //
  // The red square button on the right is the End button — it terminates
  // the session entirely and returns to the dark idle state with the Start
  // pill shown again.
  const [running, setRunning] = React.useState(initial?.running ?? false);
  const [paused, setPaused] = React.useState(initial?.paused ?? false);
  // After End is clicked, the bar flips to a cream "Session Ended" summary
  // showing the final elapsed time + a disabled "Session Ended" pill.
  // Click anywhere on the bar (or wait for the host to dismiss) to reset.
  const [ended, setEnded] = React.useState(initial?.ended ?? false);
  const [seconds, setSeconds] = React.useState(initial?.seconds ?? 0);

  // Persist the full bar state on every change so a remount restores it
  // bit-for-bit. Skipped when no storageKey is provided.
  React.useEffect(() => {
    if (!storageKey) return;
    saveState(storageKey, { seconds, running, paused, ended });
  }, [storageKey, seconds, running, paused, ended]);

  React.useEffect(() => {
    if (!running || paused) return;
    const id = window.setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => window.clearInterval(id);
  }, [running, paused]);

  // Notify parent when the form should be editable. Active = running and
  // not paused; everything else (idle / paused / ended) reports false.
  const active = running && !paused;
  React.useEffect(() => {
    onActiveChange?.(active);
  }, [active, onActiveChange]);

  const handleStart = () => {
    setSeconds(0);
    setPaused(false);
    setEnded(false);
    setRunning(true);
    onStart?.();
  };
  const togglePause = () => setPaused((p) => !p);
  const handleRestart = () => setSeconds(0);
  const handleEnd = () => {
    setRunning(false);
    setPaused(false);
    setEnded(true);
    // seconds is preserved — the Session-Ended view shows the final time.
    onEnd?.(seconds);
  };
  const handleDismissEnded = () => {
    setEnded(false);
    setSeconds(0);
  };

  return (
    <div style={{ ...styles.bar, ...styles.barIdle }}>
      <div style={styles.left}>
        <span
          style={{
            ...styles.timer,
            // Sage when paused (frozen). Cream otherwise — bar stays dark
            // in every state so the timer reads cream against it.
            color: paused ? colors.secondary400 : colors.primary100,
          }}
        >
          {formatTimer(seconds)}
        </span>
        {!running && !ended && (
          <button type="button" style={styles.startBtn} onClick={handleStart} aria-label="Start session">
            <PlayCircleIcon style={styles.startIcon} width={24} height={24} />
            <span>Start Session</span>
          </button>
        )}
      </div>

      {ended ? (
        // Post-end summary pill — Figma node 2036:5328:
        // bg = neutral200 (#E3E3E3), text = neutral500 (#8F8F8F),
        // pill-shaped, paragraph-m text. Clickable so it dismisses the
        // bar back to idle.
        <button
          type="button"
          style={styles.endedPill}
          onClick={handleDismissEnded}
          aria-label="Dismiss session summary"
        >
          Session Ended
        </button>
      ) : running ? (
        <div style={styles.runningActions}>
          <button
            type="button"
            style={{
              ...styles.pauseBtn,
              // Pause = yellow (Figma 2036:5244); Resume (within paused
              // running) = sage green (Figma 2036:5264).
              backgroundColor: paused ? colors.secondary400 : colors.yellow200,
            }}
            onClick={togglePause}
            aria-label={paused ? "Resume session" : "Pause session"}
          >
            {paused ? "Resume" : "Pause"}
          </button>
          <button
            type="button"
            style={styles.restartBtn}
            onClick={handleRestart}
            aria-label="Restart session timer"
          >
            <RestartIcon width={18} height={18} />
          </button>
          <button
            type="button"
            style={styles.stopBtn}
            onClick={handleEnd}
            aria-label="End session"
          >
            <StopCircleIcon width={18} height={18} />
          </button>
        </div>
      ) : (
        <div style={styles.idleActions}>
          <button type="button" style={styles.iconBtn} onClick={onPrint} aria-label="Print">
            <PrinterIcon width={24} height={24} />
          </button>
          <button type="button" style={styles.iconBtn} onClick={onDownload} aria-label="Download">
            <DownloadIcon width={24} height={24} />
          </button>
          <button type="button" style={styles.iconBtn} onClick={onShare} aria-label="Share">
            <ShareIcon width={24} height={24} />
          </button>
        </div>
      )}
    </div>
  );
}

// "0s" → "00:00" / "83s" → "01:23" / "3661s" → "61:01"
const formatTimer = (totalSec: number): string => {
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
};

const styles: Record<string, CSSProperties> = {
  bar: {
    position: "fixed",
    bottom: spacing.l,
    left: "50%",
    transform: "translateX(-50%)",
    borderRadius: radii.xl,
    padding: `${spacing.xs} ${spacing.s}`,
    display: "flex",
    alignItems: "center",
    gap: spacing.s,
    boxShadow: "4px 4px 24px rgba(0, 0, 0, 0.1)",
    zIndex: 1100,
    minWidth: 480,
  },
  // Dark pill — same across every state. Only the right-side control
  // group changes (Start / Pause-Resume / Session Ended).
  barIdle: {
    backgroundColor: colors.neutral900,
  },
  left: {
    display: "flex",
    alignItems: "center",
    gap: spacing.xs,
    flex: 1,
  },
  timer: {
    width: 84,
    fontFamily: fonts.family.secondary,
    fontSize: fonts.size.h4,
    lineHeight: fonts.lineHeight.h4,
    color: colors.primary100,
    whiteSpace: "nowrap",
  },
  // Idle: green Start pill
  startBtn: {
    display: "inline-flex",
    alignItems: "center",
    gap: spacing["2xs"],
    height: 40,
    padding: `${spacing["2xs"]} ${spacing.s}`,
    borderRadius: radii.full,
    border: "none",
    backgroundColor: colors.green200,
    color: colors.neutral100,
    fontFamily: fonts.family.primary,
    fontSize: fonts.size.m,
    lineHeight: fonts.lineHeight.m,
    cursor: "pointer",
  },
  startIcon: {
    color: colors.neutral100,
  },
  // Idle: print / download / share icon group
  idleActions: {
    display: "flex",
    alignItems: "center",
    gap: spacing.xs,
    color: colors.primary100,
  },
  iconBtn: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    width: 32,
    height: 32,
    padding: 0,
    background: "transparent",
    border: "none",
    cursor: "pointer",
    color: "inherit",
  },
  // Running: pause / restart / stop trio
  runningActions: {
    display: "flex",
    alignItems: "center",
    gap: spacing["2xs"],
  },
  // Yellow Pause pill — Figma 2036:5244
  pauseBtn: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    height: 32,
    padding: `${spacing["2xs"]} ${spacing.xs}`,
    borderRadius: radii.full,
    border: "none",
    backgroundColor: colors.yellow200,
    color: colors.neutral100,
    fontFamily: fonts.family.primary,
    fontSize: fonts.size.m,
    lineHeight: fonts.lineHeight.m,
    cursor: "pointer",
  },
  // Light-green square Restart — Figma 2036:5242
  restartBtn: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    width: 32,
    height: 32,
    padding: spacing["2xs"],
    borderRadius: radii.xs,
    border: "none",
    backgroundColor: colors.secondary100,
    color: colors.neutral900,
    cursor: "pointer",
  },
  // Figma node 2036:5328 — "Session Ended" disabled-look pill. Light grey
  // bg + medium grey text, pill-shaped. Clickable as a dismiss target.
  endedPill: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    height: 32,
    padding: `${spacing["2xs"]} ${spacing.s}`,
    borderRadius: radii.full,
    border: "none",
    backgroundColor: colors.neutral200,
    color: colors.neutral500,
    fontFamily: fonts.family.primary,
    fontSize: fonts.size.m,
    lineHeight: fonts.lineHeight.m,
    cursor: "pointer",
    whiteSpace: "nowrap" as const,
  },
  // Red square Stop — Figma 2036:5240
  stopBtn: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    width: 32,
    height: 32,
    padding: spacing["2xs"],
    borderRadius: radii.xs,
    border: "none",
    backgroundColor: colors.red100,
    color: colors.neutral100,
    cursor: "pointer",
  },
};
