import React, { useEffect, useState } from "react";
import { colors, fonts, spacing } from "../../styles/theme";
import { MyHoursCalendar } from "../../components/DoctorSchedule";
import { MemoBoard } from "../../components/MemoBoard";
import { AnalogClock } from "../../components/AnalogClock";
import { API_BASE_URL } from "../../apiConfig";

// ─── Greeting helpers ─────────────────────────────────────────────────────────

function deriveName(): string {
  const token = localStorage.getItem("docodile_token");
  if (token) {
    try {
      const payload = JSON.parse(atob(token.split(".")[1] || ""));
      const email: string = payload.email || "";
      const local = email.split("@")[0];
      if (local) return local.charAt(0).toUpperCase() + local.slice(1);
    } catch {
      /* ignore */
    }
  }
  return "Doctor";
}

const DESK_STYLE_ID = "docodile-desk-hover";
function ensureDeskStyles() {
  if (typeof document === "undefined") return;
  if (document.getElementById(DESK_STYLE_ID)) return;
  const style = document.createElement("style");
  style.id = DESK_STYLE_ID;
  style.innerHTML = `
    .docodile-paper-sheet { transition: transform 0.18s ease; }
    .docodile-papers:hover .docodile-paper-sheet:nth-child(odd) { transform: translate(-1px, -1px) rotate(-1deg); }
    .docodile-papers:hover .docodile-paper-sheet:nth-child(even) { transform: translate(1px, -1px) rotate(1deg); }
  `;
  document.head.appendChild(style);
}

// ─── Stats (fetched from today's appointment queue) ───────────────────────────

const EMPTY_STATS = { totalAppointments: 0, newPatients: 0, reviews: 0, procedures: 0 };
const NON_PROCEDURE_SERVICES = new Set(["Consultation", ""]);

function useTodayStats() {
  const [stats, setStats] = useState(EMPTY_STATS);
  useEffect(() => {
    const token = localStorage.getItem("docodile_token");
    if (!token) return;
    const today = new Date();
    const dateStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
    fetch(`${API_BASE_URL}/api/tenant/appointments?date=${dateStr}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.ok ? r.json() : [])
      .then((apts: any[]) => {
        const active = apts.filter((a) => !["CANCELLED", "NO_SHOW"].includes(a.status));
        setStats({
          totalAppointments: active.length,
          newPatients: active.filter((a) => a.type?.toUpperCase() === "NEW").length,
          reviews: active.filter((a) => a.type?.toUpperCase() === "REVIEW").length,
          procedures: active.filter((a) => a.service && !NON_PROCEDURE_SERVICES.has(a.service)).length,
        });
      })
      .catch(() => {/* network error — keep zeros */});
  }, []);
  return stats;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function HomeView() {
  useEffect(() => { ensureDeskStyles(); }, []);
  const name = deriveName();
  const stats = useTodayStats();

  return (
    <div style={styles.container}>
      <div style={styles.topSection}>
        <h1 style={styles.greeting}>
          Hello, {name} <span aria-hidden>👋</span>
        </h1>

        <div style={styles.mainGrid}>
          <div style={styles.memoSlot}>
            <MemoBoard />
          </div>
          <div style={styles.calendarSlot}>
            <MyHoursCalendar />
          </div>
        </div>
      </div>

      {/* Full-width desk band at the bottom of the page */}
      <div style={styles.desk}>
        <div style={styles.deskItems}>
          <div style={styles.deskLeftGroup}>
            <div style={styles.papersSlot}>
              <PaperStack count={stats.totalAppointments} />
            </div>
            <div style={styles.computerSlot}>
              <Computer stats={stats} />
            </div>
          </div>
          <div style={styles.clockSlot}>
            <DeskClock />
          </div>
        </div>
        <div style={styles.deskFront} />
      </div>
    </div>
  );
}

// ─── Paper stack ──────────────────────────────────────────────────────────────
// One sheet per appointment, capped so very large numbers stay visually sane.

function PaperStack({ count }: { count: number }) {
  const sheets = Array.from({ length: count });
  return (
    <div
      className="docodile-papers"
      style={styles.papersWrap}
      aria-label={`${count} appointments`}
      title={`${count} appointment${count === 1 ? "" : "s"}`}
    >
      {sheets.map((_, i) => (
        <div key={i} style={styles.paperSheet} />
      ))}
    </div>
  );
}

// ─── Desk clock (tan rounded-top case resting on the table) ─────────────────

function DeskClock() {
  return (
    <div style={styles.deskClockWrap}>
      <svg
        width="140"
        height="167"
        viewBox="0 0 140 167"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={styles.deskClockBody}
        aria-hidden
      >
        <path
          d="M85.1992 1.66506C80.2788 0.574958 75.1637 0 69.9136 0C64.6636 0 59.5483 0.574958 54.6279 1.66506C24.8339 8.26601 2.18347 33.7564 0 64.8664V74.7447V167H140V69.8056C140 36.482 116.556 8.61215 85.1992 1.66506Z"
          fill="#EDDFBA"
        />
        <ellipse cx="69.9137" cy="69.8057" rx="62.4195" ry="62.1694" fill="#F9F9ED" />
      </svg>
      <div style={styles.deskClockFace}>
        <AnalogClock size={130} />
      </div>
    </div>
  );
}

// ─── Computer (SVG-based, stats overlaid on the screen) ─────────────────────

type Stats = typeof EMPTY_STATS;

function Computer({ stats }: { stats: Stats }) {
  const rows: Array<[string, number]> = [
    ["Total Appointments", stats.totalAppointments],
    ["New Patients", stats.newPatients],
    ["Reviews", stats.reviews],
    ["Procedures", stats.procedures],
  ];
  return (
    <div className="docodile-computer" style={styles.computerWrap}>
      <ComputerSvg />
      {/* Two-column grid: [label + dots] [value]. The auto-sized value column
          is shared across all rows, so every number sits at the same X. */}
      <div style={styles.screenOverlay}>
        {rows.map(([label, value]) => (
          <React.Fragment key={label}>
            <span style={styles.labelDots}>
              <span style={styles.statLabel}>{label}</span>
              <span style={styles.statDots} aria-hidden />
            </span>
            <span style={styles.statValue}>{value}</span>
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}

function ComputerSvg() {
  return (
    <svg
      width="100%"
      viewBox="0 0 456 340"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ display: "block" }}
      aria-hidden
    >
      <path d="M398.281 12C398.281 5.3726 392.909 0 386.281 0H12.0006C5.3732 0 0.000610352 5.37258 0.000610352 12V259.175C0.000610352 265.803 5.3732 271.175 12.0006 271.175H386.281C392.909 271.175 398.281 265.803 398.281 259.175V12Z" fill="#EECB99"/>
      <path d="M398.281 12C398.281 5.3726 392.909 0 386.281 0H70.0349C63.4075 0 58.0349 5.37258 58.0349 12V259.175C58.0349 265.803 63.4075 271.175 70.0349 271.175H386.281C392.909 271.175 398.281 265.803 398.281 259.175V12Z" fill="#EDDFBA"/>
      <rect width="92.9593" height="68.624" transform="matrix(-1 0 0 1 245.625 271.175)" fill="#EECB99"/>
      <rect width="79.414" height="68.624" transform="matrix(-1 0 0 1 245.625 271.175)" fill="#EDDFBA"/>
      <path d="M435.763 294.367C434.816 292.166 432.649 290.74 430.253 290.74H35.9209L57.0475 339.799H455.328L435.763 294.367Z" fill="#EDDFBA"/>
      <path d="M35.9202 290.74L57.0469 339.799H35.9202V290.74Z" fill="#EECB99"/>
      <path d="M98.7324 302.125C98.7324 299.916 96.9416 298.125 94.7324 298.125H75.6248C73.4156 298.125 71.6248 299.916 71.6248 302.125V305.214C71.6248 307.423 73.4156 309.214 75.6248 309.214H94.7324C96.9416 309.214 98.7324 307.423 98.7324 305.214V302.125Z" fill="#F3F3DC"/>
      <path d="M129.84 302.125C129.84 299.916 128.049 298.125 125.84 298.125H106.732C104.523 298.125 102.732 299.916 102.732 302.125V305.214C102.732 307.423 104.523 309.214 106.732 309.214H125.84C128.049 309.214 129.84 307.423 129.84 305.214V302.125Z" fill="#F3F3DC"/>
      <path d="M160.947 302.125C160.947 299.916 159.156 298.125 156.947 298.125H137.84C135.63 298.125 133.84 299.916 133.84 302.125V305.214C133.84 307.423 135.63 309.214 137.84 309.214H156.947C159.156 309.214 160.947 307.423 160.947 305.214V302.125Z" fill="#F3F3DC"/>
      <path d="M192.057 302.125C192.057 299.916 190.266 298.125 188.057 298.125H168.949C166.74 298.125 164.949 299.916 164.949 302.125V305.214C164.949 307.423 166.74 309.214 168.949 309.214H188.057C190.266 309.214 192.057 307.423 192.057 305.214V302.125Z" fill="#F3F3DC"/>
      <path d="M223.164 302.125C223.164 299.916 221.373 298.125 219.164 298.125H200.056C197.847 298.125 196.056 299.916 196.056 302.125V305.214C196.056 307.423 197.847 309.214 200.056 309.214H219.164C221.373 309.214 223.164 307.423 223.164 305.214V302.125Z" fill="#F3F3DC"/>
      <path d="M254.271 302.125C254.271 299.916 252.481 298.125 250.271 298.125H231.164C228.955 298.125 227.164 299.916 227.164 302.125V305.214C227.164 307.423 228.955 309.214 231.164 309.214H250.271C252.481 309.214 254.271 307.423 254.271 305.214V302.125Z" fill="#F3F3DC"/>
      <path d="M285.379 302.125C285.379 299.916 283.588 298.125 281.379 298.125H262.271C260.062 298.125 258.271 299.916 258.271 302.125V305.214C258.271 307.423 260.062 309.214 262.271 309.214H281.379C283.588 309.214 285.379 307.423 285.379 305.214V302.125Z" fill="#F3F3DC"/>
      <path d="M316.486 302.125C316.486 299.916 314.695 298.125 312.486 298.125H293.379C291.17 298.125 289.379 299.916 289.379 302.125V305.214C289.379 307.423 291.17 309.214 293.379 309.214H312.486C314.695 309.214 316.486 307.423 316.486 305.214V302.125Z" fill="#F3F3DC"/>
      <path d="M347.594 302.125C347.594 299.916 345.803 298.125 343.594 298.125H324.486C322.277 298.125 320.486 299.916 320.486 302.125V305.214C320.486 307.423 322.277 309.214 324.486 309.214H343.594C345.803 309.214 347.594 307.423 347.594 305.214V302.125Z" fill="#F3F3DC"/>
      <path d="M378.701 302.125C378.701 299.916 376.91 298.125 374.701 298.125H355.594C353.384 298.125 351.594 299.916 351.594 302.125V305.214C351.594 307.423 353.384 309.214 355.594 309.214H374.701C376.91 309.214 378.701 307.423 378.701 305.214V302.125Z" fill="#F3F3DC"/>
      <path d="M409.809 302.125C409.809 299.916 408.018 298.125 405.809 298.125H386.701C384.492 298.125 382.701 299.916 382.701 302.125V305.214C382.701 307.423 384.492 309.214 386.701 309.214H405.809C408.018 309.214 409.809 307.423 409.809 305.214V302.125Z" fill="#F3F3DC"/>
      <path d="M108.732 318.125C108.732 315.916 106.942 314.125 104.732 314.125H85.6248C83.4156 314.125 81.6248 315.916 81.6248 318.125V321.214C81.6248 323.423 83.4156 325.214 85.6248 325.214H104.732C106.942 325.214 108.732 323.423 108.732 321.214V318.125Z" fill="#F3F3DC"/>
      <path d="M139.84 318.125C139.84 315.916 138.049 314.125 135.84 314.125H116.732C114.523 314.125 112.732 315.916 112.732 318.125V321.214C112.732 323.423 114.523 325.214 116.732 325.214H135.84C138.049 325.214 139.84 323.423 139.84 321.214V318.125Z" fill="#F3F3DC"/>
      <path d="M170.947 318.125C170.947 315.916 169.156 314.125 166.947 314.125H147.84C145.63 314.125 143.84 315.916 143.84 318.125V321.214C143.84 323.423 145.63 325.214 147.84 325.214H166.947C169.156 325.214 170.947 323.423 170.947 321.214V318.125Z" fill="#F3F3DC"/>
      <path d="M202.057 318.125C202.057 315.916 200.266 314.125 198.057 314.125H178.949C176.74 314.125 174.949 315.916 174.949 318.125V321.214C174.949 323.423 176.74 325.214 178.949 325.214H198.057C200.266 325.214 202.057 323.423 202.057 321.214V318.125Z" fill="#F3F3DC"/>
      <path d="M233.164 318.125C233.164 315.916 231.373 314.125 229.164 314.125H210.056C207.847 314.125 206.056 315.916 206.056 318.125V321.214C206.056 323.423 207.847 325.214 210.056 325.214H229.164C231.373 325.214 233.164 323.423 233.164 321.214V318.125Z" fill="#F3F3DC"/>
      <path d="M264.271 318.125C264.271 315.916 262.481 314.125 260.271 314.125H241.164C238.955 314.125 237.164 315.916 237.164 318.125V321.214C237.164 323.423 238.955 325.214 241.164 325.214H260.271C262.481 325.214 264.271 323.423 264.271 321.214V318.125Z" fill="#F3F3DC"/>
      <path d="M295.379 318.125C295.379 315.916 293.588 314.125 291.379 314.125H272.271C270.062 314.125 268.271 315.916 268.271 318.125V321.214C268.271 323.423 270.062 325.214 272.271 325.214H291.379C293.588 325.214 295.379 323.423 295.379 321.214V318.125Z" fill="#F3F3DC"/>
      <path d="M326.486 318.125C326.486 315.916 324.695 314.125 322.486 314.125H303.379C301.17 314.125 299.379 315.916 299.379 318.125V321.214C299.379 323.423 301.17 325.214 303.379 325.214H322.486C324.695 325.214 326.486 323.423 326.486 321.214V318.125Z" fill="#F3F3DC"/>
      <path d="M357.594 318.125C357.594 315.916 355.803 314.125 353.594 314.125H334.486C332.277 314.125 330.486 315.916 330.486 318.125V321.214C330.486 323.423 332.277 325.214 334.486 325.214H353.594C355.803 325.214 357.594 323.423 357.594 321.214V318.125Z" fill="#F3F3DC"/>
      <path d="M388.701 318.125C388.701 315.916 386.91 314.125 384.701 314.125H365.594C363.384 314.125 361.594 315.916 361.594 318.125V321.214C361.594 323.423 363.384 325.214 365.594 325.214H384.701C386.91 325.214 388.701 323.423 388.701 321.214V318.125Z" fill="#F3F3DC"/>
      <path d="M419.809 318.125C419.809 315.916 418.018 314.125 415.809 314.125H396.701C394.492 314.125 392.701 315.916 392.701 318.125V321.214C392.701 323.423 394.492 325.214 396.701 325.214H415.809C418.018 325.214 419.809 323.423 419.809 321.214V318.125Z" fill="#F3F3DC"/>
      <path d="M385.414 26.9697C385.414 20.3423 380.041 14.9697 373.414 14.9697H85.9404C79.313 14.9697 73.9404 20.3423 73.9404 26.9697V237.77C73.9404 244.398 79.313 249.77 85.9404 249.77H373.414C380.041 249.77 385.414 244.398 385.414 237.77V26.9697Z" fill="white"/>
    </svg>
  );
}

// Screen rect inside the SVG (in viewBox units): x 73.94..385.41, y 14.97..249.77
// As percentages of the 456×340 viewBox:
const SCREEN_LEFT_PCT = (73.94 / 456) * 100;
const SCREEN_TOP_PCT = (14.97 / 340) * 100;
const SCREEN_WIDTH_PCT = ((385.41 - 73.94) / 456) * 100;
const SCREEN_HEIGHT_PCT = ((249.77 - 14.97) / 340) * 100;

// ─── Styles ────────────────────────────────────────────────────────────────────

const styles: Record<string, React.CSSProperties> = {
  container: {
    // The home block is a CONSTANT-width, centered column (capped at
    // --home-content-max). The side gutters between it and the screen edges
    // are what stretch as the viewport grows — that's the responsive area.
    // Top section flows from the top; the desk is absolutely pinned to the
    // bottom of THIS box. overflow:hidden prevents page scroll when the
    // viewport is short; the negative bottom margin lets the desk strip
    // reach past mainContent's 24px bottom padding to the viewport bottom.
    position: "relative",
    width: "100%",
    maxWidth: "var(--home-content-max)",
    marginLeft: "auto",
    marginRight: "auto",
    flex: 1,
    height: "calc(100% + 24px)",
    marginBottom: -24,
    overflow: "hidden",
  },
  topSection: {
    display: "flex",
    flexDirection: "column",
    gap: spacing.xl,
  },

  greeting: {
    margin: 0,
    textAlign: "center",
    fontFamily: fonts.family.secondary,
    fontSize: fonts.size.h5,
    lineHeight: fonts.lineHeight.h5,
    fontWeight: fonts.weight.regular,
    color: colors.neutral900,
  },

  mainGrid: {
    display: "grid",
    // Below lg (1440) the CSS vars collapse the memo's 640px floor to 0
    // and shrink the calendar to 280px, so the grid never demands more
    // width than is actually available. At >=lg the values match the
    // original design exactly.
    gridTemplateColumns: "minmax(var(--home-memo-min, 640px), 1fr) var(--home-cal-w, 352px)",
    gap: "var(--home-grid-gap, 40px)",
    alignItems: "start",
  },
  memoSlot: {
    minWidth: 0,
    // Width is pre-divided by the scale so the visible board fills the
    // grid column after shrinking (e.g. scale 0.8 → width 125%, visual 100%).
    // At baseline scale=1, width=100% (no-op).
    width: "calc(100% / var(--home-memo-scale, 1))",
    transform: "scale(var(--home-memo-scale, 1))",
    transformOrigin: "top left",
  },
  calendarSlot: {
    minWidth: 0,
    paddingTop: spacing.xs,
    // Anchored top-right so the calendar hugs the column's right edge.
    transform: "scale(var(--home-cal-scale, 1))",
    transformOrigin: "top right",
  },

  // ─── Full-width desk band absolutely pinned to the bottom of the viewport ───
  desk: {
    // Locked to the bottom of the capped content box (not the viewport), so
    // the table strip is the same width as the content above it and the side
    // gutters show the page background.
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    display: "flex",
    flexDirection: "column",
    // The desk is purely decorative (papers / computer / clock — no clicks).
    // pointer-events:none lets clicks fall through to whatever's underneath
    // (e.g., the MemoBoard's "+" FAB when the desk overlaps it on short
    // viewports).
    pointerEvents: "none" as const,
  },
  deskFront: {
    height: "var(--home-desk-front-h, 84px)",
    backgroundColor: colors.primary400, // #EDCA99
  },
  deskItems: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-end",
    gap: spacing.l,
    padding: `0 ${spacing["3xl"]}`,
    width: "100%",
  },
  deskLeftGroup: {
    display: "flex",
    alignItems: "flex-end",
    gap: "var(--home-desk-left-gap, 40px)",
    minWidth: 0,
  },
  papersSlot: {
    display: "flex",
    justifyContent: "flex-start",
    alignItems: "flex-end",
  },
  computerSlot: {
    display: "flex",
    justifyContent: "flex-start",
    alignItems: "flex-end",
  },
  clockSlot: {
    display: "flex",
    justifyContent: "center",
    alignItems: "flex-end",
    marginRight: "var(--home-clock-mr, 0px)",
  },
  deskClockWrap: {
    position: "relative",
    width: 140,
    height: 167,
    // Scaled anchored at bottom-center so it stays sitting on the desk.
    transform: "scale(var(--home-clock-scale, 1))",
    transformOrigin: "bottom center",
  },
  deskClockBody: {
    display: "block",
    width: "100%",
    height: "100%",
  },
  // Center the AnalogClock over the F9F9ED face ellipse (centered at viewBox (70, 70), r ~62).
  // Clock size 130 makes its outer ring (r=96 of 100 in its viewBox) ≈ 125px, matching the cream face circle.
  deskClockFace: {
    position: "absolute",
    top: 5,
    left: "50%",
    transform: "translateX(-50%)",
    width: 130,
    height: 130,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },

  // ─── Paper stack ────────────────────────────────────────────────────────────
  // One thin white strip per appointment, stacked vertically to look like a pile of paper viewed edge-on.
  papersWrap: {
    display: "flex",
    flexDirection: "column-reverse",
    alignItems: "center",
    width: 145,
    gap: 1,
  },
  paperSheet: {
    width: 145,
    height: 10,
    backgroundColor: colors.neutral100,
    borderRadius: 1,
  },

  // ─── Computer ───────────────────────────────────────────────────────────────
  computerWrap: {
    position: "relative",
    width: "var(--home-computer-w, 480px)",
    flexShrink: 0,
  },
  screenOverlay: {
    position: "absolute",
    left: `${SCREEN_LEFT_PCT}%`,
    top: `${SCREEN_TOP_PCT}%`,
    width: `${SCREEN_WIDTH_PCT}%`,
    height: `${SCREEN_HEIGHT_PCT}%`,
    padding: "12% 8%",
    boxSizing: "border-box",
    // 2-col grid: [label + dots] auto-sized, [value] auto-sized.
    // alignContent:center vertically centers the rows inside the screen.
    display: "grid",
    gridTemplateColumns: "1fr auto",
    columnGap: 8,
    rowGap: "6%",
    alignContent: "center",
    alignItems: "baseline",
    fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
    color: colors.neutral900,
    fontSize: "var(--home-computer-fs, 14px)",
  },
  // Wraps label + dots so they live in one grid cell and the dots stretch
  // to fill the remaining horizontal space before the value column.
  labelDots: {
    display: "flex",
    alignItems: "baseline",
    gap: 6,
    minWidth: 0,
  },
  statLabel: {
    whiteSpace: "nowrap",
  },
  statDots: {
    flex: 1,
    borderBottom: `1px dotted ${colors.neutral400}`,
    transform: "translateY(-3px)",
  },
  statValue: {
    fontWeight: 700,
    textAlign: "right",
  },
};
