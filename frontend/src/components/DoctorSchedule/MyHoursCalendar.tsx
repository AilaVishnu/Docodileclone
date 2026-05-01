import React, { useEffect, useMemo, useState } from "react";
import { colors, fonts, radii, spacing } from "../../styles/theme";
import {
  DAY_LONG,
  dayKeyFor,
  formatDaySummary,
  hasOverride,
  loadSchedule,
  saveSchedule,
  ScheduleState,
  scheduleForDate,
} from "./scheduleStorage";
import { applyDayToWeek, SchedulePopover } from "./SchedulePopover";

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const WEEKDAY_HEADERS = ["S", "M", "T", "W", "T", "F", "S"];
const SPRING_COILS = Array.from({ length: 11 });

// ─── Density classification — how "busy" a day's schedule is ──────────────────
function dayIntensity(state: ScheduleState, date: Date): number {
  const day = scheduleForDate(state, date);
  if (day.off || day.sessions.length === 0) return 0;
  // Total minutes scheduled
  const minutes = day.sessions.reduce((sum, s) => {
    const [sh, sm] = s.start.split(":").map(Number);
    const [eh, em] = s.end.split(":").map(Number);
    return sum + (eh * 60 + em - sh * 60 - sm);
  }, 0);
  if (minutes <= 60) return 1;     // light
  if (minutes <= 180) return 2;    // moderate
  if (minutes <= 360) return 3;    // medium
  return 4;                         // heavy
}

function intensityBg(level: number): string {
  switch (level) {
    case 0: return colors.neutral150;
    case 1: return colors.primary100;
    case 2: return colors.primary200;
    case 3: return colors.primary300;
    case 4: return colors.primary400;
    default: return colors.neutral150;
  }
}

// ─── Component ────────────────────────────────────────────────────────────────

type MyHoursCalendarProps = {
  onChange?: (state: ScheduleState) => void;
};

export function MyHoursCalendar({ onChange }: MyHoursCalendarProps) {
  const [state, setState] = useState<ScheduleState>(() => loadSchedule());
  const [now, setNow] = useState(new Date());
  const [viewMonth, setViewMonth] = useState(() => {
    const d = new Date();
    return { year: d.getFullYear(), month: d.getMonth() }; // month 0..11
  });
  const [editing, setEditing] = useState<{ date: Date; rect: DOMRect } | null>(null);

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(id);
  }, []);

  const persist = (next: ScheduleState) => {
    setState(next);
    saveSchedule(next);
    onChange?.(next);
  };

  const handleSaveDay = (
    fromDate: Date,
    day: ReturnType<typeof scheduleForDate>,
    scope: "this" | "weekdays" | "all"
  ) => {
    const key = dayKeyFor(fromDate);
    const nextDefault = applyDayToWeek(state.default, key, scope, day);
    persist({ ...state, default: nextDefault, configured: true });
  };

  // Build the grid: 6 rows × 7 cols, including leading/trailing days from neighbor months
  const cells = useMemo(() => buildMonthGrid(viewMonth.year, viewMonth.month), [viewMonth]);

  const navMonth = (delta: number) => {
    setViewMonth((prev) => {
      let m = prev.month + delta;
      let y = prev.year;
      if (m < 0) { m = 11; y -= 1; }
      if (m > 11) { m = 0; y += 1; }
      return { year: y, month: m };
    });
  };

  return (
    <div style={styles.outer}>
      <div style={styles.springBar} aria-hidden>
        {SPRING_COILS.map((_, i) => (
          <span key={i} style={styles.springCoil} />
        ))}
      </div>

      <div style={styles.calendar}>
        {/* Graphic header — like a wall calendar's photo strip */}
        <div style={styles.graphic}>
          <button
            onClick={() => navMonth(-1)}
            style={{ ...styles.headerNavBtn, left: spacing.m }}
            aria-label="Previous month"
          >
            ‹
          </button>
          <p style={styles.graphicMonth}>{MONTH_NAMES[viewMonth.month]}</p>
          <p style={styles.graphicYear}>{viewMonth.year}</p>
          <button
            onClick={() => navMonth(1)}
            style={{ ...styles.headerNavBtn, right: spacing.m }}
            aria-label="Next month"
          >
            ›
          </button>
        </div>

        <div style={styles.grid}>
          {WEEKDAY_HEADERS.map((d, i) => (
            <span key={i} style={styles.weekdayHeader}>{d}</span>
          ))}

          {cells.map((cell, i) => {
            const date = cell.date;
            const isToday = sameDay(date, now);
            const inMonth = cell.inMonth;
            const intensity = inMonth ? dayIntensity(state, date) : 0;
            const overridden = hasOverride(state, date);
            const day = scheduleForDate(state, date);
            const hoursShort = !day.off && day.sessions.length ? formatDaySummaryShort(day) : "";

            return (
              <button
                key={i}
                onClick={(e) => {
                  if (!inMonth) return;
                  const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
                  setEditing({ date, rect });
                }}
                style={{
                  ...styles.cell,
                  backgroundColor: inMonth ? intensityBg(intensity) : "transparent",
                  color: inMonth ? colors.neutral900 : colors.neutral300,
                  cursor: inMonth ? "pointer" : "default",
                  ...(isToday ? styles.cellToday : {}),
                  ...(day.off && inMonth ? styles.cellOff : {}),
                }}
                title={inMonth ? `${DAY_LONG[dayKeyFor(date)]} — ${formatDaySummary(day)}` : ""}
                disabled={!inMonth}
              >
                <span style={styles.cellNumber}>{date.getDate()}</span>
                {inMonth && hoursShort && (
                  <span style={styles.cellHours}>{hoursShort}</span>
                )}
                {overridden && inMonth && <span style={styles.overrideDot} />}
              </button>
            );
          })}
        </div>
      </div>

      {editing && (
        <SchedulePopover
          dayKey={dayKeyFor(editing.date)}
          day={state.default[dayKeyFor(editing.date)]}
          anchorRect={editing.rect}
          onClose={() => setEditing(null)}
          onSave={(day, scope) => handleSaveDay(editing.date, day, scope)}
        />
      )}
    </div>
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

type CalendarCell = { date: Date; inMonth: boolean };

function buildMonthGrid(year: number, month: number): CalendarCell[] {
  const first = new Date(year, month, 1);
  const startOffset = first.getDay(); // 0..6 (Sun..Sat)
  const cells: CalendarCell[] = [];
  // Leading days from previous month
  for (let i = startOffset - 1; i >= 0; i--) {
    const d = new Date(year, month, -i);
    cells.push({ date: d, inMonth: false });
  }
  // Current month
  const last = new Date(year, month + 1, 0).getDate();
  for (let i = 1; i <= last; i++) {
    cells.push({ date: new Date(year, month, i), inMonth: true });
  }
  // Trailing — fill to 42 (6 rows × 7 cols)
  while (cells.length < 42) {
    const tail = cells[cells.length - 1].date;
    cells.push({ date: new Date(tail.getFullYear(), tail.getMonth(), tail.getDate() + 1), inMonth: false });
  }
  return cells;
}

function sameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function formatDaySummaryShort(day: ReturnType<typeof scheduleForDate>): string {
  if (day.off || !day.sessions.length) return "";
  const s = day.sessions[0];
  const [sh] = s.start.split(":").map(Number);
  const [eh] = s.end.split(":").map(Number);
  const startH = sh % 12 === 0 ? 12 : sh % 12;
  const endH = eh % 12 === 0 ? 12 : eh % 12;
  const more = day.sessions.length > 1 ? "+" : "";
  return `${startH}–${endH}${more}`;
}

// ─── Styles ────────────────────────────────────────────────────────────────────

const styles: Record<string, React.CSSProperties> = {
  // Outer wrapper holds the physical calendar card.
  outer: {
    position: "relative",
    width: "100%",
  },

  // The calendar card itself — white bg, no frame
  calendar: {
    backgroundColor: colors.neutral100,
    borderRadius: radii.l,
    overflow: "hidden",
    display: "flex",
    flexDirection: "column",
  },
  springBar: {
    position: "absolute",
    top: "-14px",
    left: spacing.s,
    right: spacing.s,
    height: "28px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "10px",
    pointerEvents: "none",
    zIndex: 2,
  },
  springCoil: {
    width: "14px",
    height: "18px",
    border: `2px solid ${colors.neutral500}`,
    borderRadius: radii.full,
    borderBottomColor: "transparent",
    boxSizing: "border-box",
  },

  // Graphic strip — the "photo" area on a real wall calendar
  graphic: {
    backgroundColor: colors.primary300,
    padding: `${spacing["2xl"]} ${spacing.m} ${spacing.l}`,
    minHeight: "132px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: "2px",
    position: "relative",
  },
  graphicMonth: {
    fontFamily: fonts.family.secondary,
    fontSize: fonts.size.h3,
    fontWeight: 400,
    color: colors.neutral900,
    margin: 0,
    lineHeight: 1,
  },
  graphicYear: {
    fontFamily: fonts.family.secondary,
    fontStyle: "italic",
    fontSize: fonts.size.l,
    color: colors.neutral800,
    margin: 0,
    opacity: 0.85,
  },
  headerNavBtn: {
    position: "absolute",
    top: "50%",
    transform: "translateY(-50%)",
    width: "28px",
    height: "28px",
    borderRadius: "50%",
    border: "none",
    backgroundColor: "transparent",
    color: colors.neutral800,
    cursor: "pointer",
    fontSize: "18px",
    lineHeight: 1,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 0,
  },

  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(7, 1fr)",
    gap: "3px",
    padding: `${spacing.xl} ${spacing.m} ${spacing.m}`,
  },
  weekdayHeader: {
    fontFamily: fonts.family.primary,
    fontSize: fonts.size.caption,
    fontWeight: 600,
    color: colors.neutral600,
    textAlign: "center",
    paddingBottom: "2px",
    letterSpacing: "0.4px",
  },
  cell: {
    minHeight: "44px",
    border: "none",
    borderRadius: radii.s,
    padding: "3px 0 4px",
    fontFamily: fonts.family.primary,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "flex-start",
    gap: "2px",
    position: "relative",
    transition: "background-color 0.15s, border-color 0.15s",
  },
  cellToday: {
    border: `1.5px solid ${colors.primary700}`,
  },
  cellOff: {
    color: colors.neutral500,
    backgroundColor: colors.neutral150,
  },
  cellNumber: {
    fontSize: fonts.control.sm,
    fontWeight: 600,
    lineHeight: 1,
  },
  cellHours: {
    fontSize: "10px",
    fontWeight: 500,
    color: colors.neutral700,
    lineHeight: 1,
    letterSpacing: "0",
  },
  overrideDot: {
    position: "absolute",
    top: "3px",
    right: "3px",
    width: "5px",
    height: "5px",
    borderRadius: "50%",
    backgroundColor: colors.primary700,
  },
};
