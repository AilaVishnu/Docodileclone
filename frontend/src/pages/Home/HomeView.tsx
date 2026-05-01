import React, { useEffect } from "react";
import { colors, fonts, radii, spacing } from "../../styles/theme";
import { ReactComponent as IconStar } from "../../assets/icons/star.svg";
import { ReactComponent as IconHistory } from "../../assets/icons/history.svg";
import { ReactComponent as IconPills } from "../../assets/icons/pills.svg";
import { MyHoursCalendar } from "../../components/DoctorSchedule";
import { MemoBoard } from "../../components/MemoBoard";
import { AnalogClock } from "../../components/AnalogClock";

// ─── Greeting helpers ─────────────────────────────────────────────────────────

function deriveName(): string {
  // TODO: replace with real auth-name once backend exposes it.
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

// One-time hover style injection for desk widgets
const DESK_STYLE_ID = "docodile-desk-hover";
function ensureDeskStyles() {
  if (typeof document === "undefined") return;
  if (document.getElementById(DESK_STYLE_ID)) return;
  const style = document.createElement("style");
  style.id = DESK_STYLE_ID;
  style.innerHTML = `
    .docodile-counter:hover,
    .docodile-file:hover {
      transform: translateY(-4px) !important;
      z-index: 5;
    }
  `;
  document.head.appendChild(style);
}

// ─── Component ────────────────────────────────────────────────────────────────

export function HomeView() {
  useEffect(() => { ensureDeskStyles(); }, []);
  const name = deriveName();

  return (
    <div style={styles.container}>
      <h1 style={styles.greeting}>
        Hello, {name} <span aria-hidden>👋</span>
      </h1>

      <div style={styles.mainGrid}>
        {/* LEFT column: wall (clock + memo) on top, desk under them */}
        <div style={styles.leftCol}>
          <div style={styles.wallTop}>
            <div style={styles.clockSlot}>
              <AnalogClock size={150} />
            </div>
            <div style={styles.memoSlot}>
              <MemoBoard />
            </div>
          </div>

          {/* Bottom tray = desk surface with counters */}
          <div style={styles.desk}>
            <p style={styles.deskLabel}>What's up for today?</p>

            <div style={styles.deskTop}>
              <div style={styles.deskWidgets}>
            <TotalAppointmentsCounter value="13" />
            <FileCard
              accent={colors.green200}
              tint={colors.greenAlpha10}
              tabLabel="New"
              icon={<IconStar style={styles.fileIcon} />}
              value="10"
              caption="New Patients"
              rotation={1.1}
            />
            <FileCard
              accent={colors.yellow200}
              tint={colors.yellowAlpha10}
              tabLabel="Reviews"
              icon={<IconHistory style={styles.fileIcon} />}
              value="2"
              caption="Reviews"
              rotation={-0.8}
            />
            <FileCard
              accent={colors.primary500}
              tint={colors.primary200}
              tabLabel="Procedures"
              icon={<IconPills style={styles.fileIcon} />}
              value="1"
              caption="Procedures"
              rotation={1.5}
            />
          </div>

            </div>
          </div>
        </div>

        {/* RIGHT column: the wall calendar — full height of the left column */}
        <div style={styles.rightCol}>
          <MyHoursCalendar />
        </div>
      </div>
    </div>
  );
}

function TotalAppointmentsCounter({ value }: { value: string }) {
  return (
    <div
      className="docodile-counter"
      style={styles.totalCounter}
    >
      <div style={styles.totalCounterFace}>
        <span style={styles.totalCounterValue}>{value}</span>
        <span style={styles.totalCounterLabel}>Total<br />Appointments</span>
      </div>
    </div>
  );
}

type FileCardProps = {
  accent: string;
  tint: string;
  tabLabel: string;
  icon: React.ReactNode;
  value: string;
  caption: string;
  rotation: number;
};

function FileCard({ accent, tint, tabLabel, icon, value, caption, rotation }: FileCardProps) {
  return (
    <div
      className="docodile-file"
      style={{
        ...styles.file,
        backgroundColor: tint,
        transform: `rotate(${rotation}deg)`,
      }}
    >
      <span style={{ ...styles.paperBack, backgroundColor: tint }} />
      <span style={{ ...styles.fileSpine, backgroundColor: accent }} />
      <span style={styles.filePageEdge} />
      <span style={{ ...styles.fileTab, backgroundColor: accent }}>{tabLabel}</span>
      <div style={styles.fileBody}>
        <span style={styles.fileIconWrap}>{icon}</span>
        <div style={styles.fileText}>
          <span style={styles.fileValue}>{value}</span>
          <span style={styles.fileCaption}>{caption}</span>
        </div>
      </div>
    </div>
  );
}

// ─── Styles ────────────────────────────────────────────────────────────────────

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: "flex",
    flexDirection: "column",
    gap: spacing.xl,
    width: "100%",
  },

  greeting: {
    fontFamily: fonts.family.secondary,
    fontSize: fonts.size.h4,
    fontWeight: 400,
    color: colors.neutral900,
    margin: 0,
    textAlign: "center",
  },

  // ─── Page split: left column (wall + desk), right column (wall calendar) ──
  mainGrid: {
    display: "grid",
    gridTemplateColumns: "minmax(640px, 1fr) 352px",
    gap: spacing["3xl"],
    alignItems: "start",
  },
  leftCol: {
    display: "flex",
    flexDirection: "column",
    gap: spacing.xl,
    minWidth: 0,
  },
  rightCol: {
    minWidth: 0,
    paddingTop: spacing.xs,
  },

  // Top of the left column: clock + memo board
  wallTop: {
    display: "grid",
    gridTemplateColumns: "150px minmax(360px, 1fr)",
    gap: spacing["2xl"],
    alignItems: "start",
  },
  clockSlot: {
    display: "flex",
    justifyContent: "center",
    alignItems: "flex-start",
    paddingTop: "20px",
  },
  memoSlot: {
    minWidth: 0,
    width: "100%",
  },

  // ─── Desk ────────────────────────────────────────────
  desk: {
    backgroundColor: colors.primary300,
    borderRadius: radii["2xl"],
    padding: `${spacing.l} ${spacing.xl} ${spacing.xl}`,
    position: "relative",
  },
  deskLabel: {
    fontFamily: fonts.family.secondary,
    fontSize: fonts.size.h6,
    fontStyle: "normal",
    fontWeight: 400,
    color: colors.neutral800,
    margin: `0 0 ${spacing.m}`,
    opacity: 0.85,
  },
  deskTop: {
    display: "flex",
    alignItems: "flex-start",
  },

  // ─── Desk widgets: total counter + metric files ──────────
  deskWidgets: {
    display: "flex",
    flexWrap: "nowrap",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.m,
    paddingTop: "14px",
    width: "100%",
  },
  totalCounter: {
    position: "relative",
    width: "214px",
    minHeight: "88px",
    borderRadius: radii.xl,
    backgroundColor: colors.primary300,
    padding: spacing.xs,
    boxShadow: `0 5px 0 ${colors.alphaBlack0}`,
    transition: "transform 0.18s ease",
    boxSizing: "border-box",
  },
  totalCounterFace: {
    minHeight: "72px",
    backgroundColor: colors.neutral100,
    clipPath: "polygon(6% 0, 94% 0, 100% 100%, 0 100%)",
    borderRadius: radii.l,
    padding: `0 ${spacing.xl}`,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.s,
    boxSizing: "border-box",
  },
  totalCounterValue: {
    fontFamily: fonts.family.secondary,
    fontSize: fonts.size.h4,
    lineHeight: 1,
    color: colors.neutral900,
  },
  totalCounterLabel: {
    fontFamily: fonts.family.primary,
    fontSize: fonts.size.xs,
    lineHeight: fonts.lineHeight.xs,
    color: colors.neutral900,
  },
  file: {
    width: "152px",
    minHeight: "142px",
    borderRadius: `${radii.xs}px ${radii.m}px ${radii.s}px ${radii.xs}px`,
    paddingTop: "26px",
    paddingBottom: spacing.m,
    paddingLeft: spacing.l,
    paddingRight: spacing.m,
    position: "relative",
    border: `1px solid ${colors.primary300}`,
    boxShadow: `-6px 6px 0 ${colors.alphaBlack0}`,
    overflow: "visible",
    transition: "transform 0.18s ease",
  },
  paperBack: {
    position: "absolute",
    inset: "6px -5px -6px 8px",
    borderRadius: `${radii.xs}px ${radii.m}px ${radii.s}px ${radii.xs}px`,
    border: `1px solid ${colors.primary300}`,
    zIndex: 0,
  },
  fileSpine: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
    width: "9px",
    borderRadius: `${radii.xs}px 0 0 ${radii.xs}px`,
    opacity: 0.55,
    zIndex: 1,
  },
  filePageEdge: {
    position: "absolute",
    top: "10px",
    right: "-4px",
    bottom: "8px",
    width: "7px",
    borderRadius: `0 ${radii.s}px ${radii.xs}px 0`,
    backgroundColor: colors.neutral100,
    border: `1px solid ${colors.primary300}`,
    zIndex: 0,
  },
  fileTab: {
    position: "absolute",
    top: "-8px",
    left: "20px",
    padding: "3px 10px 5px",
    borderRadius: `${radii.xs}px ${radii.xs}px 2px 2px`,
    fontFamily: fonts.family.primary,
    fontSize: fonts.size.caption,
    fontWeight: 600,
    color: colors.neutral100,
    letterSpacing: "0.4px",
    textTransform: "uppercase",
    zIndex: 3,
  },
  fileBody: {
    position: "relative",
    zIndex: 2,
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-start",
    gap: "4px",
    height: "100%",
  },
  fileIconWrap: {
    width: "36px",
    height: "36px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: "4px",
    opacity: 0.85,
  },
  fileIcon: {
    width: "36px",
    height: "36px",
    color: colors.neutral800,
  },
  fileText: {
    display: "flex",
    flexDirection: "column",
  },
  fileValue: {
    fontFamily: fonts.family.secondary,
    fontSize: fonts.size.h4,
    color: colors.neutral900,
    lineHeight: 1.05,
  },
  fileCaption: {
    fontFamily: fonts.family.primary,
    fontSize: fonts.size.xs,
    color: colors.neutral800,
    marginTop: "2px",
  },

};
