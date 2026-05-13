// @ts-nocheck — Recharts 3 component types fight TS 4.9 + react-scripts.
// Runtime is fine; the rest of the project remains type-checked.
import React from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  LabelList,
  Pie,
  PieChart,
  PolarAngleAxis,
  RadialBar,
  RadialBarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { colors, fonts, radii } from "../../styles/theme";

// ─── Themed tooltip ──────────────────────────────────────────────────────────

type TooltipRow = { name?: string; label?: string; value: React.ReactNode; color?: string };

function TooltipCard({ title, rows }: { title?: React.ReactNode; rows: TooltipRow[] }) {
  return (
    <div
      style={{
        background: colors.neutral100,
        border: `1px solid ${colors.neutral200}`,
        borderRadius: radii.s,
        padding: "8px 10px",
        boxShadow: "0 8px 24px rgba(0,0,0,0.10)",
        fontFamily: fonts.family.primary,
        fontSize: fonts.size.xs,
        color: colors.neutral900,
        minWidth: 120,
      }}
    >
      {title != null && (
        <div style={{ fontSize: 11, color: colors.neutral500, marginBottom: 4 }}>{title}</div>
      )}
      {rows.map((r, i) => (
        <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, marginTop: i ? 2 : 0 }}>
          {r.color && (
            <span
              style={{ width: 8, height: 8, borderRadius: 2, backgroundColor: r.color, flexShrink: 0 }}
            />
          )}
          <span style={{ color: colors.neutral500, flex: 1 }}>{r.label ?? r.name}</span>
          <span style={{ fontWeight: 600, color: colors.neutral900, fontVariantNumeric: "tabular-nums" }}>
            {r.value}
          </span>
        </div>
      ))}
    </div>
  );
}

// ─── Area trend (footfall, hourly/daily/monthly) ─────────────────────────────
// Visual treatment mirrors shadcn's "Area Chart - Axes" pattern: natural curve,
// flat fill at 0.4 opacity, no vertical grid, axis lines off, sparse Y ticks.
// Adapted to use Docodile design tokens (no Tailwind/CSS-var theming).

type AreaSeries = { key: string; label: string; color: string };

export function AreaTrend({
  data,
  height = 200,
  fmtValue,
  axisLabel,
  series,
}: {
  data: { label: string; value: number; [k: string]: any }[];
  height?: number;
  fmtValue?: (v: number) => string;
  axisLabel?: string;
  series?: AreaSeries[];
}) {
  const fmt = fmtValue ?? ((v: number) => String(v));
  const lastIdx = data.length - 1;

  // Default: single "value" series.
  const ss: AreaSeries[] = series ?? [{ key: "value", label: axisLabel ?? "Value", color: colors.active.shade600 }];
  const stacked = ss.length > 1;

  // Sparse x-axis ticks for long series.
  const ticks = data.length > 14
    ? data.filter((_, i) => i % Math.ceil(data.length / 7) === 0 || i === lastIdx).map((d) => d.label)
    : undefined;

  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data} margin={{ top: 8, right: 12, left: -20, bottom: 0 }}>
        <CartesianGrid vertical={false} stroke={colors.neutral200} />
        <XAxis
          dataKey="label"
          ticks={ticks}
          tick={{ fontSize: 11, fill: colors.neutral500, fontFamily: fonts.family.primary }}
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          interval="preserveStartEnd"
        />
        <YAxis
          tick={{ fontSize: 11, fill: colors.neutral500, fontFamily: fonts.family.primary }}
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          tickCount={3}
          tickFormatter={(v) => fmt(v as number)}
        />
        <Tooltip
          cursor={false}
          content={({ active, payload, label }) =>
            active && payload?.length ? (
              <TooltipCard
                title={label}
                rows={payload.map((p: any) => ({
                  label: ss.find((s) => s.key === p.dataKey)?.label ?? p.dataKey,
                  value: fmt(p.value as number),
                  color: ss.find((s) => s.key === p.dataKey)?.color ?? p.color,
                }))}
              />
            ) : null
          }
        />
        {ss.map((s) => (
          <Area
            key={s.key}
            dataKey={s.key}
            type="natural"
            fill={s.color}
            fillOpacity={0.4}
            stroke={s.color}
            strokeWidth={2}
            stackId={stacked ? "a" : undefined}
            isAnimationActive
          />
        ))}
      </AreaChart>
    </ResponsiveContainer>
  );
}

// ─── Donut (composition, diagnosis mix, payment mix) ─────────────────────────

export type DonutSegment = { label: string; value: number; color: string };

export function ThemedDonut({
  segments,
  total,
  size = 180,
  centerLabel,
  centerValue,
  fmtValue,
}: {
  segments: DonutSegment[];
  total?: number;
  size?: number;
  centerLabel?: string;
  centerValue?: React.ReactNode;
  fmtValue?: (v: number) => string;
}) {
  const sum = total ?? segments.reduce((a, s) => a + s.value, 0);
  const [activeIdx, setActiveIdx] = React.useState<number | null>(null);
  const fmt = fmtValue ?? ((v: number) => v.toLocaleString("en-IN"));
  const inner = Math.round(size * 0.32);
  const outer = Math.round(size / 2 - 6);

  return (
    <div style={{ position: "relative", width: size, height: size }}>
      <ResponsiveContainer width={size} height={size}>
        <PieChart>
          <Pie
            data={segments}
            dataKey="value"
            nameKey="label"
            innerRadius={inner}
            outerRadius={outer}
            paddingAngle={2}
            stroke="none"
            isAnimationActive={false}
            onMouseEnter={(_, idx) => setActiveIdx(idx)}
            onMouseLeave={() => setActiveIdx(null)}
          >
            {segments.map((s, i) => (
              <Cell
                key={i}
                fill={s.color}
                fillOpacity={activeIdx == null || activeIdx === i ? 1 : 0.35}
                style={{ transition: "fill-opacity 160ms" }}
              />
            ))}
          </Pie>
          <Tooltip
            content={({ active, payload }) =>
              active && payload?.length ? (
                <TooltipCard
                  rows={[
                    {
                      label: (payload[0].payload as DonutSegment).label,
                      value: `${fmt(payload[0].value as number)} · ${Math.round(
                        ((payload[0].value as number) / sum) * 100,
                      )}%`,
                      color: (payload[0].payload as DonutSegment).color,
                    },
                  ]}
                />
              ) : null
            }
          />
        </PieChart>
      </ResponsiveContainer>
      {/* Center label */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          pointerEvents: "none",
        }}
      >
        {activeIdx != null ? (
          <>
            <div style={{ fontSize: 11, color: colors.neutral500 }}>{segments[activeIdx].label}</div>
            <div
              style={{
                fontFamily: fonts.family.secondary,
                fontSize: 22,
                color: colors.neutral900,
                lineHeight: 1.1,
              }}
            >
              {fmt(segments[activeIdx].value)}
            </div>
            <div style={{ fontSize: 11, color: colors.neutral500 }}>
              {Math.round((segments[activeIdx].value / sum) * 100)}%
            </div>
          </>
        ) : (
          <>
            {centerLabel && <div style={{ fontSize: 11, color: colors.neutral500 }}>{centerLabel}</div>}
            <div
              style={{
                fontFamily: fonts.family.secondary,
                fontSize: 24,
                color: colors.neutral900,
                lineHeight: 1.1,
              }}
            >
              {centerValue ?? fmt(sum)}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ─── Radial stacked (half-arc gauge with N segments, shadcn pattern) ─────────

export function RadialStacked({
  segments,
  maxTotal,
  centerValue,
  centerLabel,
  size = 220,
}: {
  segments: { key: string; value: number; color: string; label: string }[];
  maxTotal: number;
  centerValue: React.ReactNode;
  centerLabel?: string;
  size?: number;
}) {
  const row = segments.reduce<Record<string, number>>((acc, s) => {
    acc[s.key] = s.value;
    return acc;
  }, {});
  const innerR = Math.round(size * 0.36);
  const outerR = Math.round(size * 0.5);
  // RadialBarChart with endAngle={180} sweeps 0°→180° (top semicircle). The
  // cy still sits at container-center, so we need a full square container for
  // the arc not to clip — then position the center label visually.
  const height = size;
  const fmt = (v: number) => v.toLocaleString("en-IN");

  return (
    <div style={{ position: "relative", width: size, height }}>
      <ResponsiveContainer width={size} height={height}>
        <RadialBarChart
          data={[row]}
          endAngle={180}
          innerRadius={innerR}
          outerRadius={outerR}
          margin={{ top: 0, right: 0, bottom: 0, left: 0 }}
        >
          <PolarAngleAxis type="number" domain={[0, maxTotal]} tick={false} />
          {segments.map((s) => (
            <RadialBar
              key={s.key}
              dataKey={s.key}
              stackId="a"
              cornerRadius={5}
              fill={s.color}
              stroke={colors.neutral100}
              strokeWidth={2}
            />
          ))}
          <Tooltip
            cursor={false}
            content={({ active, payload }) =>
              active && payload?.length ? (
                <TooltipCard
                  rows={payload.map((p: any) => ({
                    label: segments.find((s) => s.key === p.dataKey)?.label ?? p.dataKey,
                    value: fmt(p.value as number),
                    color: segments.find((s) => s.key === p.dataKey)?.color,
                  }))}
                />
              ) : null
            }
          />
        </RadialBarChart>
      </ResponsiveContainer>
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          // Visually center inside the arc — the arc opens downward, so the
          // readable area sits a bit above the geometric cy.
          top: Math.round(size * 0.38),
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          pointerEvents: "none",
        }}
      >
        <div
          style={{
            fontFamily: fonts.family.secondary,
            fontSize: 40,
            color: colors.neutral900,
            lineHeight: 1,
          }}
        >
          {centerValue}
        </div>
        {centerLabel && (
          <div style={{ fontSize: 11, color: colors.neutral500, marginTop: 4 }}>{centerLabel}</div>
        )}
      </div>
    </div>
  );
}

// ─── Radial score (Health) ───────────────────────────────────────────────────

export function RadialScore({
  score,
  size = 180,
  color,
  trackColor = colors.primary100,
}: {
  score: number;
  size?: number;
  color: string;
  trackColor?: string;
}) {
  const data = [{ name: "score", value: score, fill: color }];
  return (
    <div style={{ position: "relative", width: size, height: size }}>
      <ResponsiveContainer width={size} height={size}>
        <RadialBarChart
          innerRadius="74%"
          outerRadius="100%"
          startAngle={90}
          endAngle={90 - 360}
          data={data}
        >
          <PolarAngleAxis type="number" domain={[0, 100]} tick={false} />
          <RadialBar
            dataKey="value"
            cornerRadius={size / 2}
            background={{ fill: trackColor }}
            isAnimationActive
          />
        </RadialBarChart>
      </ResponsiveContainer>
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          pointerEvents: "none",
        }}
      >
        <div
          style={{
            fontFamily: fonts.family.secondary,
            fontSize: 40,
            color: colors.neutral900,
            lineHeight: 1,
          }}
        >
          {score}
        </div>
        <div style={{ fontSize: 11, color: colors.neutral500, marginTop: 2 }}>out of 100</div>
      </div>
    </div>
  );
}

// ─── Bar (horizontal — used for revenue per doctor, top complaints if needed) ─

export function ThemedHorizontalBar({
  data,
  height = 200,
  color = colors.active.shade600,
  fmtValue,
}: {
  data: { label: string; value: number }[];
  height?: number;
  color?: string;
  fmtValue?: (v: number) => string;
}) {
  const fmt = fmtValue ?? ((v: number) => v.toLocaleString("en-IN"));
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} layout="vertical" margin={{ top: 4, right: 36, left: 4, bottom: 0 }}>
        <CartesianGrid stroke={colors.neutral200} horizontal={false} strokeDasharray="2 4" />
        <XAxis type="number" hide />
        <YAxis
          type="category"
          dataKey="label"
          tick={{ fontSize: 12, fill: colors.neutral900, fontFamily: fonts.family.primary }}
          tickLine={false}
          axisLine={false}
          width={140}
        />
        <Tooltip
          cursor={{ fill: colors.alphaBlack0 }}
          content={({ active, payload, label }) =>
            active && payload?.length ? (
              <TooltipCard
                title={label}
                rows={[{ label: "Value", value: fmt(payload[0].value as number), color }]}
              />
            ) : null
          }
        />
        <Bar dataKey="value" fill={color} radius={[4, 4, 4, 4]} barSize={14}>
          <LabelList
            dataKey="value"
            position="right"
            formatter={(v: any) => fmt(v as number)}
            style={{ fontSize: 11, fill: colors.neutral700, fontFamily: fonts.family.primary, fontWeight: 600 }}
          />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

// ─── Inset-label bar (shadcn "Custom Label" pattern) ─────────────────────────
// Horizontal bar, hidden axes, two LabelLists: category name printed INSIDE
// the bar at the left in contrast color, numeric value OUTSIDE on the right.

export function InsetLabelBar({
  data,
  height = 200,
  color,
  insetTextColor = colors.neutral100,
  valueColor = colors.neutral900,
  fmtValue,
}: {
  data: { label: string; value: number }[];
  height?: number;
  color?: string;
  insetTextColor?: string;
  valueColor?: string;
  fmtValue?: (v: number) => string;
}) {
  const c = color ?? colors.active.shade600;
  const fmt = fmtValue ?? ((v: number) => v.toLocaleString("en-IN"));
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} layout="vertical" margin={{ top: 4, right: 28, left: 4, bottom: 0 }}>
        <CartesianGrid horizontal={false} stroke={colors.neutral200} strokeDasharray="2 4" />
        <YAxis dataKey="label" type="category" hide />
        <XAxis dataKey="value" type="number" hide />
        <Tooltip
          cursor={false}
          content={({ active, payload }) =>
            active && payload?.length ? (
              <TooltipCard
                rows={[
                  {
                    label: (payload[0].payload as any).label,
                    value: fmt(payload[0].value as number),
                    color: c,
                  },
                ]}
              />
            ) : null
          }
        />
        <Bar dataKey="value" fill={c} radius={4} barSize={28}>
          <LabelList
            dataKey="label"
            position="insideLeft"
            offset={10}
            style={{ fill: insetTextColor, fontSize: 12, fontWeight: 500, fontFamily: fonts.family.primary }}
          />
          <LabelList
            dataKey="value"
            position="right"
            offset={8}
            formatter={(v: any) => fmt(v as number)}
            style={{ fill: valueColor, fontSize: 12, fontWeight: 600, fontFamily: fonts.family.primary }}
          />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

// ─── Category rows (compact horizontal bars for KPI tiles) ───────────────────
// Mirrors shadcn "Bar Chart - Horizontal": YAxis labels, no XAxis, rounded
// bars, value at end via LabelList. Per-row color via Cell.

export function CategoryRows({
  data,
  height = 90,
  barSize = 10,
  yAxisWidth = 70,
  barCategoryGap = "20%",
}: {
  data: { label: string; value: number; color: string }[];
  height?: number;
  barSize?: number;
  yAxisWidth?: number;
  barCategoryGap?: number | string;
}) {
  const fmt = (v: number) => v.toLocaleString("en-IN");
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart
        data={data}
        layout="vertical"
        margin={{ top: 0, right: 28, left: -8, bottom: 0 }}
        barCategoryGap={barCategoryGap}
      >
        <XAxis type="number" dataKey="value" hide />
        <YAxis
          type="category"
          dataKey="label"
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          width={yAxisWidth}
          tick={{ fontSize: 11, fill: colors.neutral700, fontFamily: fonts.family.primary }}
        />
        <Tooltip
          cursor={false}
          content={({ active, payload }) =>
            active && payload?.length ? (
              <TooltipCard
                rows={[
                  {
                    label: (payload[0].payload as any).label,
                    value: fmt(payload[0].value as number),
                    color: (payload[0].payload as any).color,
                  },
                ]}
              />
            ) : null
          }
        />
        <Bar dataKey="value" radius={5} barSize={barSize}>
          {data.map((d, i) => (
            <Cell key={i} fill={d.color} />
          ))}
          <LabelList
            dataKey="value"
            position="right"
            formatter={(v: any) => fmt(v as number)}
            style={{ fontSize: 11, fill: colors.neutral900, fontWeight: 600, fontFamily: fonts.family.primary }}
          />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

// ─── Bar (vertical — used for revenue per day) ───────────────────────────────

export function ThemedVerticalBar({
  data,
  height = 280,
  fmtValue,
  highlightLastIdx,
}: {
  data: { label: string; value: number; sub?: string }[];
  height?: number;
  fmtValue?: (v: number) => string;
  highlightLastIdx?: number;
}) {
  const fmt = fmtValue ?? ((v: number) => v.toLocaleString("en-IN"));
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} margin={{ top: 24, right: 8, left: -8, bottom: 0 }}>
        <CartesianGrid stroke={colors.neutral200} vertical={false} strokeDasharray="2 4" />
        <XAxis
          dataKey="label"
          tick={{ fontSize: 11, fill: colors.neutral500, fontFamily: fonts.family.primary }}
          tickLine={false}
          axisLine={{ stroke: colors.neutral200 }}
        />
        <YAxis
          tick={{ fontSize: 11, fill: colors.neutral500, fontFamily: fonts.family.primary }}
          tickLine={false}
          axisLine={false}
          tickFormatter={(v) => fmt(v as number)}
          width={48}
        />
        <Tooltip
          cursor={{ fill: colors.alphaBlack0 }}
          content={({ active, payload, label }) =>
            active && payload?.length ? (
              <TooltipCard
                title={(payload[0].payload as any).sub ?? label}
                rows={[
                  {
                    label: String(label),
                    value: fmt(payload[0].value as number),
                    color: colors.active.shade700,
                  },
                ]}
              />
            ) : null
          }
        />
        <Bar dataKey="value" radius={[6, 6, 0, 0]} barSize={36}>
          {data.map((d, i) => (
            <Cell
              key={i}
              fill={
                highlightLastIdx != null && i === highlightLastIdx
                  ? colors.active.shade700
                  : colors.active.shade400
              }
              fillOpacity={highlightLastIdx != null && i === highlightLastIdx ? 1 : 0.7}
            />
          ))}
          <LabelList
            dataKey="value"
            position="top"
            formatter={(v: any) => fmt(v as number)}
            style={{ fontSize: 11, fill: colors.neutral700, fontFamily: fonts.family.primary, fontWeight: 600 }}
          />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

// ─── Diverging bar (Age pyramid) ─────────────────────────────────────────────

export function AgePyramid({
  data,
  height = 220,
  leftColor,
  rightColor,
}: {
  data: { band: string; male: number; female: number }[];
  height?: number;
  leftColor: string;
  rightColor: string;
}) {
  // Show male as negative so it sits on the left.
  const flat = data.slice().reverse().map((d) => ({ band: d.band, male: -d.male, female: d.female, maleAbs: d.male }));
  const max = Math.max(...data.flatMap((d) => [d.male, d.female]));
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={flat} layout="vertical" stackOffset="sign" margin={{ top: 0, right: 16, left: 16, bottom: 0 }}>
        <CartesianGrid stroke={colors.neutral200} horizontal={false} strokeDasharray="2 4" />
        <XAxis
          type="number"
          domain={[-max, max]}
          tickFormatter={(v) => String(Math.abs(v as number))}
          tick={{ fontSize: 11, fill: colors.neutral500, fontFamily: fonts.family.primary }}
          axisLine={{ stroke: colors.neutral200 }}
          tickLine={false}
        />
        <YAxis
          dataKey="band"
          type="category"
          tick={{ fontSize: 12, fill: colors.neutral900, fontFamily: fonts.family.primary, fontWeight: 500 }}
          axisLine={false}
          tickLine={false}
          width={48}
        />
        <Tooltip
          cursor={{ fill: colors.alphaBlack0 }}
          content={({ active, payload, label }) =>
            active && payload?.length ? (
              <TooltipCard
                title={`Age ${label}`}
                rows={payload.map((p) => ({
                  label: p.dataKey === "male" ? "Male" : "Female",
                  value: Math.abs(p.value as number).toLocaleString("en-IN"),
                  color: p.dataKey === "male" ? leftColor : rightColor,
                }))}
              />
            ) : null
          }
        />
        <Bar dataKey="male" stackId="age" fill={leftColor} radius={[3, 0, 0, 3]} />
        <Bar dataKey="female" stackId="age" fill={rightColor} radius={[0, 3, 3, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

// ─── Mini area (sparkline) ───────────────────────────────────────────────────

export function MiniArea({
  points,
  width = 120,
  height = 32,
  color = colors.active.shade600,
}: {
  points: number[];
  width?: number;
  height?: number;
  color?: string;
}) {
  const data = points.map((v, i) => ({ i, v }));
  const id = React.useId().replace(/:/g, "");
  return (
    <div style={{ width, height, flexShrink: 0 }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 2, right: 2, left: 2, bottom: 2 }}>
          <defs>
            <linearGradient id={`mini-${id}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={0.4} />
              <stop offset="100%" stopColor={color} stopOpacity={0.0} />
            </linearGradient>
          </defs>
          <Area type="monotone" dataKey="v" stroke={color} strokeWidth={1.5} fill={`url(#mini-${id})`} dot={false} isAnimationActive={false} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
