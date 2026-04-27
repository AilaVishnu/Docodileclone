import React, { useState } from "react";
import { colors, fonts, radii } from "../../styles/theme";
import { isoDateFor, loadSchedule, saveSchedule, ScheduleState, parseTime, formatTime24, dayKeyFor } from "./scheduleStorage";
import { SchedulePresetsModal } from "./SchedulePresetsModal";

// ─────────────────────────────────────────────────────────────────────────────
// ScheduleQuickActions — separate "act on your hours" panel for the bottom tray.
// Lives outside the schedule strip so it can sit in the action zone of the page.
// ─────────────────────────────────────────────────────────────────────────────

const tomorrowDate = () => {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d;
};

export function ScheduleQuickActions() {
  const [showPresets, setShowPresets] = useState(false);
  const [, setTick] = useState(0);
  const persist = (next: ScheduleState) => {
    saveSchedule(next);
    setTick((t) => t + 1);
  };

  const handleOffTomorrow = () => {
    const state = loadSchedule();
    const tom = tomorrowDate();
    const iso = isoDateFor(tom);
    persist({
      ...state,
      overrides: { ...state.overrides, [iso]: { off: true, sessions: [] } },
    });
  };

  const handleClosingEarly = () => {
    const state = loadSchedule();
    const today = new Date();
    const iso = isoDateFor(today);
    const day = state.default[dayKeyFor(today)];
    if (day.off || day.sessions.length === 0) return;
    // End the last session at "now + 30 min" (rounded to next 15-min)
    const now = new Date();
    const target = new Date(now.getTime() + 30 * 60_000);
    const m = Math.ceil(target.getMinutes() / 15) * 15;
    const h = target.getHours() + (m === 60 ? 1 : 0);
    const newEnd = formatTime24(h, m === 60 ? 0 : m);
    const sessions = day.sessions.map((s, i, arr) => (i === arr.length - 1 ? { ...s, end: newEnd } : s));
    // Make sure last session start < new end
    const last = sessions[sessions.length - 1];
    if (parseTime(last.start) >= parseTime(last.end)) return;
    persist({
      ...state,
      overrides: { ...state.overrides, [iso]: { off: false, sessions } },
    });
  };

  return (
    <div style={styles.card}>
      <p style={styles.title}>Quick actions</p>
      <p style={styles.subtitle}>Tweak today or tomorrow in one tap.</p>

      <div style={styles.row}>
        <button onClick={handleOffTomorrow} style={styles.btn}>
          🚫 Off tomorrow
        </button>
        <button onClick={handleClosingEarly} style={styles.btn}>
          🌙 Closing early
        </button>
        <button onClick={() => setShowPresets(true)} style={styles.btn}>
          ⏱ Presets
        </button>
      </div>

      {showPresets && (
        <SchedulePresetsModal
          onPick={(week) => {
            const cur = loadSchedule();
            persist({ ...cur, default: week, configured: true });
            setShowPresets(false);
          }}
          onCustom={() => setShowPresets(false)}
          onDismiss={() => setShowPresets(false)}
        />
      )}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  card: {
    backgroundColor: colors.primary100,
    borderRadius: radii.xl,
    padding: "20px",
    display: "flex",
    flexDirection: "column",
    gap: "8px",
    minWidth: "280px",
    maxWidth: "420px",
  },
  title: {
    fontFamily: fonts.family.secondary,
    fontSize: fonts.size.h6,
    fontWeight: 400,
    color: colors.neutral900,
    margin: 0,
  },
  subtitle: {
    fontFamily: fonts.family.primary,
    fontSize: fonts.size.xs,
    color: colors.neutral600,
    margin: 0,
    marginBottom: "4px",
  },
  row: {
    display: "flex",
    flexWrap: "wrap",
    gap: "8px",
  },
  btn: {
    fontFamily: fonts.family.primary,
    fontSize: fonts.control.sm,
    fontWeight: 500,
    color: colors.neutral800,
    backgroundColor: colors.neutral100,
    border: `1px solid ${colors.primary300}`,
    borderRadius: radii.full,
    padding: "8px 14px",
    cursor: "pointer",
    transition: "background-color 0.15s, transform 0.05s",
  },
};
