import React, { useEffect, useRef, useState } from "react";
import { colors, fonts, radii, spacing } from "../../styles/theme";
import {
  DAY_KEYS,
  DAY_LONG,
  DAY_SHORT,
  DaySchedule,
  DayKey,
  ScheduleState,
  formatDaySummary,
  hasOverride,
  isLiveNow,
  loadSchedule,
  saveSchedule,
  scheduleForDate,
  WeekSchedule,
} from "./scheduleStorage";
import { SchedulePopover, applyDayToWeek } from "./SchedulePopover";
import { SchedulePresetsModal } from "./SchedulePresetsModal";

type DoctorScheduleStripProps = {
  /** Optional callback fired when the schedule changes — useful to trigger heatmap refreshes. */
  onChange?: (state: ScheduleState) => void;
  /** "vertical" stacks days as rows (calendar-feel, narrow card). "horizontal" is the chip row (wide). */
  layout?: "vertical" | "horizontal";
};

const TODAY_DAY_KEY = (): DayKey => {
  const now = new Date();
  const map: DayKey[] = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];
  return map[now.getDay()];
};

// One-time keyframe injection for the today-row pulse
const PULSE_STYLE_ID = "docodile-schedule-pulse-keyframes";
function ensurePulseKeyframes() {
  if (typeof document === "undefined") return;
  if (document.getElementById(PULSE_STYLE_ID)) return;
  const style = document.createElement("style");
  style.id = PULSE_STYLE_ID;
  style.innerHTML = `
    @keyframes docodile-today-pulse {
      0%, 100% { box-shadow: 0 0 0 0 rgba(228, 134, 71, 0.35); }
      50%      { box-shadow: 0 0 0 6px rgba(228, 134, 71, 0); }
    }
  `;
  document.head.appendChild(style);
}

export function DoctorScheduleStrip({ onChange, layout = "vertical" }: DoctorScheduleStripProps) {
  const [state, setState] = useState<ScheduleState>(() => loadSchedule());
  const [editing, setEditing] = useState<{ key: DayKey; rect: DOMRect } | null>(null);
  const [showPresets, setShowPresets] = useState(false);
  const [now, setNow] = useState(new Date());
  const chipRefs = useRef<Record<DayKey, HTMLButtonElement | null>>({
    mon: null, tue: null, wed: null, thu: null, fri: null, sat: null, sun: null,
  });

  useEffect(() => {
    ensurePulseKeyframes();
  }, []);

  // Live "now" updates every minute
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(id);
  }, []);

  const persist = (next: ScheduleState) => {
    setState(next);
    saveSchedule(next);
    onChange?.(next);
  };

  const handleSaveDay = (key: DayKey, day: DaySchedule, scope: "this" | "weekdays" | "all") => {
    const nextDefault = applyDayToWeek(state.default, key, scope, day);
    persist({ ...state, default: nextDefault, configured: true });
  };

  const handlePickPreset = (week: WeekSchedule) => {
    persist({ ...state, default: week, configured: true });
    setShowPresets(false);
  };

  const todayKey = TODAY_DAY_KEY();
  const todayLive = scheduleForDate(state, now);
  const liveNow = isLiveNow(todayLive, now);

  const isVertical = layout === "vertical";

  return (
    <div style={styles.container}>
      <div style={styles.titleBlock}>
        <p style={styles.title}>My Hours</p>
        <p style={styles.statusLine}>
          {todayLive.off ? (
            <span style={styles.statusOff}>Off duty today</span>
          ) : liveNow ? (
            <span style={styles.statusOn}>● On duty now</span>
          ) : (
            <span style={styles.statusIdle}>{describeNext(todayLive, now)}</span>
          )}
        </p>
      </div>

      <div style={isVertical ? styles.dayList : styles.chipRow}>
        {DAY_KEYS.map((k) => {
          const day = state.default[k];
          const isToday = k === todayKey;
          const overridden = isToday && hasOverride(state, now);

          const baseStyle = isVertical ? styles.dayRow : styles.chip;
          const offStyle = isVertical ? styles.dayRowOff : styles.chipOff;
          const todayStyle = isVertical ? styles.dayRowToday : styles.chipToday;

          return (
            <button
              key={k}
              ref={(el) => { chipRefs.current[k] = el; }}
              onClick={(e) => {
                const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
                setEditing({ key: k, rect });
              }}
              style={{
                ...baseStyle,
                ...(day.off ? offStyle : {}),
                ...(isToday ? todayStyle : {}),
                ...(isToday ? { animation: "docodile-today-pulse 2.4s ease-out infinite" } : {}),
              }}
              title={`${DAY_LONG[k]} — ${formatDaySummary(day)}`}
            >
              {isVertical ? (
                <>
                  <span style={styles.dayLabel}>{DAY_LONG[k]}</span>
                  <span style={{ ...styles.dayHours, ...(day.off ? styles.dayHoursOff : {}) }}>
                    {formatDaySummary(day)}
                  </span>
                </>
              ) : (
                <>
                  <span style={styles.chipDay}>{DAY_SHORT[k]}</span>
                  <span style={{ ...styles.chipHours, ...(day.off ? styles.chipHoursOff : {}) }}>
                    {formatDaySummary(day)}
                  </span>
                </>
              )}
              {overridden && <span style={styles.overrideDot} title="Overridden for today" />}
            </button>
          );
        })}
      </div>

      {editing && (
        <SchedulePopover
          dayKey={editing.key}
          day={state.default[editing.key]}
          anchorRect={editing.rect}
          onClose={() => setEditing(null)}
          onSave={(day, scope) => handleSaveDay(editing.key, day, scope)}
        />
      )}

      {showPresets && (
        <SchedulePresetsModal
          onPick={handlePickPreset}
          onCustom={() => {
            persist({ ...state, configured: true });
            setShowPresets(false);
          }}
          onDismiss={() => setShowPresets(false)}
        />
      )}
    </div>
  );
}

function describeNext(day: DaySchedule, now: Date): string {
  if (day.off || day.sessions.length === 0) return "Off duty today";
  const minutes = now.getHours() * 60 + now.getMinutes();
  for (const s of day.sessions) {
    const [sh, sm] = s.start.split(":").map(Number);
    const startMin = sh * 60 + sm;
    if (startMin > minutes) {
      const diff = startMin - minutes;
      if (diff < 60) return `Starts in ${diff} min`;
      return `Starts at ${formatHour12(sh, sm)}`;
    }
  }
  return "Done for today";
}

function formatHour12(h: number, m: number): string {
  const period = h >= 12 ? "PM" : "AM";
  const display = h % 12 === 0 ? 12 : h % 12;
  return m === 0 ? `${display} ${period}` : `${display}:${String(m).padStart(2, "0")} ${period}`;
}

// ─── Styles ────────────────────────────────────────────────────────────────────

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: "flex",
    flexDirection: "column",
    gap: spacing.s,
    width: "100%",
  },
  titleBlock: {
    display: "flex",
    flexDirection: "column",
    gap: "2px",
  },
  title: {
    fontFamily: fonts.family.secondary,
    fontSize: fonts.size.h5,
    fontWeight: 400,
    color: colors.neutral900,
    margin: 0,
    lineHeight: 1.1,
  },
  statusLine: {
    fontFamily: fonts.family.primary,
    fontSize: fonts.size.xs,
    margin: 0,
  },
  statusOn: { color: colors.green200, fontWeight: 500 },
  statusOff: { color: colors.neutral600, fontWeight: 500 },
  statusIdle: { color: colors.neutral600, fontWeight: 500 },

  // Vertical (narrow card) — calendar-feel rows
  dayList: {
    display: "flex",
    flexDirection: "column",
    gap: "4px",
  },
  dayRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "8px 12px",
    backgroundColor: colors.primary100,
    border: `1px solid ${colors.primary200}`,
    borderRadius: radii.s,
    cursor: "pointer",
    fontFamily: fonts.family.primary,
    position: "relative",
    transition: "background-color 0.15s, border-color 0.15s",
  },
  dayRowToday: {
    backgroundColor: colors.primary200,
    border: `1.5px solid ${colors.primary500}`,
  },
  dayRowOff: {
    backgroundColor: colors.neutral150,
    border: `1px solid ${colors.neutral200}`,
  },
  dayLabel: {
    fontSize: fonts.control.sm,
    fontWeight: 600,
    color: colors.neutral800,
  },
  dayHours: {
    fontSize: fonts.control.sm,
    fontWeight: 500,
    color: colors.neutral900,
    whiteSpace: "nowrap",
  },
  dayHoursOff: {
    color: colors.neutral500,
    textDecoration: "line-through",
  },

  // Horizontal (legacy / alt usage)
  chipRow: {
    display: "flex",
    gap: "8px",
    flexWrap: "wrap",
  },
  chip: {
    flex: 1,
    minWidth: "108px",
    backgroundColor: colors.primary100,
    border: `1px solid ${colors.primary200}`,
    borderRadius: radii.l,
    padding: "10px 12px",
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-start",
    gap: "2px",
    cursor: "pointer",
    fontFamily: fonts.family.primary,
    position: "relative",
    transition: "border-color 0.15s, background-color 0.15s",
  },
  chipToday: {
    border: `1.5px solid ${colors.primary600}`,
    backgroundColor: colors.primary200,
  },
  chipOff: {
    backgroundColor: colors.neutral150,
    border: `1px solid ${colors.neutral200}`,
  },
  chipDay: {
    fontSize: fonts.control.xs,
    fontWeight: 600,
    color: colors.neutral700,
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  },
  chipHours: {
    fontSize: fonts.control.sm,
    color: colors.neutral900,
    fontWeight: 500,
    whiteSpace: "nowrap",
  },
  chipHoursOff: {
    color: colors.neutral500,
    textDecoration: "line-through",
  },
  overrideDot: {
    position: "absolute",
    top: "6px",
    right: "8px",
    width: "6px",
    height: "6px",
    borderRadius: "50%",
    backgroundColor: colors.primary700,
  },
};
