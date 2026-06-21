import React from "react";
import { colors, fonts, radii, spacing } from "../../styles/theme";
import { PrescriptionIcon } from "../../iconsUtil";
import type { Patient } from "../../hooks/usePatients";
import type { NavTab } from "../SideNav";
import { getActiveSessions, type ActiveSession } from "../../api/visits";

// ─── Active sessions (server-driven) ─────────────────────────────────────────
//
// The live "Active Sessions" tray lists the consultations currently in
// progress — visits whose pad the doctor has opened (session started) but not
// yet completed. The source of truth is the backend (`GET /api/active-sessions`,
// derived from session_started_at / session_ended_at), so the list and the
// elapsed timers are accurate across devices and survive refreshes — unlike the
// old localStorage timer this replaces.

const PENDING_NAV_KEY = "docodile_pending_session_nav";

// Set when the doctor clicks a tray item — picked up by PrescriptionPage on
// next mount so it can pre-select the right patient/appointment.
export type PendingSessionNav = {
  patient: Patient;
  appointmentId: string | null;
  // Sidebar tab to return to when the user hits Back from the Prescription
  // page. Lets callers bring the doctor back where they came from.
  returnTab?: NavTab;
  // Left-rail action to land on inside the chart (0=Visits, 1=Files,
  // 2=Timeline, 3=Bills). Defaults to Visits when omitted.
  initialAction?: number;
};

// Short-lived in-memory cache so a quick StrictMode remount (or any remount
// within the same JS tick) can still see the pending nav after localStorage
// has been wiped. Cleared 1s after writing.
let memNav: PendingSessionNav | null = null;
let memNavClearTimer: number | null = null;

export function setPendingSessionNav(nav: PendingSessionNav) {
  try {
    localStorage.setItem(PENDING_NAV_KEY, JSON.stringify(nav));
    memNav = nav;
    if (memNavClearTimer != null) window.clearTimeout(memNavClearTimer);
    memNavClearTimer = window.setTimeout(() => { memNav = null; memNavClearTimer = null; }, 1000);
    window.dispatchEvent(new CustomEvent("docodile:session-nav", { detail: nav }));
  } catch {
    /* ignore */
  }
}

export function consumePendingSessionNav(): PendingSessionNav | null {
  try {
    const raw = localStorage.getItem(PENDING_NAV_KEY);
    if (raw) {
      localStorage.removeItem(PENDING_NAV_KEY);
      const parsed = JSON.parse(raw) as PendingSessionNav;
      memNav = parsed;
      if (memNavClearTimer != null) window.clearTimeout(memNavClearTimer);
      memNavClearTimer = window.setTimeout(() => { memNav = null; memNavClearTimer = null; }, 1000);
      return parsed;
    }
    // Storage empty — fall back to the in-memory cache so a StrictMode
    // double-mount can still see the freshly cleared value.
    return memNav;
  } catch {
    return memNav;
  }
}

// HH:MM:SS once a consultation passes an hour, MM:SS below that.
const formatElapsed = (totalSec: number): string => {
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  const mm = String(m).padStart(2, "0");
  const ss = String(s).padStart(2, "0");
  return h > 0 ? `${h}:${mm}:${ss}` : `${mm}:${ss}`;
};

// A session counts live for this long; past it we stop ticking and show a
// static "Since <start time>" — a visit left open for hours doesn't run a
// forever-counter, but is still listed as active.
const SESSION_LIVE_MS = 6 * 60 * 60 * 1000;
const formatSince = (iso: string) =>
  `Since ${new Date(iso).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}`;

// Build the minimal Patient the Prescription page needs to open the pad. The
// chart re-fetches full detail on mount; this just seeds the selection.
const toPatient = (s: ActiveSession): Patient => ({
  id: s.patientId,
  name: s.name,
  phone: s.phone,
  email: s.email,
  gender: s.gender,
  dob: s.dob,
  age: s.age,
  displayNo: s.displayNo,
  lastVisitDate: null,
  treatingDoctorIds: [],
  treatingDepartments: [],
});

// ─── Component ───────────────────────────────────────────────────────────────

type SessionTrayButtonProps = {
  // Switches the home tab. Passed in so the parent (TopNav → HomePage) owns
  // the tab-state contract instead of this component poking localStorage.
  onNavigate: (tab: NavTab) => void;
};

export function SessionTrayButton({ onNavigate }: SessionTrayButtonProps) {
  const [open, setOpen] = React.useState(false);
  const [hovered, setHovered] = React.useState(false);
  const [sessions, setSessions] = React.useState<ActiveSession[]>([]);
  const [now, setNow] = React.useState(() => Date.now());
  const wrapperRef = React.useRef<HTMLDivElement>(null);

  // Poll the list from the backend — faster while open so newly-started /
  // just-completed sessions appear/disappear promptly, slower while closed.
  // Transient failures keep the last good list rather than blanking the tray.
  React.useEffect(() => {
    let cancelled = false;
    const load = () =>
      getActiveSessions()
        .then((s) => { if (!cancelled) setSessions(s); })
        .catch(() => { /* keep last good list */ });
    load();
    const id = window.setInterval(load, open ? 5000 : 15000);
    return () => { cancelled = true; window.clearInterval(id); };
  }, [open]);

  // Only tick while at least one session is still within its live window.
  // Once every session is past 6h they render a static "Since …" that needs
  // no updates, so we stop the interval entirely — zero ongoing work.
  const hasLiveSession = sessions.some((s) => {
    const startMs = new Date(s.sessionStartedAt).getTime();
    return !Number.isNaN(startMs) && Date.now() - startMs < SESSION_LIVE_MS;
  });
  React.useEffect(() => {
    if (!hasLiveSession) return;
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, [hasLiveSession]);

  // Close on outside click — same pattern as the profile dropdown next to it.
  React.useEffect(() => {
    if (!open) return;
    function onMouseDown(e: MouseEvent) {
      if (!wrapperRef.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onMouseDown);
    return () => document.removeEventListener("mousedown", onMouseDown);
  }, [open]);

  if (sessions.length === 0) return null;

  const handleSessionClick = (s: ActiveSession) => {
    setPendingSessionNav({ patient: toPatient(s), appointmentId: s.appointmentId });
    setOpen(false);
    onNavigate("Prescription");
  };

  return (
    <div ref={wrapperRef} style={styles.wrapper}>
      <button
        type="button"
        aria-label={`${sessions.length} active session${sessions.length === 1 ? "" : "s"}`}
        style={{ ...styles.iconButton, ...(hovered ? styles.iconButtonHover : {}) }}
        onClick={() => setOpen((v) => !v)}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        <PrescriptionIcon />
        <span style={styles.badge}>{sessions.length}</span>
      </button>

      {open && (
        <div style={styles.dropdown}>
          <p style={styles.dropdownTitle}>Active sessions</p>
          {sessions.map((s) => {
            const startMs = new Date(s.sessionStartedAt).getTime();
            const elapsedMs = now - startMs;
            // Live count for the first 6h, then a static start-time stamp.
            const isLive = !Number.isNaN(startMs) && elapsedMs < SESSION_LIVE_MS;
            const label = isLive
              ? formatElapsed(Math.max(0, Math.floor(elapsedMs / 1000)))
              : formatSince(s.sessionStartedAt);
            return (
              <button
                key={s.visitId}
                type="button"
                style={styles.sessionRow}
                onClick={() => handleSessionClick(s)}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = colors.active.shade100)}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
              >
                <span style={styles.sessionName}>{s.name}</span>
                <span style={styles.sessionTimerWrap}>
                  <span style={{ ...styles.sessionTimer, color: isLive ? colors.green200 : colors.neutral500 }}>
                    {label}
                  </span>
                </span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  wrapper: {
    position: "relative",
  },
  iconButton: {
    position: "relative",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: 48,
    height: 48,
    borderRadius: "50%",
    backgroundColor: "transparent",
    border: "none",
    cursor: "pointer",
    transition: "background-color 0.15s ease",
  },
  iconButtonHover: {
    backgroundColor: colors.neutralAlphaBlack,
  },
  // Numeric pill at the top-right of the icon, similar to a notification dot.
  badge: {
    position: "absolute",
    top: 6,
    right: 6,
    minWidth: 18,
    height: 18,
    padding: "0 5px",
    borderRadius: 999,
    backgroundColor: colors.neutral900,
    color: colors.neutral100,
    fontFamily: fonts.family.primary,
    fontSize: fonts.size.xs,
    lineHeight: "18px",
    textAlign: "center",
    boxSizing: "border-box",
  },
  dropdown: {
    position: "absolute",
    top: 56,
    right: 0,
    minWidth: 280,
    backgroundColor: colors.neutral100,
    borderRadius: radii.m,
    boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
    border: `1px solid ${colors.neutral200}`,
    padding: `${spacing.m} ${spacing.xs} ${spacing.xs}`,
    zIndex: 3100,
    display: "flex",
    flexDirection: "column",
    gap: 2,
  },
  dropdownTitle: {
    fontFamily: fonts.family.primary,
    fontSize: fonts.size.xs,
    color: colors.neutral500,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    margin: `${spacing["2xs"]} ${spacing.s}`,
  },
  sessionRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.s,
    padding: "10px 16px",
    borderRadius: radii.m,
    border: "none",
    backgroundColor: "transparent",
    cursor: "pointer",
    width: "100%",
    textAlign: "left",
    transition: "background-color 0.15s ease",
  },
  sessionName: {
    fontFamily: fonts.family.primary,
    fontSize: fonts.size.s,
    color: colors.neutral900,
  },
  sessionTimerWrap: {
    display: "inline-flex",
    alignItems: "baseline",
    gap: 6,
    whiteSpace: "nowrap",
  },
  sessionTimer: {
    fontFamily: fonts.family.secondary,
    fontSize: fonts.size.l,
    fontVariantNumeric: "tabular-nums",
    whiteSpace: "nowrap",
  },
};
