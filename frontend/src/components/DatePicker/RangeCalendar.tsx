import React, { useState } from "react";
import { styles } from "./DatePicker.styles";
import { ChevronDown } from "../icons/ChevronDown";
import { colors, fonts } from "../../styles/theme";

// RangeCalendar — a start→end variant of the standard DatePicker calendar. It
// reuses DatePicker.styles so it looks identical to the single-date picker; the
// only additions are the in-between range fill, two endpoints, and a Done
// button that's enabled once both ends are chosen. Click a start date, then an
// end date (clicking earlier than the start swaps them).
const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const MONTHS_SHORT = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const fmt = (d: Date) => `${d.getDate()} ${MONTHS_SHORT[d.getMonth()]}`;

export function RangeCalendar({ initialStart, initialEnd, onApply }: {
  initialStart?: Date | null;
  initialEnd?: Date | null;
  onApply: (start: Date, end: Date) => void;
}) {
  const base = initialStart ?? new Date();
  const [view, setView] = useState(new Date(base.getFullYear(), base.getMonth(), 1));
  const [start, setStart] = useState<Date | null>(initialStart ?? null);
  const [end, setEnd] = useState<Date | null>(initialEnd ?? null);

  const year = view.getFullYear();
  const month = view.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  let firstDow = new Date(year, month, 1).getDay();
  firstDow = firstDow === 0 ? 6 : firstDow - 1;

  const pick = (d: number) => {
    const day = new Date(year, month, d);
    if (!start || end) { setStart(day); setEnd(null); }
    else if (day < start) { setEnd(start); setStart(day); }
    else setEnd(day);
  };
  const isEnd = (sel: Date | null, d: number) =>
    !!sel && sel.getFullYear() === year && sel.getMonth() === month && sel.getDate() === d;
  const inRange = (d: number) => {
    if (!start || !end) return false;
    const c = new Date(year, month, d);
    return c > start && c < end;
  };

  const cells: React.ReactNode[] = [];
  for (let i = 0; i < firstDow; i++) cells.push(<div key={`e${i}`} style={styles.emptyCell} />);
  for (let d = 1; d <= daysInMonth; d++) {
    const endpoint = isEnd(start, d) || isEnd(end, d);
    cells.push(
      <div
        key={d}
        onClick={() => pick(d)}
        style={{
          ...styles.dayCell,
          ...(inRange(d) ? { backgroundColor: colors.primary100, borderRadius: 0 } : {}),
          ...(endpoint ? styles.selectedDay : {}),
        }}
      >
        {d}
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <button style={styles.navButton} onClick={() => setView(new Date(year, month - 1, 1))} aria-label="Previous month">
          <span style={{ display: "inline-flex", transform: "rotate(90deg)" }}><ChevronDown size={24} strokeWidth={1.5} color={colors.neutral900} /></span>
        </button>
        <h4 style={styles.monthTitle}>{view.toLocaleString("default", { month: "long", year: "numeric" })}</h4>
        <button style={styles.navButton} onClick={() => setView(new Date(year, month + 1, 1))} aria-label="Next month">
          <span style={{ display: "inline-flex", transform: "rotate(-90deg)" }}><ChevronDown size={24} strokeWidth={1.5} color={colors.neutral900} /></span>
        </button>
      </div>

      <div style={styles.weekDays}>
        {WEEKDAYS.map((w) => <div key={w} style={styles.weekDay}>{w}</div>)}
      </div>
      <div style={styles.daysGrid}>{cells}</div>

      <div style={{ fontSize: fonts.size.xs, color: colors.neutral600 }}>
        {start ? (end ? `${fmt(start)} – ${fmt(end)}` : `${fmt(start)} – pick end date`) : "Pick a start date"}
      </div>
      <button
        style={{ ...styles.doneButton, marginTop: 0, ...(!(start && end) ? { opacity: 0.4, cursor: "default" } : {}) }}
        disabled={!(start && end)}
        onClick={() => { if (start && end) onApply(start, end); }}
      >
        Done
      </button>
    </div>
  );
}
