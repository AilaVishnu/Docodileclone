import React, { useEffect, useState } from "react";
import { colors } from "../../styles/theme";
import { DaySchedule, parseTime, scheduleForDate, loadSchedule } from "../DoctorSchedule";

// ─────────────────────────────────────────────────────────────────────────────
// AnalogClock — circular face with shaded wedges for today's working sessions.
// 12-hour clock; wedges placed by hour-of-day and respect AM/PM independently
// (AM session 9–12 and PM session 5–8 render at distinct dial positions, so
// in practice they don't visually collide for typical clinic schedules).
// Hands tick smoothly; the second hand sweeps via 1-Hz state updates.
// ─────────────────────────────────────────────────────────────────────────────

type AnalogClockProps = {
  size?: number;
};

const HOUR_DEG = 360 / 12; // 30° per hour
const SVG_VIEWBOX = 200;   // internal coordinate system
const CENTER = SVG_VIEWBOX / 2;

function hourToAngle(h: number, m: number = 0): number {
  // 12 o'clock = 0°, increasing clockwise. Each hour = 30°, each minute = 0.5°
  return ((h % 12) * 60 + m) * 0.5;
}

function polar(angleDeg: number, radius: number): { x: number; y: number } {
  // 0° points up; convert to standard polar (counterclockwise from +x axis)
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return { x: CENTER + radius * Math.cos(rad), y: CENTER + radius * Math.sin(rad) };
}

function describeWedge(startH: number, startM: number, endH: number, endM: number, radius: number): string {
  const a1 = hourToAngle(startH, startM);
  const a2 = hourToAngle(endH, endM);
  const start = polar(a1, radius);
  const end = polar(a2, radius);
  const sweep = (a2 - a1 + 360) % 360;
  const largeArc = sweep > 180 ? 1 : 0;
  return `M ${CENTER} ${CENTER} L ${start.x} ${start.y} A ${radius} ${radius} 0 ${largeArc} 1 ${end.x} ${end.y} Z`;
}

function todaySessionsAsWedges(day: DaySchedule): { d: string; isAm: boolean }[] {
  if (day.off || day.sessions.length === 0) return [];
  const out: { d: string; isAm: boolean }[] = [];
  const r = 92; // wedge radius (face is 100; leave a little ring)
  for (const s of day.sessions) {
    const a = parseTime(s.start);
    const b = parseTime(s.end);
    // Split sessions that cross noon so AM and PM portions render correctly
    const crossesNoon = a.h < 12 && b.h >= 12;
    if (crossesNoon) {
      out.push({ d: describeWedge(a.h, a.m, 12, 0, r), isAm: true });
      out.push({ d: describeWedge(0, 0, b.h - 12, b.m, r), isAm: false });
    } else {
      const isAm = a.h < 12;
      const sh = a.h % 12;
      const eh = b.h % 12 === 0 ? 12 : b.h % 12;
      out.push({ d: describeWedge(sh, a.m, eh, b.m, r), isAm });
    }
  }
  return out;
}

export function AnalogClock({ size = 190 }: AnalogClockProps) {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const state = loadSchedule();
  const today = scheduleForDate(state, now);
  const wedges = todaySessionsAsWedges(today);

  const hours = now.getHours();
  const mins = now.getMinutes();
  const secs = now.getSeconds() + now.getMilliseconds() / 1000;

  const hourAngle = hourToAngle(hours, mins);
  const minuteAngle = (mins + secs / 60) * 6;
  const secondAngle = secs * 6;

  // Hour markers (12 ticks)
  const ticks = Array.from({ length: 12 }, (_, i) => {
    const angle = i * HOUR_DEG;
    const outer = polar(angle, 94);
    const inner = polar(angle, i % 3 === 0 ? 82 : 86);
    return (
      <line
        key={i}
        x1={inner.x}
        y1={inner.y}
        x2={outer.x}
        y2={outer.y}
        stroke={i % 3 === 0 ? colors.neutral800 : colors.neutral400}
        strokeWidth={i % 3 === 0 ? 2 : 1}
        strokeLinecap="round"
      />
    );
  });

  return (
    <div
      style={{
        width: `${size}px`,
        height: `${size}px`,
        position: "relative",
      }}
    >
      <svg
        viewBox={`0 0 ${SVG_VIEWBOX} ${SVG_VIEWBOX}`}
        width={size}
        height={size}
        style={{ display: "block" }}
      >
        {/* Outer ring */}
        <circle
          cx={CENTER}
          cy={CENTER}
          r={96}
          fill={colors.primary100}
          stroke={colors.primary500}
          strokeWidth={6}
        />

        {/* Working-hour wedges */}
        {wedges.map((w, i) => (
          <path
            key={i}
            d={w.d}
            fill={w.isAm ? colors.primary300 : colors.primary500}
            opacity={w.isAm ? 0.55 : 0.7}
          />
        ))}

        {/* Inner face (covers wedge points so they read as a ring) */}
        <circle cx={CENTER} cy={CENTER} r={32} fill={colors.primary100} />

        {/* Hour ticks */}
        {ticks}

        {/* Hour hand */}
        <line
          x1={CENTER}
          y1={CENTER}
          x2={polar(hourAngle, 52).x}
          y2={polar(hourAngle, 52).y}
          stroke={colors.neutral900}
          strokeWidth={4}
          strokeLinecap="round"
        />

        {/* Minute hand */}
        <line
          x1={CENTER}
          y1={CENTER}
          x2={polar(minuteAngle, 76).x}
          y2={polar(minuteAngle, 76).y}
          stroke={colors.neutral900}
          strokeWidth={3}
          strokeLinecap="round"
        />

        {/* Second hand */}
        <line
          x1={CENTER}
          y1={CENTER + 6}
          x2={polar(secondAngle, 84).x}
          y2={polar(secondAngle, 84).y}
          stroke={colors.primary700}
          strokeWidth={1.4}
          strokeLinecap="round"
          style={{
            transformOrigin: `${CENTER}px ${CENTER}px`,
            transition: secs < 0.1 ? "none" : "transform 0.95s cubic-bezier(0.4, 2.2, 0.6, 1)",
          }}
        />

        {/* Center cap */}
        <circle cx={CENTER} cy={CENTER} r={4.5} fill={colors.neutral900} />
        <circle cx={CENTER} cy={CENTER} r={2} fill={colors.primary100} />
      </svg>
    </div>
  );
}
