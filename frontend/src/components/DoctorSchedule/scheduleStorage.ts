// ─────────────────────────────────────────────────────────────────────────────
// DoctorSchedule storage — localStorage-backed for v1.
// Backend-ready shape: when the API is ready, swap localStorage for fetch().
//   GET    /api/tenant/clinics/{clinicId}/staff/{staffId}/availability
//   PUT    /api/tenant/clinics/{clinicId}/staff/{staffId}/availability
// ─────────────────────────────────────────────────────────────────────────────

export type DayKey = "mon" | "tue" | "wed" | "thu" | "fri" | "sat" | "sun";

export const DAY_KEYS: DayKey[] = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];

export const DAY_SHORT: Record<DayKey, string> = {
  mon: "Mon",
  tue: "Tue",
  wed: "Wed",
  thu: "Thu",
  fri: "Fri",
  sat: "Sat",
  sun: "Sun",
};

export const DAY_LONG: Record<DayKey, string> = {
  mon: "Monday",
  tue: "Tuesday",
  wed: "Wednesday",
  thu: "Thursday",
  fri: "Friday",
  sat: "Saturday",
  sun: "Sunday",
};

/** "HH:MM" 24-hour format. */
export type Time24 = string;

export type Session = { start: Time24; end: Time24 };

export type DaySchedule = {
  off: boolean;
  sessions: Session[]; // empty when off, 1 or 2 entries otherwise
};

export type WeekSchedule = Record<DayKey, DaySchedule>;

export type ScheduleState = {
  /** Recurring weekly default. */
  default: WeekSchedule;
  /** YYYY-MM-DD → one-off override that supersedes the default. */
  overrides: Record<string, DaySchedule>;
  /** false until the user picks a preset or saves manually. */
  configured: boolean;
};

// ─── Defaults & presets ──────────────────────────────────────────────────────

const STORAGE_KEY = "docodile_schedule";

const blankDay = (): DaySchedule => ({ off: true, sessions: [] });

const dayOf = (start: Time24, end: Time24): DaySchedule => ({
  off: false,
  sessions: [{ start, end }],
});

const dayOfTwo = (s1: Session, s2: Session): DaySchedule => ({
  off: false,
  sessions: [s1, s2],
});

const weekFrom = (mon: DaySchedule, sat: DaySchedule, sun: DaySchedule): WeekSchedule => ({
  mon,
  tue: { ...mon },
  wed: { ...mon },
  thu: { ...mon },
  fri: { ...mon },
  sat,
  sun,
});

export const PRESETS = [
  {
    id: "evening",
    icon: "🌆",
    label: "Evening clinic",
    summary: "Mon–Sat · 5 – 8 PM",
    week: weekFrom(dayOf("17:00", "20:00"), dayOf("17:00", "20:00"), blankDay()),
  },
  {
    id: "morning-evening",
    icon: "🌅",
    label: "Morning + Evening",
    summary: "Mon–Sat · 9–12, 5–8",
    week: weekFrom(
      dayOfTwo({ start: "09:00", end: "12:00" }, { start: "17:00", end: "20:00" }),
      dayOfTwo({ start: "09:00", end: "12:00" }, { start: "17:00", end: "20:00" }),
      blankDay()
    ),
  },
  {
    id: "weekdays-9-6",
    icon: "💼",
    label: "Weekdays 9–6",
    summary: "Mon–Fri · 9 AM – 6 PM",
    week: {
      mon: dayOf("09:00", "18:00"),
      tue: dayOf("09:00", "18:00"),
      wed: dayOf("09:00", "18:00"),
      thu: dayOf("09:00", "18:00"),
      fri: dayOf("09:00", "18:00"),
      sat: blankDay(),
      sun: blankDay(),
    },
  },
] as const;

const emptyWeek = (): WeekSchedule => ({
  mon: blankDay(),
  tue: blankDay(),
  wed: blankDay(),
  thu: blankDay(),
  fri: blankDay(),
  sat: blankDay(),
  sun: blankDay(),
});

const defaultState = (): ScheduleState => ({
  default: emptyWeek(),
  overrides: {},
  configured: false,
});

// ─── Persistence ─────────────────────────────────────────────────────────────

export function loadSchedule(): ScheduleState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultState();
    const parsed = JSON.parse(raw) as ScheduleState;
    // Defensive: ensure all 7 days present
    for (const k of DAY_KEYS) {
      if (!parsed.default[k]) parsed.default[k] = blankDay();
    }
    if (!parsed.overrides) parsed.overrides = {};
    return parsed;
  } catch {
    return defaultState();
  }
}

export function saveSchedule(state: ScheduleState) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

// ─── Queries ─────────────────────────────────────────────────────────────────

const JS_DAY_TO_KEY: DayKey[] = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];

export function dayKeyFor(date: Date): DayKey {
  return JS_DAY_TO_KEY[date.getDay()];
}

export function isoDateFor(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/** Schedule for a specific date — applies override if present, else weekly default. */
export function scheduleForDate(state: ScheduleState, date: Date): DaySchedule {
  const iso = isoDateFor(date);
  if (state.overrides[iso]) return state.overrides[iso];
  return state.default[dayKeyFor(date)];
}

export function hasOverride(state: ScheduleState, date: Date): boolean {
  return Boolean(state.overrides[isoDateFor(date)]);
}

// ─── Time utilities ──────────────────────────────────────────────────────────

/** "17:00" → { h: 17, m: 0 } */
export function parseTime(t: Time24): { h: number; m: number } {
  const [h, m] = t.split(":").map(Number);
  return { h, m };
}

/** 17.5 → "17:30" (rounds to 15-min). */
export function formatTime24(h: number, m: number): Time24 {
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

/** "17:00" → "5 PM"; "17:30" → "5:30 PM". */
export function format12(t: Time24): string {
  const { h, m } = parseTime(t);
  const period = h >= 12 ? "PM" : "AM";
  const display = h % 12 === 0 ? 12 : h % 12;
  return m === 0 ? `${display} ${period}` : `${display}:${String(m).padStart(2, "0")} ${period}`;
}

/** "17:00"–"20:00" → "5–8 PM" (or "5 PM–1 AM" across boundary). */
export function formatSessionShort(s: Session): string {
  const start = parseTime(s.start);
  const end = parseTime(s.end);
  const startPeriod = start.h >= 12 ? "PM" : "AM";
  const endPeriod = end.h >= 12 ? "PM" : "AM";
  const startH = start.h % 12 === 0 ? 12 : start.h % 12;
  const endH = end.h % 12 === 0 ? 12 : end.h % 12;
  const startMin = start.m === 0 ? "" : `:${String(start.m).padStart(2, "0")}`;
  const endMin = end.m === 0 ? "" : `:${String(end.m).padStart(2, "0")}`;
  if (startPeriod === endPeriod) {
    return `${startH}${startMin}–${endH}${endMin} ${endPeriod}`;
  }
  return `${startH}${startMin} ${startPeriod}–${endH}${endMin} ${endPeriod}`;
}

/** Compact summary for a day chip: "Off" | "5–8 PM" | "9–12 · 5–8" */
export function formatDaySummary(day: DaySchedule): string {
  if (day.off || day.sessions.length === 0) return "Off";
  if (day.sessions.length === 1) return formatSessionShort(day.sessions[0]);
  // Multi-session: show without periods to keep compact
  return day.sessions.map(formatSessionShort).join(" · ");
}

/** Returns true if `now` is inside any session of the given day. */
export function isLiveNow(day: DaySchedule, now: Date): boolean {
  if (day.off) return false;
  const minutes = now.getHours() * 60 + now.getMinutes();
  return day.sessions.some((s) => {
    const a = parseTime(s.start);
    const b = parseTime(s.end);
    const start = a.h * 60 + a.m;
    const end = b.h * 60 + b.m;
    return minutes >= start && minutes < end;
  });
}

/** Min/max hour spanned by a week (used to size the heatmap). */
export function weekHourRange(week: WeekSchedule): { startHour: number; endHour: number } {
  let minH = 24;
  let maxH = 0;
  for (const k of DAY_KEYS) {
    const d = week[k];
    if (d.off) continue;
    for (const s of d.sessions) {
      minH = Math.min(minH, parseTime(s.start).h);
      const e = parseTime(s.end);
      // Round up to next hour if there are minutes
      maxH = Math.max(maxH, e.m === 0 ? e.h : e.h + 1);
    }
  }
  if (minH === 24 && maxH === 0) return { startHour: 9, endHour: 21 };
  return { startHour: minH, endHour: maxH };
}
