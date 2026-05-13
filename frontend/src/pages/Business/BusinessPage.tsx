import React, { useEffect, useMemo, useState } from "react";
import { API_BASE_URL } from "../../apiConfig";
import { colors, fonts, spacing, radii, strokes } from "../../styles/theme";

type TabId = "overview" | "health" | "patients" | "doctors" | "clinical" | "operations" | "finance";
type RangeId = "today" | "week" | "month" | "year" | "custom";
type Tone = "up" | "down" | "flat";

const TABS: { id: TabId; label: string }[] = [
  { id: "overview", label: "Overview" },
  { id: "health", label: "Health" },
  { id: "patients", label: "Patients" },
  { id: "doctors", label: "Doctors" },
  { id: "clinical", label: "Clinical" },
  { id: "operations", label: "Operations" },
  { id: "finance", label: "Finance" },
];

const RANGES: { id: RangeId; label: string }[] = [
  { id: "today", label: "Today" },
  { id: "week", label: "7 days" },
  { id: "month", label: "30 days" },
  { id: "year", label: "12 months" },
  { id: "custom", label: "Custom" },
];

// ── Mock data per range (Overview) ───────────────────────────────────────────

type RangeData = {
  footfall: { value: number; delta: string; tone: Tone; sub: string };
  inClinic: { waiting: number; inConsult: number; done: number };
  noShow: { value: string; delta: string; tone: Tone; sub: string };
  newPatients: { value: number; delta: string; tone: Tone; sub: string };
  composition: { consultation: number; review: number; procedure: number; walkin: number };
  topComplaints: { name: string; count: number }[];
  highlights: { tone: "good" | "warn" | "info"; text: string }[];
  footfallTrend: { labels: string[]; values: number[] };
};

const OVERVIEW_MOCK: Record<RangeId, RangeData> = {
  today: {
    footfall:    { value: 24,         delta: "+3",       tone: "up",   sub: "vs yesterday" },
    inClinic:    { waiting: 4, inConsult: 2, done: 18 },
    noShow:      { value: "8%",       delta: "+1%",      tone: "down", sub: "vs last week" },
    newPatients: { value: 7,          delta: "+2",       tone: "up",   sub: "vs yesterday" },
    composition: { consultation: 14, review: 6, procedure: 2, walkin: 2 },
    topComplaints: [
      { name: "Fever", count: 6 },
      { name: "Cough / cold", count: 5 },
      { name: "Back pain", count: 3 },
    ],
    highlights: [
      { tone: "good", text: "Footfall is up 14% vs the average Monday." },
      { tone: "warn", text: "Walk-in volume is double the usual Monday." },
      { tone: "info", text: "Cough/cold cases up — 5 visits today." },
    ],
    footfallTrend: { labels: ["8a", "9a", "10a", "11a", "12p", "1p", "2p", "3p", "4p", "5p", "6p"], values: [0, 1, 3, 5, 4, 2, 3, 3, 2, 1, 0] },
  },
  week: {
    footfall:    { value: 168,        delta: "+12%",     tone: "up",   sub: "vs prior week" },
    inClinic:    { waiting: 4, inConsult: 2, done: 18 },
    noShow:      { value: "9%",       delta: "+0.5%",    tone: "down", sub: "vs prior week" },
    newPatients: { value: 38,         delta: "+6",       tone: "up",   sub: "vs prior week" },
    composition: { consultation: 92, review: 41, procedure: 18, walkin: 17 },
    topComplaints: [
      { name: "Fever", count: 31 },
      { name: "Cough / cold", count: 27 },
      { name: "Back pain", count: 18 },
    ],
    highlights: [
      { tone: "good", text: "Reviews scheduled rate hit 84% — your best week this month." },
      { tone: "warn", text: "Cancellations spiked on Wednesday (6 vs avg 2)." },
      { tone: "info", text: "Cough/cold cases trending up — +40% week-over-week." },
    ],
    footfallTrend: { labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"], values: [28, 31, 22, 26, 30, 24, 7] },
  },
  month: {
    footfall:    { value: 712,        delta: "+8%",      tone: "up",   sub: "vs prior 30 days" },
    inClinic:    { waiting: 4, inConsult: 2, done: 18 },
    noShow:      { value: "10%",      delta: "−1%",      tone: "up",   sub: "vs prior 30 days" },
    newPatients: { value: 156,        delta: "+22",      tone: "up",   sub: "vs prior 30 days" },
    composition: { consultation: 386, review: 188, procedure: 76, walkin: 62 },
    topComplaints: [
      { name: "Fever", count: 124 },
      { name: "Cough / cold", count: 98 },
      { name: "Back pain", count: 67 },
    ],
    highlights: [
      { tone: "good", text: "Patient retention (90-day return) climbed from 58% to 64%." },
      { tone: "warn", text: "5 reviews are overdue — patients recommended to return but didn't." },
      { tone: "info", text: "Saturdays are now your busiest day, up from Friday last month." },
    ],
    footfallTrend: { labels: Array.from({ length: 30 }, (_, i) => `${i + 1}`), values: [18, 22, 19, 25, 28, 32, 12, 20, 23, 27, 29, 31, 35, 14, 21, 24, 26, 30, 33, 36, 15, 22, 25, 28, 31, 34, 38, 16, 27, 33] },
  },
  year: {
    footfall:    { value: 8420,       delta: "+18%",     tone: "up",   sub: "vs prior 12 months" },
    inClinic:    { waiting: 4, inConsult: 2, done: 18 },
    noShow:      { value: "11%",      delta: "−2%",      tone: "up",   sub: "vs prior year" },
    newPatients: { value: 1840,       delta: "+312",     tone: "up",   sub: "vs prior year" },
    composition: { consultation: 4580, review: 2280, procedure: 920, walkin: 640 },
    topComplaints: [
      { name: "Fever", count: 1420 },
      { name: "Cough / cold", count: 1180 },
      { name: "Back pain", count: 820 },
    ],
    highlights: [
      { tone: "good", text: "Active patient base grew by 34% over the last year." },
      { tone: "info", text: "Walk-ins now make up 7% of footfall, down from 12% a year ago." },
      { tone: "info", text: "Procedure volume doubled — strongest growth area this year." },
    ],
    footfallTrend: { labels: ["Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec", "Jan", "Feb", "Mar", "Apr", "May"], values: [540, 580, 612, 668, 692, 740, 712, 688, 654, 712, 745, 776] },
  },
  custom: {
    footfall:    { value: 0,          delta: "—",        tone: "flat", sub: "pick a range" },
    inClinic:    { waiting: 0, inConsult: 0, done: 0 },
    noShow:      { value: "—",        delta: "—",        tone: "flat", sub: "" },
    newPatients: { value: 0,          delta: "—",        tone: "flat", sub: "" },
    composition: { consultation: 0, review: 0, procedure: 0, walkin: 0 },
    topComplaints: [],
    highlights: [{ tone: "info", text: "Pick a start and end date to see stats for that range." }],
    footfallTrend: { labels: [], values: [] },
  },
};

// Peak-hours heatmap: 7 days × 8 hours.
const HEATMAP_DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const HEATMAP_HOURS = ["9", "10", "11", "12", "1", "2", "3", "4"];
const HEATMAP: number[][] = [
  [2, 5, 7, 8, 6, 4, 5, 3],
  [3, 6, 8, 9, 7, 5, 6, 4],
  [4, 7, 9, 9, 7, 6, 6, 5],
  [3, 6, 8, 8, 6, 5, 5, 3],
  [5, 8, 10, 9, 7, 6, 7, 5],
  [6, 9, 10, 10, 9, 8, 7, 6],
  [1, 2, 3, 3, 2, 2, 1, 1],
];

// ─────────────────────────────────────────────────────────────────────────────

export function BusinessPage() {
  const [tab, setTab] = useState<TabId>("overview");
  const [range, setRange] = useState<RangeId>("today");
  const [customStart, setCustomStart] = useState("");
  const [customEnd, setCustomEnd] = useState("");

  const data = useMemo(() => OVERVIEW_MOCK[range], [range]);

  return (
    <div style={styles.page}>
      <h1 style={styles.title}>Stats</h1>

      <div style={styles.controlsRow}>
        <div style={styles.tabStrip} role="tablist">
          {TABS.map((t) => {
            const active = t.id === tab;
            return (
              <button
                key={t.id}
                role="tab"
                aria-selected={active}
                style={{ ...styles.tab, ...(active ? styles.tabActive : null) }}
                onClick={() => setTab(t.id)}
              >
                {t.label}
              </button>
            );
          })}
        </div>

        <div style={styles.rangeControl}>
          {RANGES.map((r) => {
            const active = r.id === range;
            return (
              <button
                key={r.id}
                style={{ ...styles.rangePill, ...(active ? styles.rangePillActive : null) }}
                onClick={() => setRange(r.id)}
              >
                {r.label}
              </button>
            );
          })}
        </div>
      </div>

      {range === "custom" && (
        <div style={styles.customRangeRow}>
          <label style={styles.customRangeLabel}>From</label>
          <input type="date" value={customStart} onChange={(e) => setCustomStart(e.target.value)} style={styles.dateInput} />
          <label style={styles.customRangeLabel}>To</label>
          <input type="date" value={customEnd} onChange={(e) => setCustomEnd(e.target.value)} style={styles.dateInput} />
        </div>
      )}

      {tab === "overview"   && <OverviewTab data={data} range={range} />}
      {tab === "health"     && <HealthTab range={range} />}
      {tab === "patients"   && <PatientsTab range={range} />}
      {tab === "doctors"    && <DoctorsTab range={range} customStart={customStart} customEnd={customEnd} />}
      {tab === "clinical"   && <ClinicalTab range={range} />}
      {tab === "operations" && <OperationsTab range={range} />}
      {tab === "finance"    && <FinanceTab range={range} />}
    </div>
  );
}

// ── Overview tab ─────────────────────────────────────────────────────────────

function OverviewTab({ data, range }: { data: RangeData; range: RangeId }) {
  return (
    <div style={styles.tabBody}>
      <div style={styles.kpiGrid}>
        <KpiTile label="Footfall" value={String(data.footfall.value)} delta={data.footfall.delta} tone={data.footfall.tone} sub={data.footfall.sub} />
        <InClinicTile data={data.inClinic} live={range === "today"} />
        <KpiTile label="No-show rate" value={data.noShow.value} delta={data.noShow.delta} tone={data.noShow.tone} sub={data.noShow.sub} />
        <KpiTile label="New patients" value={String(data.newPatients.value)} delta={data.newPatients.delta} tone={data.newPatients.tone} sub={data.newPatients.sub} />
      </div>

      <div style={styles.midRow}>
        <PeakHoursCard />
        <CompositionCard data={data.composition} />
        <TopComplaintsCard data={data.topComplaints} />
      </div>

      <div style={styles.bottomRow}>
        <FootfallTrendCard data={data.footfallTrend} range={range} />
        <HighlightsCard items={data.highlights} />
      </div>
    </div>
  );
}

// ── Health tab ──────────────────────────────────────────────────────────────
// Composite clinic-health score built from the metrics we already track,
// plus a list of AI-style insights. The score breakdown is deterministic
// here; a follow-up can replace `INSIGHTS` with an LLM-generated payload.

type Insight = { tone: "good" | "watch" | "act"; text: string; action?: string };

const HEALTH_SUBSCORES = [
  { label: "Patient experience", value: 82, hint: "Low wait, high return rate" },
  { label: "Operational",        value: 74, hint: "Slot fill steady; cancellations crept up Wed" },
  { label: "Clinical quality",   value: 88, hint: "Diagnosis-filled rate 94%; review plans up" },
  { label: "Financial",          value: 71, hint: "Revenue +12%; ₹47k dues outstanding" },
];

const INSIGHTS: Insight[] = [
  { tone: "good",  text: "Patient retention climbed from 58% → 64% (90-day return) this month.",
                   action: "Send a thank-you SMS to top returning patients" },
  { tone: "act",   text: "5 patients have overdue follow-up visits.",
                   action: "Open patient list and call to reschedule" },
  { tone: "watch", text: "Cancellations spiked on Wednesday (6 vs avg 2). Worth checking the schedule.",
                   action: "Review Wed roster" },
  { tone: "watch", text: "Cough/cold cases trending +40% week-over-week — seasonal uptick likely.",
                   action: "Stock more cetirizine and ORS" },
  { tone: "good",  text: "Saturdays are now your busiest day. Consider opening a second consult room.",
                   action: "Talk to clinic admin" },
];

function healthScore(): number {
  // Weighted mean of subscores. Replace with backend computation later.
  const sum = HEALTH_SUBSCORES.reduce((a, s) => a + s.value, 0);
  return Math.round(sum / HEALTH_SUBSCORES.length);
}

function HealthTab({ range }: { range: RangeId }) {
  const score = healthScore();
  return (
    <div style={styles.tabBody}>
      <div style={styles.healthTopRow}>
        <HealthScoreCard score={score} />
        <HealthSubscoresCard />
      </div>

      <InsightsCard items={INSIGHTS} />
    </div>
  );
}

function HealthScoreCard({ score }: { score: number }) {
  const band = score >= 80 ? "Strong" : score >= 65 ? "Steady" : score >= 50 ? "Needs attention" : "At risk";
  const color = score >= 80 ? colors.secondary500 : score >= 65 ? colors.active.shade600 : colors.red200;
  const r = 56;
  const c = 2 * Math.PI * r;
  const offset = c - (score / 100) * c;
  return (
    <section style={{ ...styles.card, alignItems: "center", justifyContent: "center", textAlign: "center" }}>
      <header style={{ ...styles.cardHeader, justifyContent: "center" }}>
        <h3 style={styles.cardTitle}>Clinic health score</h3>
      </header>
      <div style={{ display: "flex", justifyContent: "center", padding: spacing.s }}>
        <svg width={140} height={140} viewBox="0 0 140 140">
          <circle cx={70} cy={70} r={r} fill="none" stroke={colors.primary100} strokeWidth={12} />
          <circle
            cx={70} cy={70} r={r}
            fill="none"
            stroke={color}
            strokeWidth={12}
            strokeDasharray={c}
            strokeDashoffset={offset}
            strokeLinecap="round"
            transform="rotate(-90 70 70)"
          />
          <text
            x={70} y={68}
            textAnchor="middle"
            dominantBaseline="middle"
            fontFamily={fonts.family.secondary}
            fontSize={36}
            fill={colors.neutral900}
          >{score}</text>
          <text
            x={70} y={92}
            textAnchor="middle"
            dominantBaseline="middle"
            fontFamily={fonts.family.primary}
            fontSize={11}
            fill={colors.neutral500}
          >out of 100</text>
        </svg>
      </div>
      <div style={{ fontSize: fonts.size.s, color: colors.neutral700, fontWeight: fonts.weight.semibold }}>{band}</div>
    </section>
  );
}

function HealthSubscoresCard() {
  return (
    <section style={styles.card}>
      <header style={styles.cardHeader}>
        <h3 style={styles.cardTitle}>What's driving it</h3>
      </header>
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {HEALTH_SUBSCORES.map((s) => {
          const fillColor = s.value >= 80 ? colors.secondary500 : s.value >= 65 ? colors.active.shade600 : colors.red200;
          return (
            <div key={s.label}>
              <div style={styles.complaintRow}>
                <span>{s.label}</span>
                <span style={styles.complaintCount}>{s.value}</span>
              </div>
              <div style={styles.barTrack}>
                <div style={{ ...styles.barFill, width: `${s.value}%`, backgroundColor: fillColor }} />
              </div>
              <div style={{ fontSize: fonts.size.xs, color: colors.neutral500, marginTop: 4 }}>{s.hint}</div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function InsightsCard({ items }: { items: Insight[] }) {
  return (
    <section style={styles.card}>
      <header style={styles.cardHeader}>
        <h3 style={styles.cardTitle}>Recommended next steps</h3>
        <span style={styles.cardSub}>auto-generated · review and act</span>
      </header>
      <div style={{ display: "flex", flexDirection: "column", gap: spacing.s }}>
        {items.map((item, idx) => {
          const color =
            item.tone === "good"  ? colors.secondary500 :
            item.tone === "act"   ? colors.red200 :
                                    colors.active.shade600;
          return (
            <div key={idx} style={styles.insightRow}>
              <span style={{ ...styles.insightDot, backgroundColor: color }} />
              <div style={styles.insightBody}>
                <div style={styles.insightText}>{item.text}</div>
                {item.action && <div style={styles.insightAction}>→ {item.action}</div>}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

// ── Patients tab ────────────────────────────────────────────────────────────

const AGE_BANDS = ["0–12", "13–25", "26–40", "41–60", "61+"];
const AGE_PYRAMID = [
  { band: "0–12", male: 86, female: 72 },
  { band: "13–25", male: 124, female: 138 },
  { band: "26–40", male: 312, female: 348 },
  { band: "41–60", male: 286, female: 264 },
  { band: "61+",  male: 142, female: 168 },
];

const OVERDUE_REVIEWS = [
  { name: "Aarav Iyer",       since: "21 days ago", doctor: "Dr. Anika" },
  { name: "Meena Sharma",     since: "18 days ago", doctor: "Dr. Vikram" },
  { name: "Ravi Kumar",       since: "16 days ago", doctor: "Dr. Anika" },
  { name: "Sneha Pillai",     since: "12 days ago", doctor: "Dr. Priya" },
  { name: "Karthik Menon",    since: "9 days ago",  doctor: "Dr. Anika" },
];

const COMPLAINTS_TREND = [
  { name: "Fever",         points: [22, 26, 31, 38, 42, 35, 31] },
  { name: "Cough / cold",  points: [18, 24, 28, 32, 27, 24, 27] },
  { name: "Back pain",     points: [12, 14, 17, 19, 18, 16, 18] },
  { name: "Headache",      points: [8, 10, 12, 14, 13, 11, 12] },
  { name: "Hypertension",  points: [16, 16, 17, 18, 17, 17, 18] },
];

function PatientsTab({ range }: { range: RangeId }) {
  return (
    <div style={styles.tabBody}>
      <div style={styles.kpiGrid}>
        <KpiTile label="Active patients" value="2,148" delta="+34%" tone="up" sub="visited in last 6 mo" />
        <KpiTile label="New this period" value="156" delta="+22" tone="up" sub={subFor(range)} />
        <KpiTile label="30-day return rate" value="42%" delta="+3%" tone="up" sub="vs prior period" />
        <KpiTile label="90-day return rate" value="64%" delta="+6%" tone="up" sub="vs prior period" />
      </div>

      <AgePyramidCard />

      <ComplaintsTrendCard />

      <OverdueReviewsCard />
    </div>
  );
}

function AgePyramidCard() {
  const max = Math.max(...AGE_PYRAMID.flatMap((b) => [b.male, b.female]));
  return (
    <section style={styles.card}>
      <header style={styles.cardHeader}>
        <h3 style={styles.cardTitle}>Age & gender distribution</h3>
        <span style={styles.cardSub}>active patients</span>
      </header>
      <div style={styles.pyramidLegend}>
        <span><Swatch color={colors.active.shade600} /> Male</span>
        <span><Swatch color={colors.secondary500} /> Female</span>
      </div>
      <div style={styles.pyramidWrap}>
        {AGE_PYRAMID.slice().reverse().map((b) => (
          <div key={b.band} style={styles.pyramidRow}>
            <div style={styles.pyramidSideLeft}>
              <div style={{ ...styles.pyramidBar, width: `${(b.male / max) * 100}%`, backgroundColor: colors.active.shade600, marginLeft: "auto" }} />
              <span style={styles.pyramidValue}>{b.male}</span>
            </div>
            <div style={styles.pyramidBand}>{b.band}</div>
            <div style={styles.pyramidSideRight}>
              <span style={styles.pyramidValue}>{b.female}</span>
              <div style={{ ...styles.pyramidBar, width: `${(b.female / max) * 100}%`, backgroundColor: colors.secondary500 }} />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function ComplaintsTrendCard() {
  return (
    <section style={styles.card}>
      <header style={styles.cardHeader}>
        <h3 style={styles.cardTitle}>Top complaints — trend</h3>
        <span style={styles.cardSub}>last 7 weeks</span>
      </header>
      <div style={styles.complaintList}>
        {COMPLAINTS_TREND.map((c) => {
          const last = c.points[c.points.length - 1];
          const first = c.points[0];
          const delta = last - first;
          return (
            <div key={c.name} style={styles.complaintTrendRow}>
              <span style={styles.complaintTrendName}>{c.name}</span>
              <Sparkline points={c.points} />
              <span style={styles.complaintTrendValue}>{last}</span>
              <span style={{ ...styles.complaintTrendDelta, color: delta > 0 ? colors.red200 : colors.secondary500 }}>
                {delta > 0 ? `+${delta}` : delta}
              </span>
            </div>
          );
        })}
      </div>
    </section>
  );
}


function OverdueReviewsCard() {
  return (
    <section style={styles.card}>
      <header style={styles.cardHeader}>
        <h3 style={styles.cardTitle}>Patients with overdue reviews</h3>
        <span style={styles.cardSub}>{OVERDUE_REVIEWS.length} patients · recommended follow-up not yet done</span>
      </header>
      <table style={styles.table}>
        <thead>
          <tr>
            <th style={styles.th}>Patient</th>
            <th style={styles.th}>Doctor</th>
            <th style={{ ...styles.th, textAlign: "right" }}>Last seen</th>
          </tr>
        </thead>
        <tbody>
          {OVERDUE_REVIEWS.map((r, idx) => {
            const isLast = idx === OVERDUE_REVIEWS.length - 1;
            const cell = isLast ? { ...styles.td, borderBottom: "none" } : styles.td;
            return (
              <tr key={r.name}>
                <td style={cell}>{r.name}</td>
                <td style={cell}>{r.doctor}</td>
                <td style={{ ...cell, textAlign: "right", color: colors.red200 }}>{r.since}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </section>
  );
}

// ── Doctors tab ─────────────────────────────────────────────────────────────

type DoctorStat = { doctorId: string; name: string; revenue: number; daysWorked: number; appointmentCount: number };

function useDoctorStats(range: RangeId, customStart: string, customEnd: string) {
  const [doctors, setDoctors] = useState<DoctorStat[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("docodile_token") ?? "";
    const today = new Date().toISOString().slice(0, 10);
    const weekAgo = new Date(Date.now() - 6 * 86400000).toISOString().slice(0, 10);
    const monthAgo = new Date(Date.now() - 29 * 86400000).toISOString().slice(0, 10);
    const yearAgo = new Date(Date.now() - 364 * 86400000).toISOString().slice(0, 10);
    const startMap: Record<RangeId, string> = { today, week: weekAgo, month: monthAgo, year: yearAgo, custom: customStart };
    const endMap: Record<RangeId, string>   = { today, week: today,   month: today,    year: today,    custom: customEnd  };
    const start = startMap[range];
    const end   = endMap[range];
    if (!start || !end) { setDoctors([]); setLoading(false); return; }
    setLoading(true);
    fetch(`${API_BASE_URL}/api/stats/doctors?startDate=${start}&endDate=${end}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => r.ok ? r.json() : [])
      .then(setDoctors)
      .catch(() => setDoctors([]))
      .finally(() => setLoading(false));
  }, [range, customStart, customEnd]);

  return { doctors, loading };
}

const SCHEDULE_DENSITY = [
  // 7 days × 4 doctors. 0–4 booked slots / hour.
  [3, 4, 3, 2, 2, 4, 0], // Anika
  [2, 3, 2, 3, 1, 2, 0], // Priya
  [2, 2, 3, 1, 3, 2, 0], // Rohan
  [3, 3, 4, 3, 2, 3, 0], // Vikram
];

function DoctorsTab({ range, customStart, customEnd }: { range: RangeId; customStart: string; customEnd: string }) {
  const { doctors, loading } = useDoctorStats(range, customStart, customEnd);
  const activeDoctors = doctors.length;

  return (
    <div style={styles.tabBody}>
      <div style={styles.kpiGrid}>
        <KpiTile label="Active doctors" value={loading ? "…" : String(activeDoctors)} delta="" tone="flat" sub="with appointments this period" />
        <KpiTile label="Total appointments" value={loading ? "…" : String(doctors.reduce((s, d) => s + d.appointmentCount, 0))} delta="" tone="flat" sub="across all doctors" />
      </div>

      <DoctorRevenueCard doctors={doctors} loading={loading} />
      <DoctorDaysWorkedCard doctors={doctors} loading={loading} />
      <ScheduleDensityCard />
    </div>
  );
}

function DoctorRevenueCard({ doctors, loading }: { doctors: DoctorStat[]; loading: boolean }) {
  const max = Math.max(...doctors.map(d => d.revenue), 1);
  return (
    <section style={styles.card}>
      <header style={styles.cardHeader}>
        <h3 style={styles.cardTitle}>Revenue per doctor</h3>
        <span style={styles.cardSub}>paid appointments · this period</span>
      </header>
      {loading ? <div style={{ color: colors.neutral400, fontSize: fonts.size.s }}>Loading…</div> : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {doctors.length === 0 && <div style={{ color: colors.neutral400, fontSize: fonts.size.s }}>No data for this period</div>}
          {doctors.map((d) => (
            <div key={d.doctorId}>
              <div style={styles.complaintRow}>
                <span>{d.name}</span>
                <span style={styles.complaintCount}>₹ {d.revenue.toLocaleString("en-IN")}</span>
              </div>
              <div style={styles.barTrack}>
                <div style={{ ...styles.barFill, width: `${(d.revenue / max) * 100}%` }} />
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

function DoctorDaysWorkedCard({ doctors, loading }: { doctors: DoctorStat[]; loading: boolean }) {
  const max = Math.max(...doctors.map(d => d.daysWorked), 1);
  return (
    <section style={styles.card}>
      <header style={styles.cardHeader}>
        <h3 style={styles.cardTitle}>Days worked</h3>
        <span style={styles.cardSub}>days with at least one appointment</span>
      </header>
      {loading ? <div style={{ color: colors.neutral400, fontSize: fonts.size.s }}>Loading…</div> : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {doctors.length === 0 && <div style={{ color: colors.neutral400, fontSize: fonts.size.s }}>No data for this period</div>}
          {doctors.map((d) => (
            <div key={d.doctorId}>
              <div style={styles.complaintRow}>
                <span>{d.name}</span>
                <span style={styles.complaintCount}>{d.daysWorked} days</span>
              </div>
              <div style={styles.barTrack}>
                <div style={{ ...styles.barFill, width: `${(d.daysWorked / max) * 100}%`, backgroundColor: colors.secondary500 }} />
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

// TODO: when staff session-tracking lands, add per-doctor login hours +
// idle hours here. They need a `staff_sessions` table that records
// start/end timestamps per shift, plus the existing appointment data to
// compute idle = (logged-in time) − (consult time).
// Composite "performance score" also waits on that — we want score
// components like on-time-start rate which need an arrival timestamp.

const DENSITY_DOCTORS = [
  { name: "Dr. Anika Reddy" },
  { name: "Dr. Priya Iyer" },
  { name: "Dr. Rohan Mehta" },
  { name: "Dr. Vikram Shah" },
];

function ScheduleDensityCard() {
  const max = 4;
  return (
    <section style={styles.card}>
      <header style={styles.cardHeader}>
        <h3 style={styles.cardTitle}>This week's schedule density</h3>
        <span style={styles.cardSub}>bookings per day · sample</span>
      </header>
      <div style={styles.densityGrid}>
        <div />
        {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
          <div key={d} style={styles.densityHeader}>{d}</div>
        ))}
        {DENSITY_DOCTORS.map((doc, dIdx) => (
          <React.Fragment key={doc.name}>
            <div style={styles.densityRowLabel}>{doc.name.replace("Dr. ", "")}</div>
            {SCHEDULE_DENSITY[dIdx].map((v, hIdx) => {
              const intensity = v / max;
              return (
                <div
                  key={hIdx}
                  title={`${doc.name} · ${v} appts`}
                  style={{
                    ...styles.densityCell,
                    backgroundColor: intensity === 0 ? colors.neutral100 : `rgba(207, 111, 47, ${0.15 + intensity * 0.7})`,
                  }}
                >
                  {v > 0 ? v : ""}
                </div>
              );
            })}
          </React.Fragment>
        ))}
      </div>
    </section>
  );
}

// ── Clinical tab ────────────────────────────────────────────────────────────

const DIAGNOSIS_MIX = [
  { label: "Viral fever",        value: 124, color: colors.active.shade600 },
  { label: "Upper resp. tract",  value: 98,  color: colors.active.shade500 },
  { label: "Hypertension",       value: 76,  color: colors.secondary500 },
  { label: "Diabetes follow-up", value: 64,  color: colors.active.shade400 },
  { label: "Acid reflux",        value: 42,  color: colors.neutral300 },
  { label: "Other",              value: 108, color: colors.neutral200 },
];

const TOP_PRESCRIPTIONS = [
  { name: "Paracetamol 500mg",   count: 142, dosage: "tablet" },
  { name: "Amoxicillin 500mg",   count: 98,  dosage: "capsule" },
  { name: "Cetirizine 10mg",     count: 86,  dosage: "tablet" },
  { name: "Pantoprazole 40mg",   count: 76,  dosage: "tablet" },
  { name: "Vitamin D3 60K",      count: 64,  dosage: "sachet" },
  { name: "Azithromycin 250mg",  count: 48,  dosage: "tablet" },
];

function ClinicalTab({ range }: { range: RangeId }) {
  return (
    <div style={styles.tabBody}>
      <div style={styles.kpiGrid}>
        <KpiTile label="Review scheduled rate" value="71%" delta="+4%" tone="up" sub="follow-up plan made" />
      </div>

      <div style={styles.twoCol}>
        <DiagnosisMixCard />
        <TopPrescriptionsCard />
      </div>
    </div>
  );
}

function DiagnosisMixCard() {
  const total = DIAGNOSIS_MIX.reduce((a, d) => a + d.value, 0);
  return (
    <section style={styles.card}>
      <header style={styles.cardHeader}>
        <h3 style={styles.cardTitle}>Diagnosis mix</h3>
        <span style={styles.cardSub}>this period</span>
      </header>
      <Donut segments={DIAGNOSIS_MIX} total={total} />
      <div style={styles.donutLegend}>
        {DIAGNOSIS_MIX.map((s) => (
          <div key={s.label} style={styles.donutLegendRow}>
            <Swatch color={s.color} />
            <span style={{ flex: 1 }}>{s.label}</span>
            <span style={{ fontWeight: 600 }}>{s.value}</span>
            <span style={{ color: colors.neutral500, marginLeft: 8 }}>{Math.round((s.value / total) * 100)}%</span>
          </div>
        ))}
      </div>
    </section>
  );
}

function TopPrescriptionsCard() {
  const max = Math.max(...TOP_PRESCRIPTIONS.map((p) => p.count));
  return (
    <section style={styles.card}>
      <header style={styles.cardHeader}>
        <h3 style={styles.cardTitle}>Most prescribed medicines</h3>
        <span style={styles.cardSub}>this period</span>
      </header>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {TOP_PRESCRIPTIONS.map((p) => (
          <div key={p.name}>
            <div style={styles.complaintRow}>
              <span>{p.name} <span style={styles.cardSub}>· {p.dosage}</span></span>
              <span style={styles.complaintCount}>{p.count}</span>
            </div>
            <div style={styles.barTrack}>
              <div style={{ ...styles.barFill, width: `${(p.count / max) * 100}%` }} />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

// ── Operations tab ──────────────────────────────────────────────────────────

function OperationsTab({ range }: { range: RangeId }) {
  return (
    <div style={styles.tabBody}>
      <div style={styles.kpiGrid}>
        <KpiTile label="Cancellation rate" value="6%" delta="+1%" tone="down" sub={subFor(range)} />
        <KpiTile label="No-show rate" value="8%" delta="+1%" tone="down" sub={subFor(range)} />
        <KpiTile label="Same-day reschedules" value="4" delta="−1" tone="up" sub={subFor(range)} />
      </div>
    </div>
  );
}

// ── Finance tab ─────────────────────────────────────────────────────────────

const PAYMENT_MIX = [
  { label: "UPI",   value: 198400, color: colors.active.shade600 },
  { label: "Card",  value: 142200, color: colors.secondary500 },
  { label: "Cash",  value: 186400, color: colors.active.shade400 },
  { label: "Waive", value: 43000,  color: colors.neutral300 },
];

const DUES_AGING = [
  { bucket: "0–7 days",   amount: 12400, count: 8 },
  { bucket: "8–30 days",  amount: 18600, count: 11 },
  { bucket: "31–90 days", amount: 9400,  count: 6 },
  { bucket: "90+ days",   amount: 6800,  count: 4 },
];

const REVENUE_TREND_FIN = [
  18, 22, 19, 25, 28, 32, 12, 20, 23, 27, 29, 31, 35, 14,
  21, 24, 26, 30, 33, 36, 15, 22, 25, 28, 31, 34, 38, 16, 27, 33,
];

function FinanceTab({ range }: { range: RangeId }) {
  return (
    <div style={styles.tabBody}>
      <div style={styles.adminBadgeRow}>
        <span style={styles.adminBadge}>Admin view</span>
      </div>

      <div style={styles.kpiGrid}>
        <KpiTile label="Revenue" value="₹ 5,70,000" delta="+12%" tone="up" sub={subFor(range)} />
        <KpiTile label="Outstanding dues" value="₹ 47,200" delta="23 patients" tone="flat" sub="across all aging buckets" />
        <KpiTile label="Avg revenue / visit" value="₹ 800" delta="+₹40" tone="up" sub="vs prior period" />
      </div>

      <div style={styles.twoCol}>
        <PaymentMixCard />
        <DuesAgingCard />
      </div>

      <RevenueTrendCardFin />
    </div>
  );
}

function PaymentMixCard() {
  const total = PAYMENT_MIX.reduce((a, s) => a + s.value, 0);
  return (
    <section style={styles.card}>
      <header style={styles.cardHeader}>
        <h3 style={styles.cardTitle}>Payment method mix</h3>
      </header>
      <Donut segments={PAYMENT_MIX} total={total} />
      <div style={styles.donutLegend}>
        {PAYMENT_MIX.map((s) => (
          <div key={s.label} style={styles.donutLegendRow}>
            <Swatch color={s.color} />
            <span style={{ flex: 1 }}>{s.label}</span>
            <span style={{ fontWeight: 600 }}>₹ {s.value.toLocaleString("en-IN")}</span>
            <span style={{ color: colors.neutral500, marginLeft: 8 }}>{Math.round((s.value / total) * 100)}%</span>
          </div>
        ))}
      </div>
    </section>
  );
}

function RevenueTrendCardFin() {
  // Last 7 days of revenue.
  const values = REVENUE_TREND_FIN.slice(-7);

  // Day labels derived from today.
  const today = new Date();
  const dayLabels = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() - (6 - i));
    return d.toLocaleDateString("en-US", { weekday: "long" });
  });
  const dateLabels = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() - (6 - i));
    return d.toLocaleDateString("en-US", { day: "numeric", month: "short" });
  });

  const W = 900;
  const H = 320;
  const padLeft = 60;
  const padRight = 24;
  const padTop = 36;
  const padBot = 32;
  const innerW = W - padLeft - padRight;
  const innerH = H - padTop - padBot;

  const dataMax = Math.max(...values);
  const tickStep = niceStep(dataMax / 4 || 1);
  const axisMax = Math.ceil(dataMax / tickStep) * tickStep;
  const yTicks: number[] = [];
  for (let t = 0; t <= axisMax + 1e-9; t += tickStep) yTicks.push(Math.round(t));

  const barCount = values.length;
  const slotW = innerW / barCount;
  const barW = Math.min(64, slotW * 0.62);

  const todayIdx = barCount - 1;

  return (
    <section style={styles.card}>
      <header style={styles.cardHeader}>
        <h3 style={styles.cardTitle}>Revenue this week</h3>
        <span style={styles.cardSub}>₹ in thousands</span>
      </header>
      <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid meet" style={{ width: "100%", height: 320, display: "block" }}>
        {/* Y-axis gridlines + labels */}
        {yTicks.map((t) => {
          const y = padTop + innerH - (t / axisMax) * innerH;
          return (
            <g key={t}>
              <line x1={padLeft} x2={W - padRight} y1={y} y2={y} stroke={colors.neutral200} strokeWidth={1} />
              <text
                x={padLeft - 10}
                y={y}
                textAnchor="end"
                dominantBaseline="middle"
                fontSize={11}
                fontFamily="Inter, sans-serif"
                fill={colors.neutral500}
              >
                ₹ {t}k
              </text>
            </g>
          );
        })}

        {/* Bars */}
        {values.map((v, i) => {
          const barH = (v / axisMax) * innerH;
          const x = padLeft + slotW * i + (slotW - barW) / 2;
          const y = padTop + innerH - barH;
          const cx = x + barW / 2;
          const isToday = i === todayIdx;
          const fill = isToday ? colors.active.shade700 : colors.active.shade400;
          const fillOpacity = isToday ? 1 : 0.55;
          const textColor = isToday ? colors.neutral100 : colors.active.shade800;

          // Label sits 14px above the bar's bottom edge, rotated -90 so it reads upward.
          const labelAnchorY = padTop + innerH - 14;
          return (
            <g key={i}>
              <rect
                x={x}
                y={y}
                width={barW}
                height={barH}
                rx={barW / 2}
                ry={barW / 2}
                fill={fill}
                fillOpacity={fillOpacity}
              />
              <text
                x={cx}
                y={labelAnchorY}
                fontSize={16}
                fontWeight={isToday ? 700 : 600}
                textAnchor="start"
                fill={textColor}
                fontFamily="Inter, sans-serif"
                transform={`rotate(-90, ${cx}, ${labelAnchorY})`}
              >
                {dayLabels[i]}
              </text>
            </g>
          );
        })}

        {/* Today's value above its bar */}
        {(() => {
          const v = values[todayIdx];
          const barH = (v / axisMax) * innerH;
          const x = padLeft + slotW * todayIdx + slotW / 2;
          const y = padTop + innerH - barH - 8;
          return (
            <text
              x={x}
              y={y}
              fontSize={12}
              fontWeight={600}
              fontFamily="Inter, sans-serif"
              fill={colors.neutral900}
              textAnchor="middle"
            >
              ₹ {v}k
            </text>
          );
        })()}

        {/* Date row below bars */}
        {dateLabels.map((d, i) => {
          const cx = padLeft + slotW * i + slotW / 2;
          return (
            <text
              key={i}
              x={cx}
              y={H - padBot + 18}
              fontSize={11}
              fontFamily="Inter, sans-serif"
              fill={colors.neutral500}
              textAnchor="middle"
            >
              {d}
            </text>
          );
        })}
      </svg>
    </section>
  );
}

// Round to the next "nice" axis step (1, 2, 5 × 10^k).
function niceStep(raw: number): number {
  const pow = Math.pow(10, Math.floor(Math.log10(raw)));
  const norm = raw / pow;
  if (norm <= 1) return 1 * pow;
  if (norm <= 2) return 2 * pow;
  if (norm <= 5) return 5 * pow;
  return 10 * pow;
}

function DuesAgingCard() {
  return (
    <section style={styles.card}>
      <header style={styles.cardHeader}>
        <h3 style={styles.cardTitle}>Outstanding dues — aging</h3>
        <span style={styles.cardSub}>collect older buckets first</span>
      </header>
      <table style={styles.table}>
        <thead>
          <tr>
            <th style={styles.th}>Bucket</th>
            <th style={{ ...styles.th, textAlign: "right" }}>Patients</th>
            <th style={{ ...styles.th, textAlign: "right" }}>Amount</th>
          </tr>
        </thead>
        <tbody>
          {DUES_AGING.map((d, idx) => {
            const isLast = idx === DUES_AGING.length - 1;
            const cell = isLast ? { ...styles.td, borderBottom: "none" } : styles.td;
            const stale = d.bucket === "31–90 days" || d.bucket === "90+ days";
            return (
              <tr key={d.bucket}>
                <td style={{ ...cell, color: stale ? colors.red200 : colors.neutral900 }}>{d.bucket}</td>
                <td style={{ ...cell, textAlign: "right" }}>{d.count}</td>
                <td style={{ ...cell, textAlign: "right", fontWeight: 600 }}>₹ {d.amount.toLocaleString("en-IN")}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </section>
  );
}

// ── Shared building blocks ──────────────────────────────────────────────────

function KpiTile({ label, value, delta, tone, sub }: {
  label: string; value: string; delta: string; tone: Tone; sub: string;
}) {
  const deltaColor =
    tone === "up" ? colors.secondary500 :
    tone === "down" ? colors.red200 :
    colors.neutral500;
  return (
    <div style={styles.kpiCard}>
      <div style={styles.kpiLabel}>{label}</div>
      <div style={styles.kpiValue}>{value}</div>
      <div style={styles.kpiFooter}>
        {delta && <span style={{ ...styles.kpiDelta, color: deltaColor }}>{delta}</span>}
        <span style={styles.kpiSub}>{sub}</span>
      </div>
    </div>
  );
}

function InClinicTile({ data, live }: { data: { waiting: number; inConsult: number; done: number }; live: boolean }) {
  const total = data.waiting + data.inConsult + data.done;
  const seg = (n: number) => total > 0 ? (n / total) * 100 : 0;
  return (
    <div style={styles.kpiCard}>
      <div style={styles.kpiLabel}>
        {live ? "Patients in clinic now" : "Avg patients in clinic"}
        {live && <span style={styles.liveDot} aria-hidden />}
      </div>
      <div style={styles.kpiValue}>{total}</div>
      <div style={styles.funnelBar}>
        <div style={{ ...styles.funnelSeg, width: `${seg(data.waiting)}%`, backgroundColor: colors.active.shade500 }} />
        <div style={{ ...styles.funnelSeg, width: `${seg(data.inConsult)}%`, backgroundColor: colors.active.shade700 }} />
        <div style={{ ...styles.funnelSeg, width: `${seg(data.done)}%`, backgroundColor: colors.neutral300 }} />
      </div>
      <div style={styles.funnelLegend}>
        <span><Swatch color={colors.active.shade500} /> Waiting <b>{data.waiting}</b></span>
        <span><Swatch color={colors.active.shade700} /> In consult <b>{data.inConsult}</b></span>
        <span><Swatch color={colors.neutral300} /> Done <b>{data.done}</b></span>
      </div>
    </div>
  );
}

function Swatch({ color }: { color: string }) {
  return <span style={{ display: "inline-block", width: 8, height: 8, borderRadius: 2, backgroundColor: color, marginRight: 4 }} />;
}

function Donut({ segments, total, size = 140 }: { segments: { label: string; value: number; color: string }[]; total: number; size?: number }) {
  const stroke = 18;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  let offset = 0;
  return (
    <div style={{ display: "flex", justifyContent: "center", paddingTop: 4 }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={colors.neutral100} strokeWidth={stroke} />
        {segments.map((s) => {
          const length = (s.value / total) * c;
          const dashArray = `${length} ${c - length}`;
          const el = (
            <circle
              key={s.label}
              cx={size / 2}
              cy={size / 2}
              r={r}
              fill="none"
              stroke={s.color}
              strokeWidth={stroke}
              strokeDasharray={dashArray}
              strokeDashoffset={-offset}
              transform={`rotate(-90 ${size / 2} ${size / 2})`}
            />
          );
          offset += length;
          return el;
        })}
      </svg>
    </div>
  );
}

function Sparkline({ points, width = 80, height = 24 }: { points: number[]; width?: number; height?: number }) {
  const max = Math.max(...points);
  const min = Math.min(...points);
  const range = max - min || 1;
  const d = points.map((p, i) => {
    const x = (i / (points.length - 1)) * width;
    const y = height - ((p - min) / range) * height;
    return `${i === 0 ? "M" : "L"} ${x.toFixed(1)} ${y.toFixed(1)}`;
  }).join(" ");
  return (
    <svg width={width} height={height} style={{ flexShrink: 0 }}>
      <path d={d} fill="none" stroke={colors.active.shade600} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function PeakHoursCard() {
  const max = 10;
  return (
    <section style={styles.card}>
      <header style={styles.cardHeader}>
        <h3 style={styles.cardTitle}>Peak hours</h3>
        <span style={styles.cardSub}>last 30 days</span>
      </header>
      <div style={styles.heatmapMini}>
        {HEATMAP.map((row, dayIdx) => (
          <div key={dayIdx} style={styles.heatmapMiniRow}>
            <span style={styles.heatmapMiniAxis}>{HEATMAP_DAYS[dayIdx]}</span>
            {row.map((v, hIdx) => {
              const intensity = v / max;
              return (
                <div
                  key={hIdx}
                  title={`${HEATMAP_DAYS[dayIdx]} ${HEATMAP_HOURS[hIdx]}: ${v}/10`}
                  style={{
                    ...styles.heatmapMiniCell,
                    backgroundColor: intensity === 0 ? colors.neutral100 : `rgba(207, 111, 47, ${0.15 + intensity * 0.7})`,
                  }}
                />
              );
            })}
          </div>
        ))}
      </div>
    </section>
  );
}

function CompositionCard({ data }: { data: { consultation: number; review: number; procedure: number; walkin: number } }) {
  const total = data.consultation + data.review + data.procedure + data.walkin || 1;
  const segments = [
    { label: "Consult",   value: data.consultation, color: colors.active.shade600 },
    { label: "Review",    value: data.review,       color: colors.active.shade400 },
    { label: "Procedure", value: data.procedure,    color: colors.secondary500 },
    { label: "Walk-in",   value: data.walkin,       color: colors.neutral300 },
  ];
  return (
    <section style={styles.card}>
      <header style={styles.cardHeader}>
        <h3 style={styles.cardTitle}>Footfall composition</h3>
      </header>
      <div style={styles.stackBar}>
        {segments.map((s) => (
          <div key={s.label} title={`${s.label}: ${s.value}`} style={{ ...styles.stackSeg, width: `${(s.value / total) * 100}%`, backgroundColor: s.color }} />
        ))}
      </div>
      <div style={styles.compositionLegend}>
        {segments.map((s) => (
          <div key={s.label} style={styles.compositionItem}>
            <Swatch color={s.color} />
            <span style={styles.compositionLabel}>{s.label}</span>
            <span style={styles.compositionValue}>{s.value}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

function TopComplaintsCard({ data }: { data: { name: string; count: number }[] }) {
  const max = Math.max(...data.map((d) => d.count), 1);
  return (
    <section style={styles.card}>
      <header style={styles.cardHeader}>
        <h3 style={styles.cardTitle}>Top complaints</h3>
      </header>
      {data.length === 0 ? (
        <div style={{ color: colors.neutral500, fontSize: fonts.size.s }}>No data</div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {data.map((c) => (
            <div key={c.name}>
              <div style={styles.complaintRow}>
                <span>{c.name}</span>
                <span style={styles.complaintCount}>{c.count}</span>
              </div>
              <div style={styles.barTrack}>
                <div style={{ ...styles.barFill, width: `${(c.count / max) * 100}%` }} />
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

function FootfallTrendCard({ data, range }: { data: { labels: string[]; values: number[] }; range: RangeId }) {
  const max = Math.max(...data.values, 1);
  const title =
    range === "today" ? "Footfall by hour" :
    range === "week"  ? "Footfall this week" :
    range === "month" ? "Footfall last 30 days" :
    range === "year"  ? "Footfall last 12 months" :
                        "Footfall — custom range";
  return (
    <section style={styles.card}>
      <header style={styles.cardHeader}>
        <h3 style={styles.cardTitle}>{title}</h3>
      </header>
      {data.values.length === 0 ? (
        <div style={{ color: colors.neutral500, fontSize: fonts.size.s, padding: spacing.m }}>Pick a range to see the trend.</div>
      ) : (
        <>
          <div style={styles.barChart}>
            {data.values.map((v, i) => (
              <div key={i} style={styles.barChartCol} title={`${data.labels[i]}: ${v}`}>
                <div style={{ ...styles.barChartBar, height: `${(v / max) * 100}%` }} />
              </div>
            ))}
          </div>
          <div style={styles.barChartLabels}>
            {data.labels.map((l, i) => (
              <span key={i} style={{ flex: 1, textAlign: "center", fontSize: fonts.size.xs, color: colors.neutral500 }}>
                {data.values.length > 14 ? (i % Math.ceil(data.values.length / 7) === 0 ? l : "") : l}
              </span>
            ))}
          </div>
        </>
      )}
    </section>
  );
}

function HighlightsCard({ items }: { items: { tone: "good" | "warn" | "info"; text: string }[] }) {
  return (
    <section style={styles.card}>
      <header style={styles.cardHeader}>
        <h3 style={styles.cardTitle}>Highlights</h3>
      </header>
      <div style={{ display: "flex", flexDirection: "column", gap: spacing.s }}>
        {items.map((item, idx) => {
          const toneColor =
            item.tone === "good" ? colors.secondary500 :
            item.tone === "warn" ? colors.red200 :
                                   colors.active.shade600;
          const textColor =
            item.tone === "good" ? colors.secondary500 :
            item.tone === "warn" ? colors.red200 :
                                   colors.neutral700;
          return (
            <div key={idx} style={styles.highlightRow}>
              <span style={{ ...styles.highlightDot, backgroundColor: toneColor }} />
              <span style={{ ...styles.highlightText, color: textColor }}>{item.text}</span>
            </div>
          );
        })}
      </div>
    </section>
  );
}

// ── Utilities ───────────────────────────────────────────────────────────────

function subFor(range: RangeId): string {
  switch (range) {
    case "today":  return "today";
    case "week":   return "last 7 days";
    case "month":  return "last 30 days";
    case "year":   return "last 12 months";
    case "custom": return "selected range";
  }
}

// ── Styles ──────────────────────────────────────────────────────────────────

const styles: Record<string, React.CSSProperties> = {
  page: { display: "flex", flexDirection: "column", gap: spacing.l, minWidth: 0 },
  title: {
    margin: 0, textAlign: "center", fontFamily: fonts.family.secondary,
    fontSize: fonts.size.h5, lineHeight: fonts.lineHeight.h5, fontWeight: fonts.weight.regular, color: colors.neutral900,
  },

  controlsRow: { display: "flex", alignItems: "center", justifyContent: "space-between", gap: spacing.m, flexWrap: "wrap" },
  tabStrip: { display: "inline-flex", alignItems: "center", gap: spacing.xs },
  tab: {
    height: 40,
    padding: `${spacing.xs} ${spacing.m}`,
    borderRadius: radii.xl,
    border: "none",
    backgroundColor: colors.alphaBlack0,
    color: colors.alphaBlack3,
    fontFamily: fonts.family.primary,
    fontSize: fonts.size.m,
    lineHeight: fonts.lineHeight.m,
    cursor: "pointer",
  },
  tabActive: { backgroundColor: colors.neutral100, color: colors.neutral900 },
  rangeControl: { display: "flex", gap: 4, backgroundColor: colors.neutral100, padding: 4, borderRadius: radii.full },
  rangePill: { border: "none", background: "transparent", color: colors.neutral700, padding: "6px 12px", borderRadius: radii.full, cursor: "pointer", fontSize: fonts.size.xs, fontWeight: 500, fontFamily: "inherit" },
  rangePillActive: { backgroundColor: colors.active.shade700, color: colors.neutral100 },
  customRangeRow: { display: "flex", alignItems: "center", gap: spacing.s, padding: `${spacing.s} ${spacing.m}`, backgroundColor: colors.neutral100, borderRadius: radii.m, alignSelf: "flex-end" },
  customRangeLabel: { fontSize: fonts.size.s, color: colors.neutral700, fontWeight: 500 },
  dateInput: { border: `${strokes.xs} solid ${colors.neutral300}`, borderRadius: 8, padding: "6px 10px", fontFamily: "inherit", fontSize: fonts.size.s, color: colors.neutral900, outline: "none", backgroundColor: colors.neutral100 },

  tabBody: { display: "flex", flexDirection: "column", gap: spacing.l },

  // KPIs
  kpiGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: spacing.m },
  kpiCard: { backgroundColor: colors.neutral100, borderRadius: radii.m, padding: spacing.m, display: "flex", flexDirection: "column", gap: 6, minHeight: 110 },
  kpiLabel: { fontSize: fonts.size.s, color: colors.neutral500, fontWeight: 500, display: "flex", alignItems: "center", gap: 6 },
  kpiValue: { fontFamily: fonts.family.secondary, fontSize: fonts.size.h4, color: colors.neutral900, lineHeight: 1.1 },
  kpiFooter: { display: "flex", alignItems: "baseline", gap: 8, marginTop: "auto" },
  kpiDelta: { fontSize: fonts.size.s, fontWeight: 600 },
  kpiSub: { fontSize: fonts.size.xs, color: colors.neutral500 },
  liveDot: { display: "inline-block", width: 8, height: 8, borderRadius: "50%", backgroundColor: colors.secondary500 },

  // In-clinic funnel
  funnelBar: { display: "flex", height: 8, width: "100%", backgroundColor: colors.neutral200, borderRadius: 999, overflow: "hidden", marginTop: 4 },
  funnelSeg: { height: "100%" },
  funnelLegend: { display: "flex", flexWrap: "wrap", gap: 8, fontSize: fonts.size.xs, color: colors.neutral700, marginTop: "auto" },

  // Layouts
  midRow: { display: "grid", gridTemplateColumns: "minmax(0, 1fr) minmax(0, 1fr) minmax(0, 1fr)", gap: spacing.m },
  twoCol: { display: "grid", gridTemplateColumns: "minmax(0, 1fr) minmax(0, 1fr)", gap: spacing.m },
  bottomRow: { display: "grid", gridTemplateColumns: "minmax(0, 2fr) minmax(0, 1fr)", gap: spacing.m },

  // Generic card
  card: { backgroundColor: colors.neutral100, borderRadius: radii.m, padding: spacing.m, display: "flex", flexDirection: "column", gap: spacing.s, minWidth: 0 },
  cardHeader: { display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: spacing.s },
  cardTitle: { margin: 0, fontSize: fonts.size.m, fontWeight: 600, color: colors.neutral900 },
  cardSub: { fontSize: fonts.size.xs, color: colors.neutral500 },

  // Heatmap mini
  heatmapMini: { display: "flex", flexDirection: "column", gap: 3 },
  heatmapMiniRow: { display: "grid", gridTemplateColumns: "32px repeat(8, 1fr)", gap: 3, alignItems: "center" },
  heatmapMiniAxis: { fontSize: fonts.size.xs, color: colors.neutral500 },
  heatmapMiniCell: { height: 14, borderRadius: 3 },

  // Stack
  stackBar: { display: "flex", height: 14, width: "100%", borderRadius: 999, overflow: "hidden", backgroundColor: colors.neutral200 },
  stackSeg: { height: "100%" },
  compositionLegend: { display: "flex", flexDirection: "column", gap: 6 },
  compositionItem: { display: "flex", alignItems: "center", gap: 6, fontSize: fonts.size.xs, color: colors.neutral700 },
  compositionLabel: { flex: 1 },
  compositionValue: { fontWeight: 600, color: colors.neutral900 },

  // Complaints / generic ranked rows
  complaintRow: { display: "flex", justifyContent: "space-between", fontSize: fonts.size.s, color: colors.neutral900, marginBottom: 4 },
  complaintCount: { fontWeight: 600 },
  barTrack: { height: 4, width: "100%", backgroundColor: colors.primary100, borderRadius: 999, overflow: "hidden" },
  barFill: { height: "100%", backgroundColor: colors.active.shade600 },

  // Trend chart
  barChart: { display: "flex", alignItems: "flex-end", gap: 3, height: 140, paddingTop: spacing.xs },
  barChartCol: { flex: 1, display: "flex", alignItems: "flex-end", justifyContent: "center", height: "100%" },
  barChartBar: { width: "70%", backgroundColor: colors.active.shade500, borderRadius: "4px 4px 0 0", minHeight: 2 },
  barChartLabels: { display: "flex", gap: 3 },

  // Highlights
  highlightRow: { display: "flex", alignItems: "flex-start", gap: 8 },
  highlightDot: { width: 8, height: 8, borderRadius: "50%", marginTop: 7, flexShrink: 0 },
  highlightText: { fontSize: fonts.size.s, lineHeight: 1.4 },

  // Donut
  donutLegend: { display: "flex", flexDirection: "column", gap: 6 },
  donutLegendRow: { display: "flex", alignItems: "center", gap: 6, fontSize: fonts.size.xs, color: colors.neutral700 },

  // Age pyramid
  pyramidLegend: { display: "flex", gap: 16, fontSize: fonts.size.xs, color: colors.neutral700 },
  pyramidWrap: { display: "flex", flexDirection: "column", gap: 10 },
  pyramidRow: { display: "grid", gridTemplateColumns: "1fr 60px 1fr", alignItems: "center", gap: spacing.s, fontSize: fonts.size.xs },
  pyramidSideLeft: { display: "flex", alignItems: "center", gap: 6, justifyContent: "flex-end" },
  pyramidSideRight: { display: "flex", alignItems: "center", gap: 6 },
  pyramidBar: { height: 12, borderRadius: 3, minWidth: 2 },
  pyramidValue: { fontSize: fonts.size.xs, color: colors.neutral700, fontWeight: 500 },
  pyramidBand: { textAlign: "center", fontSize: fonts.size.s, color: colors.neutral900, fontWeight: 500 },

  // Complaints trend (with sparkline)
  complaintList: { display: "flex", flexDirection: "column", gap: 10 },
  complaintTrendRow: { display: "grid", gridTemplateColumns: "120px 1fr 40px 50px", alignItems: "center", gap: spacing.s, fontSize: fonts.size.s },
  complaintTrendName: { color: colors.neutral900 },
  complaintTrendValue: { textAlign: "right", fontWeight: 600 },
  complaintTrendDelta: { textAlign: "right", fontSize: fonts.size.xs, fontWeight: 600 },

  // Table (overdue / dues)
  table: { width: "100%", borderCollapse: "collapse", fontSize: fonts.size.s },
  th: { textAlign: "left", padding: "8px", borderBottom: `${strokes.xs} solid ${colors.primary300}`, color: colors.neutral500, fontWeight: 500, whiteSpace: "nowrap" },
  td: { padding: "10px 8px", color: colors.neutral900, borderBottom: `${strokes.xs} solid ${colors.primary300}`, fontWeight: 400 },

  // Schedule density grid
  densityGrid: { display: "grid", gridTemplateColumns: "80px repeat(7, 1fr)", gap: 4 },
  densityHeader: { fontSize: fonts.size.xs, color: colors.neutral500, textAlign: "center", padding: "4px 0" },
  densityRowLabel: { fontSize: fonts.size.s, color: colors.neutral900, display: "flex", alignItems: "center" },
  densityCell: { height: 32, borderRadius: 4, display: "flex", alignItems: "center", justifyContent: "center", fontSize: fonts.size.xs, fontWeight: 600, color: colors.neutral900 },

  // Anomalies
  anomalyRow: { display: "flex", alignItems: "flex-start", gap: 12 },
  anomalyDay: { fontSize: fonts.size.xs, fontWeight: 600, color: colors.neutral100, backgroundColor: colors.active.shade700, padding: "2px 8px", borderRadius: 4, minWidth: 38, textAlign: "center", flexShrink: 0 },
  anomalyText: { fontSize: fonts.size.s, color: colors.neutral700, lineHeight: 1.4 },

  // Admin badge (Finance)
  adminBadgeRow: { display: "flex", justifyContent: "flex-end" },
  adminBadge: { fontSize: fonts.size.xs, fontWeight: 600, color: colors.neutral700, backgroundColor: colors.neutral200, padding: "4px 10px", borderRadius: 999 },

  // Health tab
  healthTopRow: { display: "grid", gridTemplateColumns: "minmax(0, 1fr) minmax(0, 2fr)", gap: spacing.m },
  insightRow: { display: "flex", alignItems: "flex-start", gap: spacing.s },
  insightDot: { width: 10, height: 10, borderRadius: "50%", marginTop: 6, flexShrink: 0 },
  insightBody: { display: "flex", flexDirection: "column", gap: 2, flex: 1 },
  insightText: { fontSize: fonts.size.s, color: colors.neutral900, lineHeight: 1.4 },
  insightAction: { fontSize: fonts.size.xs, color: colors.neutral500, fontWeight: fonts.weight.medium },
};
