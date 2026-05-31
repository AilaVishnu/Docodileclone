import React, { CSSProperties } from "react";
import { colors, fonts, radii, spacing } from "../../styles/theme";
import { ReactComponent as PlayCircleIcon } from "../../assets/icons/play-circle.svg";
import { ReactComponent as PrinterIcon } from "../../assets/icons/printer.svg";
import { ReactComponent as DownloadIcon } from "../../assets/icons/download.svg";
import { ReactComponent as ShareIcon } from "../../assets/icons/share.svg";
import { ReactComponent as RestartIcon } from "../../assets/icons/restart.svg";
import { ReactComponent as StopCircleIcon } from "../../assets/icons/stop-circle.svg";
import { Button } from "../Button";
import { confirmStyles } from "../AddStaffModal/AddStaffModal.styles";

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
   * Fires when the doctor clicks the Restart icon on the ended bar. Host
   * is responsible for resetting timer state + visit session fields so
   * the bar returns to the Start Session view on next render.
   */
  onRestart?: () => void;
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
  /**
   * Read-only mode for historic visits. When true the bar shows the
   * recorded duration in a frozen "Session Ended" view, suppresses every
   * interactive control, never touches localStorage, and never reports
   * itself as active to the host. Used by the prescription page when the
   * doctor switches to a past visit tab.
   */
  readOnly?: boolean;
  /**
   * Duration in seconds to display when `readOnly` is true. Sourced from
   * the visit DTO's `sessionDurationSec` so each historic tab shows the
   * timer that visit actually recorded — not whatever happens to be in
   * this device's localStorage.
   */
  recordedDurationSec?: number | null;
  /**
   * Override the bar's distance from the viewport bottom (px). Defaults to
   * the standard 20px. The prescription page raises this so the bar floats
   * ABOVE the new bottom nav/actions bar instead of colliding with it.
   */
  bottomOffset?: number;
  /**
   * Wall-clock ms timestamp of when this visit's session was ended on
   * the DB row. Used by both the readOnly branch (Resume gate for
   * historic visits) and as a fallback for legacy interactive state
   * that has `ended=true` but no `endedAtMs` persisted. Pass `null` (or
   * omit) and Resume is suppressed once any backed-up state expires.
   */
  recordedEndedAtMs?: number | null;
};

// Wall-clock based session state. Total elapsed time is reconstructed
// from `baseSeconds` (whatever was accumulated during paused / ended
// segments) plus, if currently running, the wall-clock delta since the
// current run started (`runStartedAtMs`). This means navigating away
// without pausing keeps the timer ticking — when the bar remounts it
// reads back the same `runStartedAtMs` and `Date.now() - runStartedAtMs`
// shows the time that elapsed while the page was unmounted.
type SessionState = {
  baseSeconds: number;
  runStartedAtMs: number | null;
  paused: boolean;
  ended: boolean;
  // Wall-clock timestamp of when End was clicked. Drives the 24-hour
  // "buffer" window during which the Resume button stays visible — after
  // that, the bar treats the visit as closed for good and hides Resume.
  // Optional so historic state from before this field existed still loads.
  endedAtMs?: number | null;
};

const STORE_KEY = "docodile_session_state";

// How long the Resume button stays visible after End is clicked. After
// this window the session is considered closed for good and Resume hides.
const RESUME_BUFFER_MS = 24 * 60 * 60 * 1000;

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
  onRestart,
  onActiveChange,
  onStart,
  onEnd,
  storageKey,
  readOnly = false,
  recordedDurationSec = null,
  bottomOffset,
  recordedEndedAtMs = null,
}: SessionBarProps) {
  // Optional bottom override so the host can lift the bar above other
  // floating UI (e.g. the prescription page's bottom nav/actions bar).
  const barPos = bottomOffset != null ? { bottom: bottomOffset } : null;
  // Restore previous state if the visit had one — covers Pause + navigate
  // away + come back, plus reopening a visit that ended earlier. Skipped
  // entirely in readOnly mode so historic-visit tabs don't pull stale
  // localStorage state into the throw-away interactive state below.
  const initial = !readOnly && storageKey ? loadState(storageKey) : null;
  // State machine:
  //   idle    →  Start clicked → runStartedAtMs = now, baseSeconds = 0
  //   running →  Pause stops the run-segment, banks elapsed in baseSeconds
  //              Resume starts a new run-segment; End freezes
  const [baseSeconds, setBaseSeconds] = React.useState(initial?.baseSeconds ?? 0);
  const [runStartedAtMs, setRunStartedAtMs] = React.useState<number | null>(
    initial?.runStartedAtMs ?? null,
  );
  const [paused, setPaused] = React.useState(initial?.paused ?? false);
  const [ended, setEnded] = React.useState(initial?.ended ?? false);
  // 24h Resume buffer — prefer the DB's sessionEndedAt
  // (recordedEndedAtMs) since it's canonical and survives reloads.
  // Fall back to the persisted local endedAtMs to cover (1) the race
  // window between clicking End and the updateVisit fetch syncing the
  // column back and (2) sessions ended locally without DB sync. We
  // deliberately do NOT backfill ended-without-timestamp to Date.now()
  // — that was the earlier bug that kept Resume on forever.
  const [endedAtMs, setEndedAtMs] = React.useState<number | null>(
    recordedEndedAtMs ?? initial?.endedAtMs ?? null,
  );
  // Confirmation overlay for the End button — once a session ends it
  // can't be restarted for the visit, so we make sure the click is
  // intentional.
  const [showEndConfirm, setShowEndConfirm] = React.useState(false);
  const [showRestartConfirm, setShowRestartConfirm] = React.useState(false);

  const running = runStartedAtMs != null;

  // Forces a re-render every second while running so the timer text
  // updates. The visible seconds value is derived from baseSeconds +
  // (now - runStartedAtMs), so the timer ticks correctly even right
  // after a remount.
  const [, setNowTick] = React.useState(0);
  React.useEffect(() => {
    if (readOnly || runStartedAtMs == null) return;
    const id = window.setInterval(() => setNowTick((n) => n + 1), 1000);
    return () => window.clearInterval(id);
  }, [runStartedAtMs, readOnly]);

  // Recomputed on every render — the per-second setNowTick above forces
  // a render while running so the displayed timer text advances. NOT
  // memoised on [baseSeconds, runStartedAtMs] because those don't change
  // while a run-segment is in progress, which would freeze the display.
  const seconds = (() => {
    if (runStartedAtMs == null) return baseSeconds;
    return baseSeconds + Math.max(0, Math.floor((Date.now() - runStartedAtMs) / 1000));
  })();

  // Persist the full bar state on every change so a remount restores it
  // bit-for-bit. Skipped when no storageKey is provided, or when the bar
  // is in readOnly mode (historic visits never write back).
  React.useEffect(() => {
    if (readOnly || !storageKey) return;
    saveState(storageKey, { baseSeconds, runStartedAtMs, paused, ended, endedAtMs });
  }, [readOnly, storageKey, baseSeconds, runStartedAtMs, paused, ended, endedAtMs]);

  // Notify parent when the form should be editable. Active = running and
  // not paused; everything else (idle / paused / ended) reports false.
  // readOnly tabs skip this entirely — they neither own nor invalidate
  // the host's editable flag, which lets a session that was started on
  // today's tab continue to keep past tabs editable too.
  const active = running && !paused;
  React.useEffect(() => {
    if (readOnly) return;
    onActiveChange?.(active);
  }, [active, onActiveChange, readOnly]);

  // Each handler ALSO writes to localStorage synchronously so the saved
  // state can never lag behind the user's action — even if the host
  // navigates away or refreshes immediately after a click.
  const handleStart = () => {
    const now = Date.now();
    setBaseSeconds(0);
    setRunStartedAtMs(now);
    setPaused(false);
    setEnded(false);
    setEndedAtMs(null);
    if (storageKey) saveState(storageKey, { baseSeconds: 0, runStartedAtMs: now, paused: false, ended: false, endedAtMs: null });
    onStart?.();
  };
  const togglePause = () => {
    if (paused) {
      // Resume: start a new run-segment from now.
      const now = Date.now();
      setRunStartedAtMs(now);
      setPaused(false);
      if (storageKey) saveState(storageKey, { baseSeconds, runStartedAtMs: now, paused: false, ended, endedAtMs });
    } else {
      // Pause: bank the current run-segment's elapsed seconds and stop running.
      const elapsed = runStartedAtMs == null ? 0 : Math.max(0, Math.floor((Date.now() - runStartedAtMs) / 1000));
      const newBase = baseSeconds + elapsed;
      setBaseSeconds(newBase);
      setRunStartedAtMs(null);
      setPaused(true);
      if (storageKey) saveState(storageKey, { baseSeconds: newBase, runStartedAtMs: null, paused: true, ended, endedAtMs });
    }
  };
  const handleRestart = () => {
    // Restart timer to 0 while preserving running/paused state.
    const now = runStartedAtMs == null ? null : Date.now();
    setBaseSeconds(0);
    setRunStartedAtMs(now);
    if (storageKey) saveState(storageKey, { baseSeconds: 0, runStartedAtMs: now, paused, ended, endedAtMs });
  };
  const handleEnd = () => {
    // Freeze the timer at its current displayed value.
    const elapsed = runStartedAtMs == null ? 0 : Math.max(0, Math.floor((Date.now() - runStartedAtMs) / 1000));
    const finalSeconds = baseSeconds + elapsed;
    const now = Date.now();
    setBaseSeconds(finalSeconds);
    setRunStartedAtMs(null);
    setPaused(false);
    setEnded(true);
    setEndedAtMs(now);
    if (storageKey) saveState(storageKey, { baseSeconds: finalSeconds, runStartedAtMs: null, paused: false, ended: true, endedAtMs: now });
    onEnd?.(finalSeconds);
  };

  // Resume is only offered while we're inside the 24h buffer window. Once
  // the window expires (or the recorded endedAt is unknown — legacy state)
  // the visit is considered closed and the Resume button is suppressed.
  const interactiveCanResume =
    endedAtMs != null && Date.now() - endedAtMs < RESUME_BUFFER_MS;
  // Use the combined endedAtMs (DB sessionEndedAt, falling back to the
  // locally-persisted end time) rather than the DB prop alone — otherwise a
  // session ended on this device but not yet synced to the DB column shows
  // no Resume even though it just ended seconds ago.
  const readOnlyCanResume =
    endedAtMs != null && Date.now() - endedAtMs < RESUME_BUFFER_MS;

  // Read-only branch — historic visits render the recorded duration
  // alongside a centered "Session Ended" label and the print / download
  // / share icons. Mirrors the live bar's `ended` layout so the visual
  // weight is consistent. Placed after every hook so React's rules-of-
  // hooks ordering stays the same whether the bar mounts interactive
  // or read-only.
  //
  // Timer display logic:
  // - If session is within 24h window AND has Resume available: show timer (resumable session)
  // - If session is older than 24h: hide timer, show only "Session Ended" (closed session)
  if (readOnly) {
    return (
      <div style={{ ...styles.bar, ...styles.barIdle, ...barPos }}>
        {/* Historic visits always show their recorded (static) duration —
            this is the final session length, not a running timer. */}
        <span style={{ ...styles.timer, color: colors.primary100 }}>
          {formatTimer(recordedDurationSec ?? 0)}
        </span>
        <span style={styles.endedCenter} aria-label="Session ended">
          Session Ended
        </span>
        <div style={styles.idleActions}>
          {onRestart && readOnlyCanResume && (
            <button
              type="button"
              style={{ ...styles.pauseBtn, backgroundColor: colors.secondary400 }}
              onClick={onRestart}
              aria-label="Resume session"
              title="Resume session"
            >
              Resume
            </button>
          )}
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
      </div>
    );
  }

  return (
    <>
    <div style={{ ...styles.bar, ...styles.barIdle, ...barPos }}>
      {/* Hide timer if session ended more than 24 hours ago (beyond resume window) */}
      {!(ended && endedAtMs && Date.now() - endedAtMs >= RESUME_BUFFER_MS) && (
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
      )}

      {ended ? (
        // Centered "Session Ended" text + print / download / share icons on the right.
        <>
          <span style={styles.endedCenter} aria-label="Session ended">
            Session Ended
          </span>
          <div style={styles.idleActions}>
            {/* Interactive ended: show Resume unless we have a real end
                timestamp that's already older than 24h. A null endedAtMs
                means "just ended on this device / legacy state" — still
                resumable, so don't hide it. */}
            {onRestart && !(endedAtMs != null && Date.now() - endedAtMs >= RESUME_BUFFER_MS) && (
              <button
                type="button"
                style={{ ...styles.pauseBtn, backgroundColor: colors.secondary400 }}
                onClick={onRestart}
                aria-label="Resume session"
                title="Resume session"
              >
                Resume
              </button>
            )}
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
        </>
      ) : running || paused ? (
        // Paused is also "session in progress" from the controls'
        // perspective — Pause/Resume + Restart + End.
        <div style={styles.runningActions}>
          <button
            type="button"
            style={{
              ...styles.pauseBtn,
              // Pause = yellow; Resume = sage green.
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
            onClick={() => setShowRestartConfirm(true)}
            aria-label="Restart session timer"
          >
            <RestartIcon width={18} height={18} />
          </button>
          <button
            type="button"
            style={styles.stopBtn}
            onClick={() => setShowEndConfirm(true)}
            aria-label="End session"
          >
            <StopCircleIcon width={18} height={18} />
          </button>
        </div>
      ) : (
        // Idle — only the green Start Session button, no other icons.
        <button type="button" style={styles.startBtn} onClick={handleStart} aria-label="Start session">
          <PlayCircleIcon style={styles.startIcon} width={24} height={24} />
          <span>Start Session</span>
        </button>
      )}
    </div>

    {/* Rendered as a sibling of the bar (NOT inside it) — the bar uses
        transform: translateX(-50%) which creates a new containing block,
        which would otherwise clip this overlay to the bar's bounds. */}
    {showEndConfirm && (
      <div style={{ ...confirmStyles.overlay, zIndex: 9999 }}>
        <div style={confirmStyles.dialog}>
          <h4 style={confirmStyles.title}>Are you sure?</h4>
          <p
            style={{
              margin: 0,
              fontSize: fonts.size.s,
              color: colors.neutral600,
              textAlign: "center",
            }}
          >
            This will close the visit. You can hit Restart later to
            resume editing if the patient comes back.
          </p>
          <div style={confirmStyles.actions}>
            <Button
              variant="dangerLight"
              size="sm"
              onClick={() => setShowEndConfirm(false)}
            >
              Nope
            </Button>
            <Button
              variant="dark"
              size="sm"
              onClick={() => {
                setShowEndConfirm(false);
                handleEnd();
              }}
            >
              Yes, end
            </Button>
          </div>
        </div>
      </div>
    )}

    {showRestartConfirm && (
      <div style={{ ...confirmStyles.overlay, zIndex: 9999 }}>
        <div style={confirmStyles.dialog}>
          <h4 style={confirmStyles.title}>Reset timer?</h4>
          <p
            style={{
              margin: 0,
              fontSize: fonts.size.s,
              color: colors.neutral600,
              textAlign: "center",
            }}
          >
            It will reset the time and will start from the beginning.
          </p>
          <div style={confirmStyles.actions}>
            <Button
              variant="dangerLight"
              size="sm"
              onClick={() => setShowRestartConfirm(false)}
            >
              Nope
            </Button>
            <Button
              variant="dark"
              size="sm"
              onClick={() => {
                setShowRestartConfirm(false);
                handleRestart();
              }}
            >
              Yes, reset
            </Button>
          </div>
        </div>
      </div>
    )}
    </>
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
    justifyContent: "space-between",
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
  // Yellow Pause / sage Resume pill — sized to match the green Start Session
  // pill so the bar's right-side control doesn't change height between states.
  pauseBtn: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    height: 40,
    padding: `${spacing["2xs"]} ${spacing.s}`,
    borderRadius: radii.full,
    border: "none",
    backgroundColor: colors.yellow200,
    color: colors.neutral900,
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
  // Centered "Session Ended" label — grey text, no pill bg, sits in the
  // middle of the bar between the timer and the action icons.
  endedCenter: {
    flex: 1,
    textAlign: "center" as const,
    fontFamily: fonts.family.primary,
    fontSize: fonts.size.m,
    lineHeight: fonts.lineHeight.m,
    color: colors.neutral500,
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
