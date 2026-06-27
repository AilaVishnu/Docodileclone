import React from "react";
import { colors, fonts } from "../../styles/theme";
import { cardSurface } from "../Card/Card.styles";
import { loadSchedule, weekHourRange } from "../DoctorSchedule";

type HeatmapAppointment = {
  rawScheduledTime?: string;
  status?: string;
};

type HeatmapCardProps = {
  appointments: HeatmapAppointment[];
  /** Optional override; if absent, derived from doctor's saved schedule. */
  startHour?: number;
  endHour?: number;
  /** Date the heatmap represents — drives the subtitle so past/future
   *  queue views read accurately instead of always saying "Today's". */
  date?: Date;
};

function deriveRangeFromSchedule() {
  try {
    const state = loadSchedule();
    if (!state.configured) return { startHour: 9, endHour: 21 };
    return weekHourRange(state.default);
  } catch {
    return { startHour: 9, endHour: 21 };
  }
}

const QUARTER_LABELS = [":00", ":15", ":30", ":45"];

function buildGrid(
  appointments: HeatmapAppointment[],
  startHour: number,
  endHour: number
) {
  const hours = endHour - startHour;
  const grid: number[][] = Array.from({ length: hours }, () => [0, 0, 0, 0]);
  appointments.forEach((a) => {
    if (!a.rawScheduledTime) return;
    if (a.status === "CANCELLED") return;
    const d = new Date(a.rawScheduledTime);
    const h = d.getHours();
    const m = d.getMinutes();
    if (h < startHour || h >= endHour) return;
    grid[h - startHour][Math.floor(m / 15)] += 1;
  });
  return grid;
}

function cellColor(count: number) {
  if (count === 0) return colors.primary200;
  if (count === 1) return colors.primary400;
  if (count === 2) return colors.primary600;
  return colors.primary800;
}

function formatHourLabel(h: number) {
  const period = h >= 12 ? "PM" : "AM";
  const display = h % 12 === 0 ? 12 : h % 12;
  return `${display} ${period}`;
}

export function HeatmapCard({
  appointments,
  startHour,
  endHour,
  date,
}: HeatmapCardProps) {
  const fallback = deriveRangeFromSchedule();
  let sh = startHour ?? fallback.startHour;
  let eh = endHour ?? fallback.endHour;
  // Expand the range to cover any bookings outside the configured clinic
  // hours (e.g. a late / after-hours appointment) — otherwise buildGrid drops
  // them (h >= endHour) and the card wrongly reads "No bookings".
  const apptHours = appointments
    .filter((a) => a.rawScheduledTime && a.status !== "CANCELLED")
    .map((a) => new Date(a.rawScheduledTime as string).getHours())
    .filter((h) => Number.isFinite(h));
  if (apptHours.length) {
    sh = Math.min(sh, ...apptHours);
    eh = Math.max(eh, ...apptHours.map((h) => h + 1)); // eh is exclusive
  }
  const grid = buildGrid(appointments, sh, eh);
  const total = grid.reduce(
    (sum, row) => sum + row.reduce((a, b) => a + b, 0),
    0
  );

  // Build a context label that matches the queue date the heatmap was
  // computed for — "today" only when the parent passed today's date.
  const today = new Date();
  const isToday = date ? (
    date.getFullYear() === today.getFullYear()
      && date.getMonth() === today.getMonth()
      && date.getDate() === today.getDate()
  ) : true;
  const dayLabel = !date ? "Today's"
    : isToday ? "Today's"
    : date.toLocaleDateString("en-GB", { day: "2-digit", month: "short" });
  const subtitle = total > 0
    ? `${dayLabel} bookings, by 15-min slot`
    : `No bookings on ${dayLabel.replace(/'s$/, "")}`;

  return (
    <div style={styles.container}>
      <p style={styles.title}>Peak Hours</p>
      <p style={styles.subtitle}>{subtitle}</p>

      <div style={styles.divider} />

      <div style={styles.headerRow}>
        <span />
        {QUARTER_LABELS.map((q) => (
          <span key={q} style={styles.headerCell}>
            {q}
          </span>
        ))}
      </div>

      <div style={styles.grid}>
        {grid.map((row, rowIdx) => {
          const hour = sh + rowIdx;
          return (
            <div key={hour} style={styles.row}>
              <span style={styles.hourLabel}>{formatHourLabel(hour)}</span>
              {row.map((count, colIdx) => (
                <div
                  key={colIdx}
                  style={{ ...styles.cell, backgroundColor: cellColor(count) }}
                  title={`${formatHourLabel(hour)}${QUARTER_LABELS[colIdx]} — ${count} appointment${count === 1 ? "" : "s"}`}
                />
              ))}
            </div>
          );
        })}
      </div>

      <div style={styles.legendRow}>
        <span style={styles.legendLabel}>Less</span>
        <div style={{ ...styles.legendCell, backgroundColor: colors.primary200 }} />
        <div style={{ ...styles.legendCell, backgroundColor: colors.primary400 }} />
        <div style={{ ...styles.legendCell, backgroundColor: colors.primary600 }} />
        <div style={{ ...styles.legendCell, backgroundColor: colors.primary800 }} />
        <span style={styles.legendLabel}>More</span>
      </div>
    </div>
  );
}

const GRID_TEMPLATE = "36px repeat(4, 1fr)";

const styles: Record<string, React.CSSProperties> = {
  container: {
    // Cream queue surface — shared with DoctorStatusCard via cardSurface
    // (was borderRadius "20px" literal → 16).
    ...cardSurface("cream", "none"),
    // Vertical 20 fixed, horizontal var-driven so it matches the doctor card.
    padding: "20px var(--queue-side-padx, 20px)",
    width: "var(--queue-side-w, 246px)",
    boxSizing: "border-box",
    marginTop: "16px",
    display: "flex",
    flexDirection: "column",
  },
  title: {
    fontFamily: fonts.family.primary,
    fontSize: fonts.size.m,
    fontWeight: 600,
    color: colors.neutral900,
    margin: 0,
    textAlign: "center",
  },
  subtitle: {
    fontFamily: fonts.family.primary,
    fontSize: fonts.size.xs,
    color: colors.neutral600,
    margin: "4px 0 0",
    textAlign: "center",
  },
  divider: {
    height: "1px",
    backgroundColor: colors.primary300,
    margin: "12px 0",
  },
  headerRow: {
    display: "grid",
    gridTemplateColumns: GRID_TEMPLATE,
    columnGap: "3px",
    marginBottom: "4px",
  },
  headerCell: {
    fontFamily: fonts.family.primary,
    fontSize: "9px",
    color: colors.neutral500,
    textAlign: "center",
  },
  grid: {
    display: "flex",
    flexDirection: "column",
    gap: "3px",
  },
  row: {
    display: "grid",
    gridTemplateColumns: GRID_TEMPLATE,
    columnGap: "3px",
    alignItems: "center",
  },
  hourLabel: {
    fontFamily: fonts.family.primary,
    fontSize: "10px",
    color: colors.neutral700,
    textAlign: "right",
    paddingRight: "4px",
    lineHeight: 1,
  },
  cell: {
    height: "20px",
    borderRadius: "3px",
  },
  legendRow: {
    display: "flex",
    alignItems: "center",
    gap: "3px",
    justifyContent: "center",
    marginTop: "12px",
  },
  legendLabel: {
    fontFamily: fonts.family.primary,
    fontSize: "9px",
    color: colors.neutral500,
  },
  legendCell: {
    width: "10px",
    height: "10px",
    borderRadius: "2px",
  },
};
