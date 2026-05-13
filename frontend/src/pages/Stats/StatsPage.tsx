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

// ── Shared types ─────────────────────────────────────────────────────────────

type NameCount = { name: string; count: number };
type DailyCount = { date: string; count: number };

// ── Date range helpers ────────────────────────────────────────────────────────

function buildDateRange(range: RangeId, customStart: string, customEnd: string) {
  const today = new Date().toISOString().slice(0, 10);
  const weekAgo  = new Date(Date.now() - 6  * 86400000).toISOString().slice(0, 10);
  const monthAgo = new Date(Date.now() - 29 * 86400000).toISOString().slice(0, 10);
  const yearAgo  = new Date(Date.now() - 364 * 86400000).toISOString().slice(0, 10);
  const starts: Record<RangeId, string> = { today, week: weekAgo, month: monthAgo, year: yearAgo, custom: customStart };
  const ends:   Record<RangeId, string> = { today, week: today,   month: today,    year: today,   custom: customEnd  };
  return { start: starts[range], end: ends[range] };
}

function authHeaders() {
  return { Authorization: `Bearer ${localStorage.getItem("docodile_token") ?? ""}` };
}

// ── Overview stats hook ───────────────────────────────────────────────────────

type OverviewStats = {
  totalAppointments: number;
  newPatients: number;
  completedAppointments: number;
  revenue: number;
  composition: { consultation: number; review: number; walkin: number; procedure: number };
  inClinic: { waiting: number; inConsult: number; done: number };
  noShowRate: number;
  hourlyTrend: { hour: number; count: number }[];
  dailyTrend: DailyCount[];
  peakHours: Record<string, Record<number, number>>;
  topComplaints: NameCount[];
};

function useOverviewStats(range: RangeId, customStart: string, customEnd: string) {
  const [stats, setStats] = useState<OverviewStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const { start, end } = buildDateRange(range, customStart, customEnd);
    if (!start || !end) { setStats(null); setLoading(false); return; }
    setLoading(true);
    fetch(`${API_BASE_URL}/api/stats/overview?startDate=${start}&endDate=${end}`, { headers: authHeaders() })
      .then(r => r.ok ? r.json() : null)
      .then((d: any) => {
        if (!d) { setStats(null); return; }
        setStats({
          totalAppointments: d.totalAppointments ?? 0,
          newPatients: d.newPatients ?? 0,
          completedAppointments: d.completedAppointments ?? 0,
          revenue: d.revenue ?? 0,
          composition: {
            consultation: d.composition?.consultation ?? 0,
            review: d.composition?.review ?? 0,
            walkin: d.composition?.walkin ?? 0,
            procedure: d.composition?.procedure ?? 0,
          },
          inClinic: {
            waiting:   d.inClinic?.waiting   ?? 0,
            inConsult: d.inClinic?.inConsult ?? 0,
            done:      d.inClinic?.done      ?? 0,
          },
          noShowRate: d.noShowRate ?? 0,
          hourlyTrend: d.hourlyTrend ?? [],
          dailyTrend:  d.dailyTrend  ?? [],
          peakHours:   d.peakHours   ?? {},
          topComplaints: d.topComplaints ?? [],
        });
      })
      .catch(() => setStats(null))
      .finally(() => setLoading(false));
  }, [range, customStart, customEnd]);

  return { stats, loading };
}

// ── Patients stats hook ───────────────────────────────────────────────────────

type PatientsStats = {
  activePatients: number;
  ageGroups: Record<string, number>;
  genderSplit: Record<string, number>;
};

function usePatientsStats() {
  const [stats, setStats] = useState<PatientsStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/stats/patients`, { headers: authHeaders() })
      .then(r => r.ok ? r.json() : null)
      .then((d: any) => setStats(d ?? null))
      .catch(() => setStats(null))
      .finally(() => setLoading(false));
  }, []);

  return { stats, loading };
}

// ── Clinical stats hook ───────────────────────────────────────────────────────

type ClinicalStats = {
  topComplaints: NameCount[];
  topDiagnoses: NameCount[];
  topMedicines: NameCount[];
  reviewScheduledRate: number;
};

function useClinicalStats(range: RangeId, customStart: string, customEnd: string) {
  const [stats, setStats] = useState<ClinicalStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const { start, end } = buildDateRange(range, customStart, customEnd);
    if (!start || !end) { setStats(null); setLoading(false); return; }
    setLoading(true);
    fetch(`${API_BASE_URL}/api/stats/clinical?startDate=${start}&endDate=${end}`, { headers: authHeaders() })
      .then(r => r.ok ? r.json() : null)
      .then((d: any) => setStats(d ?? null))
      .catch(() => setStats(null))
      .finally(() => setLoading(false));
  }, [range, customStart, customEnd]);

  return { stats, loading };
}

// ── Finance stats hook ────────────────────────────────────────────────────────

type FinanceStats = {
  revenue: number;
  outstandingDues: number;
  avgPerVisit: number;
  revenueTrend: DailyCount[];
  paymentMix: Record<string, number>;
};

function useFinanceStats(range: RangeId, customStart: string, customEnd: string) {
  const [stats, setStats] = useState<FinanceStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const { start, end } = buildDateRange(range, customStart, customEnd);
    if (!start || !end) { setStats(null); setLoading(false); return; }
    setLoading(true);
    fetch(`${API_BASE_URL}/api/stats/finance?startDate=${start}&endDate=${end}`, { headers: authHeaders() })
      .then(r => r.ok ? r.json() : null)
      .then((d: any) => setStats(d ?? null))
      .catch(() => setStats(null))
      .finally(() => setLoading(false));
  }, [range, customStart, customEnd]);

  return { stats, loading };
}

// ── Health stats hook ─────────────────────────────────────────────────────────

type HealthStats = {
  overallScore: number;
  subscores: { label: string; value: number; hint: string }[];
  insights: { tone: string; text: string; action: string | null }[];
};

function useHealthStats() {
  const [stats, setStats] = useState<HealthStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/stats/health`, { headers: authHeaders() })
      .then(r => r.ok ? r.json() : null)
      .then((d: any) => setStats(d ?? null))
      .catch(() => setStats(null))
      .finally(() => setLoading(false));
  }, []);

  return { stats, loading };
}

// ── Complaints trend hook ─────────────────────────────────────────────────────

type ComplaintTrend = { name: string; points: number[] };

function useComplaintsTrend() {
  const [data, setData] = useState<ComplaintTrend[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/stats/complaints/trend`, { headers: authHeaders() })
      .then(r => r.ok ? r.json() : [])
      .then(setData)
      .catch(() => setData([]))
      .finally(() => setLoading(false));
  }, []);

  return { data, loading };
}

// ── Overdue reviews hook ──────────────────────────────────────────────────────

type OverdueReview = { patientName: string; doctorName: string; reviewDate: string; daysSince: number };

function useOverdueReviews() {
  const [data, setData] = useState<OverdueReview[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/stats/overdue`, { headers: authHeaders() })
      .then(r => r.ok ? r.json() : [])
      .then(setData)
      .catch(() => setData([]))
      .finally(() => setLoading(false));
  }, []);

  return { data, loading };
}

// ── Weekly schedule hook ──────────────────────────────────────────────────────

function useWeeklySchedule() {
  const [data, setData] = useState<Record<string, Record<string, number>>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/stats/schedule`, { headers: authHeaders() })
      .then(r => r.ok ? r.json() : {})
      .then(setData)
      .catch(() => setData({}))
      .finally(() => setLoading(false));
  }, []);

  return { data, loading };
}

// ── Operations stats hook ─────────────────────────────────────────────────────

type OperationsStats = {
  totalAppointments: number;
  cancelled: number;
  noShow: number;
  cancellationRate: number;
  noShowRate: number;
};

function useOperationsStats(range: RangeId, customStart: string, customEnd: string) {
  const [stats, setStats] = useState<OperationsStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const { start, end } = buildDateRange(range, customStart, customEnd);
    if (!start || !end) { setStats(null); setLoading(false); return; }
    setLoading(true);
    fetch(`${API_BASE_URL}/api/stats/operations?startDate=${start}&endDate=${end}`, { headers: authHeaders() })
      .then(r => r.ok ? r.json() : null)
      .then((d: any) => setStats(d ?? null))
      .catch(() => setStats(null))
      .finally(() => setLoading(false));
  }, [range, customStart, customEnd]);

  return { stats, loading };
}

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

// ─────────────────────────────────────────────────────────────────────────────

export function StatsPage() {
  const [tab, setTab] = useState<TabId>("overview");
  const [range, setRange] = useState<RangeId>("today");
  const [customStart, setCustomStart] = useState("");
  const [customEnd, setCustomEnd] = useState("");

  const highlights = useMemo(() => OVERVIEW_MOCK[range].highlights, [range]);

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

      {tab === "overview"   && <OverviewTab range={range} customStart={customStart} customEnd={customEnd} highlights={highlights} />}
      {tab === "health"     && <HealthTab range={range} />}
      {tab === "patients"   && <PatientsTab range={range} customStart={customStart} customEnd={customEnd} />}
      {tab === "doctors"    && <DoctorsTab range={range} customStart={customStart} customEnd={customEnd} />}
      {tab === "clinical"   && <ClinicalTab range={range} customStart={customStart} customEnd={customEnd} />}
      {tab === "operations" && <OperationsTab range={range} customStart={customStart} customEnd={customEnd} />}
      {tab === "finance"    && <FinanceTab range={range} customStart={customStart} customEnd={customEnd} />}
    </div>
  );
}

// ── Overview tab ─────────────────────────────────────────────────────────────

function OverviewTab({ range, customStart, customEnd, highlights }: {
  range: RangeId;
  customStart: string;
  customEnd: string;
  highlights: { tone: "good" | "warn" | "info"; text: string }[];
}) {
  const { stats: s, loading } = useOverviewStats(range, customStart, customEnd);
  const L = loading ? "…" : undefined;

  return (
    <div style={styles.tabBody}>
      <div style={styles.kpiGrid}>
        <KpiTile label="Footfall"     value={L ?? String(s?.totalAppointments ?? 0)} delta="" tone="flat" sub={subFor(range)} />
        <InClinicTile data={s?.inClinic ?? { waiting: 0, inConsult: 0, done: 0 }} live={range === "today"} loading={loading} />
        <KpiTile label="No-show / cancelled" value={L ?? `${(s?.noShowRate ?? 0).toFixed(1)}%`} delta="" tone="flat" sub={subFor(range)} />
        <KpiTile label="New patients" value={L ?? String(s?.newPatients ?? 0)} delta="" tone="flat" sub={subFor(range)} />
      </div>

      <div style={styles.midRow}>
        <PeakHoursCard peakData={s?.peakHours ?? {}} loading={loading} />
        <CompositionCard data={s?.composition ?? { consultation: 0, review: 0, walkin: 0, procedure: 0 }} />
        <TopComplaintsCard data={s?.topComplaints ?? []} loading={loading} />
      </div>

      <div style={styles.bottomRow}>
        <FootfallTrendCard hourly={s?.hourlyTrend ?? []} daily={s?.dailyTrend ?? []} range={range} loading={loading} />
        <HighlightsCard items={highlights} />
      </div>
    </div>
  );
}

// ── Health tab ───────────────────────────────────────────────────────────────

function HealthTab({ range }: { range: RangeId }) {
  const { stats, loading } = useHealthStats();

  return (
    <div style={styles.tabBody}>
      <div style={styles.healthTopRow}>
        <HealthScoreCard score={stats?.overallScore ?? 0} loading={loading} />
        <HealthSubscoresCard subscores={stats?.subscores ?? []} loading={loading} />
      </div>
      <InsightsCard insights={stats?.insights ?? []} loading={loading} />
    </div>
  );
}

function HealthScoreCard({ score, loading }: { score: number; loading: boolean }) {
  const band  = score >= 80 ? "Strong" : score >= 65 ? "Steady" : score >= 50 ? "Needs attention" : "At risk";
  const color = score >= 80 ? colors.secondary500 : score >= 65 ? colors.active.shade600 : colors.red200;
  const r = 56, c = 2 * Math.PI * r;
  const offset = c - (score / 100) * c;
  return (
    <section style={{ ...styles.card, alignItems: "center", justifyContent: "center", textAlign: "center" }}>
      <header style={{ ...styles.cardHeader, justifyContent: "center" }}>
        <h3 style={styles.cardTitle}>Clinic health score</h3>
        <span style={styles.cardSub}>last 30 days</span>
      </header>
      {loading ? <div style={{ color: colors.neutral400, fontSize: fonts.size.s, padding: 24 }}>Computing…</div> : (
        <>
          <div style={{ display: "flex", justifyContent: "center", padding: spacing.s }}>
            <svg width={140} height={140} viewBox="0 0 140 140">
              <circle cx={70} cy={70} r={r} fill="none" stroke={colors.primary100} strokeWidth={12} />
              <circle cx={70} cy={70} r={r} fill="none" stroke={color} strokeWidth={12}
                strokeDasharray={c} strokeDashoffset={offset} strokeLinecap="round" transform="rotate(-90 70 70)" />
              <text x={70} y={68} textAnchor="middle" dominantBaseline="middle"
                fontFamily={fonts.family.secondary} fontSize={36} fill={colors.neutral900}>{score}</text>
              <text x={70} y={92} textAnchor="middle" dominantBaseline="middle"
                fontFamily={fonts.family.primary} fontSize={11} fill={colors.neutral500}>out of 100</text>
            </svg>
          </div>
          <div style={{ fontSize: fonts.size.s, color: colors.neutral700, fontWeight: fonts.weight.semibold }}>{band}</div>
        </>
      )}
    </section>
  );
}

function HealthSubscoresCard({ subscores, loading }: {
  subscores: { label: string; value: number; hint: string }[];
  loading: boolean;
}) {
  return (
    <section style={styles.card}>
      <header style={styles.cardHeader}>
        <h3 style={styles.cardTitle}>What's driving it</h3>
      </header>
      {loading ? <div style={{ color: colors.neutral400, fontSize: fonts.size.s }}>Computing…</div> : (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {subscores.map((s) => {
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
      )}
    </section>
  );
}

function InsightsCard({ insights, loading }: {
  insights: { tone: string; text: string; action: string | null }[];
  loading: boolean;
}) {
  return (
    <section style={styles.card}>
      <header style={styles.cardHeader}>
        <h3 style={styles.cardTitle}>Recommended next steps</h3>
        <span style={styles.cardSub}>computed from your last 30 days · review and act</span>
      </header>
      {loading ? <div style={{ color: colors.neutral400, fontSize: fonts.size.s }}>Computing…</div> : (
        <div style={{ display: "flex", flexDirection: "column", gap: spacing.s }}>
          {insights.map((item, idx) => {
            const dotColor =
              item.tone === "good"  ? colors.secondary500 :
              item.tone === "act"   ? colors.red200 :
                                      colors.active.shade600;
            return (
              <div key={idx} style={styles.insightRow}>
                <span style={{ ...styles.insightDot, backgroundColor: dotColor }} />
                <div style={styles.insightBody}>
                  <div style={styles.insightText}>{item.text}</div>
                  {item.action && <div style={styles.insightAction}>→ {item.action}</div>}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}

// ── Patients tab ────────────────────────────────────────────────────────────

function PatientsTab({ range, customStart, customEnd }: { range: RangeId; customStart: string; customEnd: string }) {
  const { stats: pts, loading: ptsLoading } = usePatientsStats();
  const { stats: ov, loading: ovLoading } = useOverviewStats(range, customStart, customEnd);
  const { data: trendData, loading: trendLoading } = useComplaintsTrend();
  const { data: overdueData, loading: overdueLoading } = useOverdueReviews();
  const L = (ptsLoading || ovLoading) ? "…" : undefined;

  return (
    <div style={styles.tabBody}>
      <div style={styles.kpiGrid}>
        <KpiTile label="Total patients"   value={L ?? String(pts?.activePatients ?? 0)} delta="" tone="flat" sub="registered in this clinic" />
        <KpiTile label="New this period"   value={L ?? String(ov?.newPatients ?? 0)}  delta="" tone="flat" sub={subFor(range)} />
      </div>

      <AgeDistributionCard ageGroups={pts?.ageGroups ?? {}} genderSplit={pts?.genderSplit ?? {}} loading={ptsLoading} />

      <ComplaintsTrendCard data={trendData} loading={trendLoading} />

      <OverdueReviewsCard data={overdueData} loading={overdueLoading} />
    </div>
  );
}

function AgeDistributionCard({ ageGroups, genderSplit, loading }: {
  ageGroups: Record<string, number>;
  genderSplit: Record<string, number>;
  loading: boolean;
}) {
  const BANDS = ["0–12", "13–25", "26–40", "41–60", "61+"];
  const max = Math.max(...BANDS.map(b => ageGroups[b] ?? 0), 1);
  const male   = genderSplit["male"]   ?? 0;
  const female = genderSplit["female"] ?? 0;
  const other  = genderSplit["other"]  ?? 0;
  const totalG = male + female + other || 1;

  return (
    <div style={styles.twoCol}>
      <section style={styles.card}>
        <header style={styles.cardHeader}>
          <h3 style={styles.cardTitle}>Age distribution</h3>
          <span style={styles.cardSub}>active patients</span>
        </header>
        {loading ? <div style={{ color: colors.neutral400, fontSize: fonts.size.s }}>Loading…</div> : (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {BANDS.map(band => (
              <div key={band}>
                <div style={styles.complaintRow}>
                  <span>{band} yrs</span>
                  <span style={styles.complaintCount}>{ageGroups[band] ?? 0}</span>
                </div>
                <div style={styles.barTrack}>
                  <div style={{ ...styles.barFill, width: `${((ageGroups[band] ?? 0) / max) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section style={styles.card}>
        <header style={styles.cardHeader}>
          <h3 style={styles.cardTitle}>Gender split</h3>
          <span style={styles.cardSub}>active patients</span>
        </header>
        {loading ? <div style={{ color: colors.neutral400, fontSize: fonts.size.s }}>Loading…</div> : (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {[
              { label: "Male",   value: male,   color: colors.active.shade600 },
              { label: "Female", value: female, color: colors.secondary500 },
              { label: "Other",  value: other,  color: colors.neutral300 },
            ].map(row => (
              <div key={row.label}>
                <div style={styles.complaintRow}>
                  <span><Swatch color={row.color} />{row.label}</span>
                  <span style={styles.complaintCount}>{row.value} <span style={{ color: colors.neutral500, fontWeight: 400 }}>({Math.round(row.value / totalG * 100)}%)</span></span>
                </div>
                <div style={styles.barTrack}>
                  <div style={{ ...styles.barFill, width: `${(row.value / totalG) * 100}%`, backgroundColor: row.color }} />
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function ComplaintsTrendCard({ data, loading }: { data: ComplaintTrend[]; loading: boolean }) {
  return (
    <section style={styles.card}>
      <header style={styles.cardHeader}>
        <h3 style={styles.cardTitle}>Top complaints — trend</h3>
        <span style={styles.cardSub}>last 7 weeks</span>
      </header>
      {loading ? <div style={{ color: colors.neutral400, fontSize: fonts.size.s }}>Loading…</div> :
       data.length === 0 ? <div style={{ color: colors.neutral500, fontSize: fonts.size.s }}>No complaint data</div> : (
        <div style={styles.complaintList}>
          {data.map((c) => {
            const last = c.points[c.points.length - 1] ?? 0;
            const first = c.points[0] ?? 0;
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
      )}
    </section>
  );
}


function OverdueReviewsCard({ data, loading }: { data: OverdueReview[]; loading: boolean }) {
  return (
    <section style={styles.card}>
      <header style={styles.cardHeader}>
        <h3 style={styles.cardTitle}>Patients with overdue reviews</h3>
        <span style={styles.cardSub}>{loading ? "…" : `${data.length} patients`} · recommended follow-up not yet done</span>
      </header>
      {loading ? <div style={{ color: colors.neutral400, fontSize: fonts.size.s }}>Loading…</div> :
       data.length === 0 ? <div style={{ color: colors.neutral500, fontSize: fonts.size.s }}>No overdue reviews</div> : (
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>Patient</th>
              <th style={styles.th}>Doctor</th>
              <th style={{ ...styles.th, textAlign: "right" }}>Overdue</th>
            </tr>
          </thead>
          <tbody>
            {data.map((r, idx) => {
              const isLast = idx === data.length - 1;
              const cell = isLast ? { ...styles.td, borderBottom: "none" } : styles.td;
              return (
                <tr key={`${r.patientName}-${idx}`}>
                  <td style={cell}>{r.patientName}</td>
                  <td style={cell}>{r.doctorName}</td>
                  <td style={{ ...cell, textAlign: "right", color: colors.red200 }}>
                    {r.daysSince === 1 ? "1 day ago" : `${r.daysSince} days ago`}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
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


function DoctorsTab({ range, customStart, customEnd }: { range: RangeId; customStart: string; customEnd: string }) {
  const { doctors, loading } = useDoctorStats(range, customStart, customEnd);
  const { data: schedule, loading: schedLoading } = useWeeklySchedule();
  const activeDoctors = doctors.length;

  return (
    <div style={styles.tabBody}>
      <div style={styles.kpiGrid}>
        <KpiTile label="Active doctors" value={loading ? "…" : String(activeDoctors)} delta="" tone="flat" sub="with appointments this period" />
        <KpiTile label="Total appointments" value={loading ? "…" : String(doctors.reduce((s, d) => s + d.appointmentCount, 0))} delta="" tone="flat" sub="across all doctors" />
      </div>

      <DoctorRevenueCard doctors={doctors} loading={loading} />
      <DoctorDaysWorkedCard doctors={doctors} loading={loading} />
      <ScheduleDensityCard schedule={schedule} loading={schedLoading} />
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

function ScheduleDensityCard({ schedule, loading }: {
  schedule: Record<string, Record<string, number>>;
  loading: boolean;
}) {
  const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const doctors = Object.keys(schedule);
  const allVals = doctors.flatMap(d => DAYS.map(day => schedule[d]?.[day] ?? 0));
  const max = Math.max(...allVals, 1);

  return (
    <section style={styles.card}>
      <header style={styles.cardHeader}>
        <h3 style={styles.cardTitle}>This week's schedule density</h3>
        <span style={styles.cardSub}>appointments per day · current week</span>
      </header>
      {loading ? (
        <div style={{ color: colors.neutral400, fontSize: fonts.size.s }}>Loading…</div>
      ) : doctors.length === 0 ? (
        <div style={{ color: colors.neutral500, fontSize: fonts.size.s }}>No appointments scheduled this week</div>
      ) : (
        <div style={{ ...styles.densityGrid, gridTemplateColumns: `120px repeat(7, 1fr)` }}>
          <div />
          {DAYS.map((d) => (
            <div key={d} style={styles.densityHeader}>{d}</div>
          ))}
          {doctors.map((doc) => (
            <React.Fragment key={doc}>
              <div style={{ ...styles.densityRowLabel, fontSize: fonts.size.xs }}>{doc}</div>
              {DAYS.map((day) => {
                const v = schedule[doc]?.[day] ?? 0;
                const intensity = v / max;
                return (
                  <div
                    key={day}
                    title={`${doc} · ${day} · ${v} apts`}
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
      )}
    </section>
  );
}

// ── Clinical tab ────────────────────────────────────────────────────────────

function ClinicalTab({ range, customStart, customEnd }: { range: RangeId; customStart: string; customEnd: string }) {
  const { stats, loading } = useClinicalStats(range, customStart, customEnd);

  return (
    <div style={styles.tabBody}>
      <div style={styles.kpiGrid}>
        <KpiTile label="Review scheduled rate" value={loading ? "…" : `${stats?.reviewScheduledRate ?? 0}%`} delta="" tone="flat" sub="of visits have a follow-up date" />
      </div>

      <div style={styles.twoCol}>
        <DiagnosisMixCard data={stats?.topDiagnoses ?? []} loading={loading} />
        <TopPrescriptionsCard data={stats?.topMedicines ?? []} loading={loading} />
      </div>

      <TopComplaintsCard data={stats?.topComplaints ?? []} loading={loading} />
    </div>
  );
}

function DiagnosisMixCard({ data, loading }: { data: NameCount[]; loading: boolean }) {
  const PALETTE = [colors.active.shade600, colors.active.shade500, colors.secondary500, colors.active.shade400, colors.neutral300, colors.neutral200];
  const total = data.reduce((a, d) => a + d.count, 0) || 1;
  const segments = data.map((d, i) => ({ label: d.name, value: d.count, color: PALETTE[i % PALETTE.length] }));
  return (
    <section style={styles.card}>
      <header style={styles.cardHeader}>
        <h3 style={styles.cardTitle}>Top diagnoses</h3>
        <span style={styles.cardSub}>this period</span>
      </header>
      {loading ? <div style={{ color: colors.neutral400, fontSize: fonts.size.s }}>Loading…</div> : data.length === 0 ? (
        <div style={{ color: colors.neutral500, fontSize: fonts.size.s }}>No data</div>
      ) : (
        <>
          <Donut segments={segments} total={total} />
          <div style={styles.donutLegend}>
            {segments.map((s) => (
              <div key={s.label} style={styles.donutLegendRow}>
                <Swatch color={s.color} />
                <span style={{ flex: 1 }}>{s.label}</span>
                <span style={{ fontWeight: 600 }}>{s.value}</span>
                <span style={{ color: colors.neutral500, marginLeft: 8 }}>{Math.round((s.value / total) * 100)}%</span>
              </div>
            ))}
          </div>
        </>
      )}
    </section>
  );
}

function TopPrescriptionsCard({ data, loading }: { data: NameCount[]; loading: boolean }) {
  const max = Math.max(...data.map(p => p.count), 1);
  return (
    <section style={styles.card}>
      <header style={styles.cardHeader}>
        <h3 style={styles.cardTitle}>Most prescribed medicines</h3>
        <span style={styles.cardSub}>this period</span>
      </header>
      {loading ? <div style={{ color: colors.neutral400, fontSize: fonts.size.s }}>Loading…</div> : data.length === 0 ? (
        <div style={{ color: colors.neutral500, fontSize: fonts.size.s }}>No prescription data</div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {data.map((p) => (
            <div key={p.name}>
              <div style={styles.complaintRow}>
                <span>{p.name}</span>
                <span style={styles.complaintCount}>{p.count}</span>
              </div>
              <div style={styles.barTrack}>
                <div style={{ ...styles.barFill, width: `${(p.count / max) * 100}%` }} />
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

// ── Operations tab ──────────────────────────────────────────────────────────

function OperationsTab({ range, customStart, customEnd }: { range: RangeId; customStart: string; customEnd: string }) {
  const { stats, loading } = useOperationsStats(range, customStart, customEnd);
  const L = loading ? "…" : undefined;

  return (
    <div style={styles.tabBody}>
      <div style={styles.kpiGrid}>
        <KpiTile label="Total appointments" value={L ?? String(stats?.totalAppointments ?? 0)} delta="" tone="flat" sub={subFor(range)} />
        <KpiTile label="Cancellation rate"  value={L ?? `${(stats?.cancellationRate ?? 0).toFixed(1)}%`} delta="" tone="flat" sub={`${stats?.cancelled ?? 0} cancelled`} />
        <KpiTile label="No-show rate"       value={L ?? `${(stats?.noShowRate ?? 0).toFixed(1)}%`}       delta="" tone="flat" sub={`${stats?.noShow ?? 0} no-shows`} />
      </div>
    </div>
  );
}

// ── Finance tab ─────────────────────────────────────────────────────────────

const DUES_AGING = [
  { bucket: "0–7 days",   amount: 12400, count: 8 },
  { bucket: "8–30 days",  amount: 18600, count: 11 },
  { bucket: "31–90 days", amount: 9400,  count: 6 },
  { bucket: "90+ days",   amount: 6800,  count: 4 },
];

function FinanceTab({ range, customStart, customEnd }: { range: RangeId; customStart: string; customEnd: string }) {
  const { stats, loading } = useFinanceStats(range, customStart, customEnd);
  const L = loading ? "…" : undefined;

  const fmtInr = (v: number) => `₹ ${v.toLocaleString("en-IN")}`;

  return (
    <div style={styles.tabBody}>
      <div style={styles.adminBadgeRow}>
        <span style={styles.adminBadge}>Admin view</span>
      </div>

      <div style={styles.kpiGrid}>
        <KpiTile label="Revenue"              value={L ?? fmtInr(stats?.revenue ?? 0)}        delta="" tone="flat" sub={subFor(range)} />
        <KpiTile label="Outstanding dues"     value={L ?? fmtInr(stats?.outstandingDues ?? 0)} delta="" tone="flat" sub="unpaid appointments with fee" />
        <KpiTile label="Avg revenue / visit"  value={L ?? fmtInr(stats?.avgPerVisit ?? 0)}    delta="" tone="flat" sub="paid visits" />
      </div>

      <PaymentMixCard data={stats?.paymentMix ?? {}} loading={loading} />

      <RevenueTrendCardFin data={stats?.revenueTrend ?? []} loading={loading} />
    </div>
  );
}

function PaymentMixCard({ data, loading }: { data: Record<string, number>; loading: boolean }) {
  const PALETTE = [colors.active.shade600, colors.secondary500, colors.active.shade400, colors.neutral300, colors.neutral200];
  const entries = Object.entries(data);
  const total = entries.reduce((a, [, v]) => a + v, 0) || 1;
  const segments = entries.map(([label, value], i) => ({ label, value, color: PALETTE[i % PALETTE.length] }));
  return (
    <section style={styles.card}>
      <header style={styles.cardHeader}>
        <h3 style={styles.cardTitle}>Payment method mix</h3>
      </header>
      {loading ? <div style={{ color: colors.neutral400, fontSize: fonts.size.s }}>Loading…</div> : entries.length === 0 ? (
        <div style={{ color: colors.neutral500, fontSize: fonts.size.s }}>No payment data</div>
      ) : (
        <>
          <Donut segments={segments} total={total} />
          <div style={styles.donutLegend}>
            {segments.map((s) => (
              <div key={s.label} style={styles.donutLegendRow}>
                <Swatch color={s.color} />
                <span style={{ flex: 1 }}>{s.label}</span>
                <span style={{ fontWeight: 600 }}>₹ {s.value.toLocaleString("en-IN")}</span>
                <span style={{ color: colors.neutral500, marginLeft: 8 }}>{Math.round((s.value / total) * 100)}%</span>
              </div>
            ))}
          </div>
        </>
      )}
    </section>
  );
}

function RevenueTrendCardFin({ data, loading }: { data: DailyCount[]; loading: boolean }) {
  const values = data.map(d => d.count);
  const dayLabels   = data.map(d => new Date(d.date).toLocaleDateString("en-US", { weekday: "short" }));
  const dateLabels  = data.map(d => new Date(d.date).toLocaleDateString("en-US", { day: "numeric", month: "short" }));

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
  const slotW = barCount > 0 ? innerW / barCount : innerW;
  const barW = Math.min(64, slotW * 0.62);
  const todayIdx = barCount - 1;

  return (
    <section style={styles.card}>
      <header style={styles.cardHeader}>
        <h3 style={styles.cardTitle}>Revenue trend</h3>
        <span style={styles.cardSub}>₹ per day · paid appointments</span>
      </header>
      {loading && <div style={{ color: colors.neutral400, fontSize: fonts.size.s }}>Loading…</div>}
      {!loading && data.length === 0 && <div style={{ color: colors.neutral500, fontSize: fonts.size.s }}>No revenue data for this period</div>}
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

function InClinicTile({ data, live, loading }: { data: { waiting: number; inConsult: number; done: number }; live: boolean; loading?: boolean }) {
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

function PeakHoursCard({ peakData, loading }: { peakData: Record<string, Record<number, number>>; loading: boolean }) {
  const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const HOURS = [8, 9, 10, 11, 12, 13, 14, 15, 16, 17];
  const allVals = DAYS.flatMap(d => HOURS.map(h => peakData[d]?.[h] ?? 0));
  const max = Math.max(...allVals, 1);

  return (
    <section style={styles.card}>
      <header style={styles.cardHeader}>
        <h3 style={styles.cardTitle}>Peak hours</h3>
        <span style={styles.cardSub}>last 30 days</span>
      </header>
      {loading ? <div style={{ color: colors.neutral400, fontSize: fonts.size.s }}>Loading…</div> : (
        <div style={styles.heatmapMini}>
          {DAYS.map((day) => (
            <div key={day} style={{ ...styles.heatmapMiniRow, gridTemplateColumns: `32px repeat(${HOURS.length}, 1fr)` }}>
              <span style={styles.heatmapMiniAxis}>{day}</span>
              {HOURS.map((h) => {
                const v = peakData[day]?.[h] ?? 0;
                const intensity = v / max;
                return (
                  <div
                    key={h}
                    title={`${day} ${h}:00 — ${v} apts`}
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
      )}
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

function TopComplaintsCard({ data, loading }: { data: { name: string; count: number }[]; loading?: boolean }) {
  const max = Math.max(...data.map((d) => d.count), 1);
  return (
    <section style={styles.card}>
      <header style={styles.cardHeader}>
        <h3 style={styles.cardTitle}>Top complaints</h3>
      </header>
      {loading ? <div style={{ color: colors.neutral400, fontSize: fonts.size.s }}>Loading…</div> :
       data.length === 0 ? (
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

function FootfallTrendCard({ hourly, daily, range, loading }: {
  hourly: { hour: number; count: number }[];
  daily: DailyCount[];
  range: RangeId;
  loading: boolean;
}) {
  const isToday = range === "today";
  const labels  = isToday
    ? hourly.map(d => `${d.hour % 12 || 12}${d.hour < 12 ? "a" : "p"}`)
    : daily.map(d => new Date(d.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }));
  const values  = isToday ? hourly.map(d => d.count) : daily.map(d => d.count);
  const max = Math.max(...values, 1);
  const title = isToday ? "Footfall by hour" : range === "week" ? "Footfall this week" : range === "month" ? "Footfall last 30 days" : range === "year" ? "Footfall last 12 months" : "Footfall — custom range";

  return (
    <section style={styles.card}>
      <header style={styles.cardHeader}>
        <h3 style={styles.cardTitle}>{title}</h3>
      </header>
      {loading ? <div style={{ color: colors.neutral400, fontSize: fonts.size.s }}>Loading…</div> :
       values.length === 0 ? (
        <div style={{ color: colors.neutral500, fontSize: fonts.size.s, padding: spacing.m }}>No appointment data for this period.</div>
      ) : (
        <>
          <div style={styles.barChart}>
            {values.map((v, i) => (
              <div key={i} style={styles.barChartCol} title={`${labels[i]}: ${v}`}>
                <div style={{ ...styles.barChartBar, height: `${(v / max) * 100}%` }} />
              </div>
            ))}
          </div>
          <div style={styles.barChartLabels}>
            {labels.map((l, i) => (
              <span key={i} style={{ flex: 1, textAlign: "center", fontSize: fonts.size.xs, color: colors.neutral500 }}>
                {values.length > 14 ? (i % Math.ceil(values.length / 7) === 0 ? l : "") : l}
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
