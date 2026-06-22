import React, { useState } from "react";
import { colors, fonts, radii, spacing, strokes } from "../../../styles/theme";
import { Card } from "../../Card";
import { Icon } from "../../Icon";
import {
  loadSchedule,
  scheduleForDate,
  formatDaySummary,
  formatSessionShort,
  format12,
  isLiveNow,
  parseTime,
  type DaySchedule,
  type ScheduleState,
} from "../../DoctorSchedule";

// A compact "my hours" widget — a small reimagining of MyHoursCalendar that
// keeps the daily-timings function in a card-sized footprint, reusing the same
// schedule data (scheduleStorage). Four layout variants to choose from.

export type HoursVariant =
  | "week"
  | "today"
  | "agenda"
  | "agendaBars"
  | "agendaChips"
  | "timeline";

const WD = ["M", "T", "W", "T", "F", "S", "S"];
const DAY_LABEL = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
// Timeline window: 8 AM – 9 PM.
const TL_START = 8 * 60;
const TL_END = 21 * 60;

export type HoursWidgetProps = {
  variant?: HoursVariant;
  /** Reference "now" — defaults to today. */
  now?: Date;
  style?: React.CSSProperties;
};

function startOfWeekMonday(d: Date): Date {
  const offset = (d.getDay() + 6) % 7; // 0 = Monday
  return new Date(d.getFullYear(), d.getMonth(), d.getDate() - offset);
}

function dayMinutes(day: DaySchedule): number {
  if (day.off) return 0;
  return day.sessions.reduce((sum, s) => {
    const a = parseTime(s.start);
    const b = parseTime(s.end);
    return sum + (b.h * 60 + b.m - (a.h * 60 + a.m));
  }, 0);
}

/** Heatmap fill for a day's workload (mirrors MyHoursCalendar's intensity). */
function intensityFill(minutes: number): string {
  if (minutes <= 0) return colors.neutral150;
  if (minutes <= 120) return colors.primary100;
  if (minutes <= 240) return colors.primary200;
  if (minutes <= 360) return colors.primary300;
  return colors.primary400;
}

function mins(t: string): number {
  const { h, m } = parseTime(t);
  return h * 60 + m;
}

// Tight session label that fits one agenda line: "9a–12p", "5–8p" (a/p suffix,
// dropped on the start when both ends share a period).
function shortSession(start: string, end: string): string {
  const a = parseTime(start);
  const b = parseTime(end);
  const suf = (h: number) => (h >= 12 ? "p" : "a");
  const h12 = (h: number) => (h % 12 === 0 ? 12 : h % 12);
  const num = (h: number, m: number) => (m === 0 ? `${h12(h)}` : `${h12(h)}:${String(m).padStart(2, "0")}`);
  return suf(a.h) === suf(b.h)
    ? `${num(a.h, a.m)}–${num(b.h, b.m)}${suf(b.h)}`
    : `${num(a.h, a.m)}${suf(a.h)}–${num(b.h, b.m)}${suf(b.h)}`;
}

function compactDaySummary(day: DaySchedule): string {
  if (day.off || day.sessions.length === 0) return "Off";
  return day.sessions.map((s) => shortSession(s.start, s.end)).join(" · ");
}

export function HoursWidget({ variant = "week", now = new Date(), style }: HoursWidgetProps) {
  const [state] = useState<ScheduleState>(() => loadSchedule());
  const monday = startOfWeekMonday(now);
  const week = Array.from({ length: 7 }, (_, i) =>
    new Date(monday.getFullYear(), monday.getMonth(), monday.getDate() + i)
  );
  const todayIdx = (now.getDay() + 6) % 7;
  const today = scheduleForDate(state, now);
  const liveNow = isLiveNow(today, now);

  return (
    <Card variant="surface" elevation="raised" padding="s" style={{ ...styles.card, ...style }}>
      {variant === "week" && <WeekView state={state} week={week} todayIdx={todayIdx} now={now} liveNow={liveNow} />}
      {variant === "today" && <TodayView today={today} now={now} liveNow={liveNow} state={state} week={week} todayIdx={todayIdx} />}
      {variant === "agenda" && <AgendaView state={state} week={week} todayIdx={todayIdx} liveNow={liveNow} mode="text" />}
      {variant === "agendaBars" && <AgendaView state={state} week={week} todayIdx={todayIdx} liveNow={liveNow} mode="bars" />}
      {variant === "agendaChips" && <AgendaView state={state} week={week} todayIdx={todayIdx} liveNow={liveNow} mode="chips" />}
      {variant === "timeline" && <TimelineView today={today} now={now} liveNow={liveNow} />}
    </Card>
  );
}

// ─── Header ──────────────────────────────────────────────────────────────────
function Header({ title, liveNow }: { title: string; liveNow: boolean }) {
  return (
    <div style={styles.header}>
      <span style={styles.title}>{title}</span>
      {liveNow && (
        <span style={styles.live}>
          <Icon name="status-dot" size={12} color={colors.primary600} />
          in clinic
        </span>
      )}
    </div>
  );
}

// ─── Variant: week heatmap strip + selected day's timings ──────────────────────
function WeekView({
  state,
  week,
  todayIdx,
  liveNow,
}: {
  state: ScheduleState;
  week: Date[];
  todayIdx: number;
  now: Date;
  liveNow: boolean;
}) {
  const [sel, setSel] = useState(todayIdx);
  const selDate = week[sel];
  const selDay = scheduleForDate(state, selDate);
  const selLabel =
    sel === todayIdx ? "Today" : selDate.toLocaleDateString("en-GB", { weekday: "short", day: "numeric" });
  return (
    <>
      <Header title="My hours" liveNow={liveNow} />
      <div style={styles.strip}>
        {week.map((d, i) => {
          const day = scheduleForDate(state, d);
          const fill = intensityFill(dayMinutes(day));
          const isToday = i === todayIdx;
          const isSel = i === sel;
          return (
            <button
              key={i}
              data-no-drag
              onClick={() => setSel(i)}
              style={styles.cellBtn}
              title={`${DAY_LABEL[i]} · ${formatDaySummary(day)}`}
            >
              <span style={{ ...styles.wd, color: isToday ? colors.primary600 : colors.neutral500 }}>{WD[i]}</span>
              <span
                style={{
                  ...styles.cell,
                  backgroundColor: fill,
                  border: isSel
                    ? `${strokes.m} solid ${colors.primary600}`
                    : isToday
                    ? `${strokes.s} solid ${colors.primary400}`
                    : `${strokes.xs} solid transparent`,
                }}
              >
                {d.getDate()}
              </span>
            </button>
          );
        })}
      </div>
      <div style={styles.hours}>
        <Icon name="clock" size={14} tone="muted" />
        <span style={styles.hoursLabel}>{selLabel}</span>
        <span style={styles.hoursValue}>{formatDaySummary(selDay)}</span>
      </div>
    </>
  );
}

// ─── Variant: today hero — each session as a row, tomorrow hint ────────────────
function TodayView({
  today,
  now,
  liveNow,
  state,
  week,
  todayIdx,
}: {
  today: DaySchedule;
  now: Date;
  liveNow: boolean;
  state: ScheduleState;
  week: Date[];
  todayIdx: number;
}) {
  const tomorrow = week[(todayIdx + 1) % 7];
  const tomorrowDay = scheduleForDate(state, tomorrow);
  return (
    <>
      <Header title={now.toLocaleDateString("en-GB", { weekday: "long" })} liveNow={liveNow} />
      <div style={styles.todayBody}>
        {today.off || today.sessions.length === 0 ? (
          <span style={styles.offBig}>Off today</span>
        ) : (
          today.sessions.map((s, i) => (
            <div key={i} style={styles.sessionRow}>
              <span style={styles.sessionDot} />
              <span style={styles.sessionTime}>
                {format12(s.start)} – {format12(s.end)}
              </span>
            </div>
          ))
        )}
      </div>
      <div style={styles.hours}>
        <Icon name="arrow-right" size={13} tone="muted" />
        <span style={styles.hoursLabel}>Tomorrow</span>
        <span style={styles.hoursValue}>{formatDaySummary(tomorrowDay)}</span>
      </div>
    </>
  );
}

// Mini per-day timeline bar (8a–9p) used by the agendaBars mode.
function MiniTrack({ day }: { day: DaySchedule }) {
  const span = TL_END - TL_START;
  const pct = (m: number) => Math.max(0, Math.min(100, ((m - TL_START) / span) * 100));
  return (
    <div style={styles.miniTrack}>
      {!day.off &&
        day.sessions.map((s, i) => {
          const l = pct(mins(s.start));
          const r = pct(mins(s.end));
          return <span key={i} style={{ ...styles.miniBlock, left: `${l}%`, width: `${r - l}%` }} />;
        })}
    </div>
  );
}

// ─── Variant: week agenda — every day listed; mode sets the right-hand read ────
//   text  — "9–12 · 5–8 PM"      bars — a labelled mini timeline      chips — pills
function AgendaView({
  state,
  week,
  todayIdx,
  liveNow,
  mode,
}: {
  state: ScheduleState;
  week: Date[];
  todayIdx: number;
  liveNow: boolean;
  mode: "text" | "bars" | "chips";
}) {
  return (
    <>
      <Header title="This week" liveNow={liveNow} />
      <div style={styles.agenda}>
        {week.map((d, i) => {
          const day = scheduleForDate(state, d);
          const isToday = i === todayIdx;
          const off = day.off || day.sessions.length === 0;
          return (
            <div key={i} style={{ ...styles.agendaRow, ...(isToday ? styles.agendaToday : null) }}>
              {mode === "text" && (
                <span
                  style={{
                    ...styles.agendaDot,
                    backgroundColor: off ? "transparent" : intensityFill(dayMinutes(day)),
                    border: off ? `${strokes.s} solid ${colors.neutral300}` : "none",
                  }}
                />
              )}
              <span
                style={{
                  ...styles.agendaDay,
                  color: isToday ? colors.primary700 : colors.neutral700,
                  fontWeight: isToday ? fonts.weight.semibold : fonts.weight.medium,
                }}
              >
                {isToday ? "Today" : DAY_LABEL[i]}
              </span>
              {mode === "text" && (
                <span
                  style={{
                    ...styles.agendaHours,
                    color: isToday ? colors.primary700 : off ? colors.neutral400 : colors.neutral800,
                    fontStyle: off ? "italic" : "normal",
                  }}
                >
                  {compactDaySummary(day)}
                </span>
              )}
              {mode === "bars" && <MiniTrack day={day} />}
              {mode === "chips" && (
                <span style={styles.chipRow}>
                  {off ? (
                    <span style={styles.chipOff}>Off</span>
                  ) : (
                    day.sessions.map((s, j) => (
                      <span key={j} style={styles.chip}>
                        {formatSessionShort(s)}
                      </span>
                    ))
                  )}
                </span>
              )}
            </div>
          );
        })}
      </div>
      {mode === "bars" && (
        <div style={styles.miniAxis}>
          <span>8a</span>
          <span>1p</span>
          <span>9p</span>
        </div>
      )}
    </>
  );
}

// ─── Variant: today timeline — sessions on an 8a–9p bar with a now marker ──────
function TimelineView({ today, now, liveNow }: { today: DaySchedule; now: Date; liveNow: boolean }) {
  const span = TL_END - TL_START;
  const pct = (m: number) => `${Math.max(0, Math.min(100, ((m - TL_START) / span) * 100))}%`;
  const nowM = now.getHours() * 60 + now.getMinutes();
  const nowIn = nowM >= TL_START && nowM <= TL_END;
  return (
    <>
      <Header title={now.toLocaleDateString("en-GB", { weekday: "long" })} liveNow={liveNow} />
      <div style={styles.tlWrap}>
        <div style={styles.tlTrack}>
          {!today.off &&
            today.sessions.map((s, i) => (
              <span
                key={i}
                style={{
                  ...styles.tlBlock,
                  left: pct(mins(s.start)),
                  width: `calc(${pct(mins(s.end))} - ${pct(mins(s.start))})`,
                }}
              />
            ))}
          {nowIn && <span style={{ ...styles.tlNow, left: pct(nowM) }} />}
        </div>
        <div style={styles.tlAxis}>
          <span>8a</span>
          <span>1p</span>
          <span>9p</span>
        </div>
      </div>
      <div style={styles.hours}>
        <Icon name="clock" size={14} tone="muted" />
        <span style={styles.hoursValue}>{formatDaySummary(today)}</span>
      </div>
    </>
  );
}

const styles: Record<string, React.CSSProperties> = {
  card: { height: "100%", boxSizing: "border-box", display: "flex", flexDirection: "column" },
  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.xs,
  },
  title: {
    fontFamily: fonts.family.primary,
    fontSize: fonts.size.s,
    fontWeight: fonts.weight.semibold,
    color: colors.neutral900,
  },
  live: {
    display: "inline-flex",
    alignItems: "center",
    gap: spacing["3xs"],
    fontSize: fonts.size.caption,
    color: colors.primary600,
  },

  // week
  strip: {
    display: "grid",
    gridTemplateColumns: "repeat(7, 1fr)",
    gap: "4px",
    flex: 1,
    alignContent: "center",
  },
  cellBtn: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "3px",
    border: "none",
    background: "transparent",
    cursor: "pointer",
    padding: 0,
  },
  wd: { fontSize: fonts.size.caption, fontFamily: fonts.family.primary },
  cell: {
    width: "100%",
    aspectRatio: "1 / 1",
    maxWidth: 26,
    borderRadius: radii.s,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: fonts.size.caption,
    color: colors.neutral900,
    boxSizing: "border-box",
  },

  // today hero
  todayBody: { flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", gap: spacing.xs },
  sessionRow: { display: "flex", alignItems: "center", gap: spacing.xs },
  sessionDot: {
    width: 8,
    height: 8,
    borderRadius: radii.pill,
    backgroundColor: colors.primary400,
    flexShrink: 0,
  },
  sessionTime: { fontSize: fonts.size.m, fontWeight: fonts.weight.medium, color: colors.neutral900 },
  offBig: { fontSize: fonts.size.m, color: colors.neutral400 },

  // agenda — rows flow from just under the header (no vertical centering),
  // the card's own padding provides the gap at the end.
  agenda: { display: "flex", flexDirection: "column", flex: 1 },
  agendaRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-start",
    gap: spacing.xs,
    padding: "3px 8px",
    borderRadius: radii.s,
  },
  agendaToday: { backgroundColor: colors.primary100 },
  agendaDot: {
    width: 7,
    height: 7,
    borderRadius: radii.pill,
    flexShrink: 0,
    boxSizing: "border-box",
  },
  agendaDay: { fontSize: fonts.size.xs, fontWeight: fonts.weight.medium, width: 40, flexShrink: 0 },
  agendaHours: { fontSize: fonts.size.xs, textAlign: "right", marginLeft: "auto", whiteSpace: "nowrap" },
  // agendaBars mini timeline
  miniTrack: {
    position: "relative",
    flex: 1,
    height: 8,
    borderRadius: radii.pill,
    backgroundColor: colors.neutral150,
  },
  miniBlock: {
    position: "absolute",
    top: 0,
    height: "100%",
    backgroundColor: colors.primary400,
    borderRadius: radii.pill,
  },
  miniAxis: {
    display: "flex",
    justifyContent: "space-between",
    fontSize: fonts.size.caption,
    color: colors.neutral500,
    paddingLeft: 58,
    paddingRight: 6,
    marginTop: 4,
  },
  // agendaChips pills
  chipRow: { flex: 1, display: "flex", gap: 4, justifyContent: "flex-end", flexWrap: "wrap" },
  chip: {
    fontSize: fonts.size.caption,
    backgroundColor: colors.primary100,
    color: colors.primary700,
    padding: "1px 6px",
    borderRadius: radii.pill,
    whiteSpace: "nowrap",
  },
  chipOff: { fontSize: fonts.size.caption, color: colors.neutral400 },

  // timeline
  tlWrap: { flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", gap: spacing["2xs"] },
  tlTrack: {
    position: "relative",
    height: 12,
    borderRadius: radii.pill,
    backgroundColor: colors.neutral150,
    overflow: "visible",
  },
  tlBlock: {
    position: "absolute",
    top: 0,
    height: "100%",
    backgroundColor: colors.primary400,
    borderRadius: radii.pill,
  },
  tlNow: {
    position: "absolute",
    top: "-3px",
    width: 2,
    height: 18,
    backgroundColor: colors.primary700,
    borderRadius: radii.pill,
  },
  tlAxis: {
    display: "flex",
    justifyContent: "space-between",
    fontSize: fonts.size.caption,
    color: colors.neutral500,
  },

  // shared footer line
  hours: {
    marginTop: spacing.xs,
    paddingTop: spacing.xs,
    borderTop: `${strokes.xs} solid ${colors.neutral200}`,
    display: "flex",
    alignItems: "center",
    gap: spacing["3xs"],
    fontSize: fonts.size.xs,
  },
  hoursLabel: { color: colors.neutral500 },
  hoursValue: { color: colors.neutral900, fontWeight: fonts.weight.medium },
};
