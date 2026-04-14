import React from "react";
import { colors, fonts } from "../../styles/theme";
import { StaffIllustration } from "../AddStaffModal/StaffIllustration";

type DoctorStatusCardProps = {
  doctorName: string;
  doctorGender?: string;
  appointments: {
    status: string;
    patientName?: string;
    scheduledTime?: string;
  }[];
};

// ─────────────────────────────────────────────────────────────────────────────
// Icons — Solid/Filled style matching Figma screenshots exactly
// Color tokens from Figma variables:
//   amber:  #DFB400  (Colors/Yellow/200)
//   green:  #1FC16B  (Colors/Green/200)
//   green-light: #84EBB4  (Colors/Green/100)
//   peach:  #EDCA99  (Colors/Primary/400)
// ─────────────────────────────────────────────────────────────────────────────

/** Stopwatch — filled amber circle face with stem knob on top */
function IconStopwatch() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Crown / knob */}
      <rect x="8.25" y="1" width="3.5" height="1.8" rx="0.9" fill="#DFB400" />
      {/* Stem */}
      <rect x="9.4" y="2.5" width="1.2" height="1.6" fill="#DFB400" />
      {/* Side button */}
      <rect x="13.5" y="3.2" width="2.2" height="1.2" rx="0.6" fill="#DFB400" transform="rotate(40 13.5 3.2)" />
      {/* Main circle face */}
      <circle cx="10" cy="12" r="7.2" fill="#DFB400" />
      {/* Inner lighter circle for clock face */}
      <circle cx="10" cy="12" r="5.5" fill="#F5C800" opacity="0.35" />
      {/* Clock hand */}
      <path d="M10 9.5V12.5L12 14" stroke="#fff" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
      {/* Center dot */}
      <circle cx="10" cy="12" r="0.8" fill="#fff" />
    </svg>
  );
}

/** User — solid filled amber person silhouette */
function IconUser() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Head */}
      <circle cx="10" cy="6" r="3.5" fill="#DFB400" />
      {/* Body — rounded shoulders */}
      <path
        d="M3.5 18c0-3.59 2.91-6.5 6.5-6.5s6.5 2.91 6.5 6.5H3.5Z"
        fill="#DFB400"
      />
    </svg>
  );
}

/** Hourglass — solid fully-filled golden hourglass */
function IconHourglass() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Top cap bar */}
      <rect x="3.5" y="2" width="13" height="2" rx="1" fill="#DFB400" />
      {/* Bottom cap bar */}
      <rect x="3.5" y="16" width="13" height="2" rx="1" fill="#DFB400" />
      {/* Upper triangle (sand falling down) */}
      <path d="M5 4h10L10 11 5 4Z" fill="#DFB400" />
      {/* Lower triangle  */}
      <path d="M5 16h10L10 11 5 16Z" fill="#DFB400" opacity="0.55" />
    </svg>
  );
}

/** User Check — teal/green filled person + badge circle with checkmark */
function IconUserCheck() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Head */}
      <circle cx="8.5" cy="5.5" r="3.2" fill="#1FC16B" />
      {/* Body */}
      <path
        d="M2 17.5c0-3.31 2.91-6 6.5-6 1.2 0 2.32.33 3.28.9"
        stroke="#1FC16B"
        strokeWidth="0.1"
        fill="#1FC16B"
      />
      <path
        d="M2 17.5c0-3.31 2.91-6 6.5-6 1.1 0 2.15.28 3.05.77L11 17.5H2Z"
        fill="#1FC16B"
      />
      {/* Badge circle */}
      <circle cx="15.5" cy="14.5" r="3.8" fill="#84EBB4" />
      {/* Checkmark in badge */}
      <path
        d="M13.5 14.5l1.5 1.5 2.5-2.5"
        stroke="#fff"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** Users Group Two Rounded — two stacked peach silhouettes */
function IconUsersGroup() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Back person (smaller, offset right) */}
      <circle cx="14" cy="6" r="2.8" fill="#EDCA99" opacity="0.7" />
      <path
        d="M10.5 17.5c0-2.8 1.57-4.8 3.5-5.2 1.93.4 3.5 2.4 3.5 5.2H10.5Z"
        fill="#EDCA99"
        opacity="0.7"
      />
      {/* Front person (larger) */}
      <circle cx="8" cy="6.5" r="3.2" fill="#EDCA99" />
      <path
        d="M2 17.5c0-3.04 2.69-5.5 6-5.5s6 2.46 6 5.5H2Z"
        fill="#EDCA99"
      />
    </svg>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Stat Row
// ─────────────────────────────────────────────────────────────────────────────
type StatRowProps = {
  icon: React.ReactNode;
  text: React.ReactNode;
};

function StatRow({ icon, text }: StatRowProps) {
  return (
    <div style={statStyles.row}>
      <span style={statStyles.iconWrap}>{icon}</span>
      <span style={statStyles.text}>{text}</span>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main card
// ─────────────────────────────────────────────────────────────────────────────
export function DoctorStatusCard({
  doctorName,
  doctorGender,
  appointments,
}: DoctorStatusCardProps) {
  const inProgress = appointments.find(
    (a) => a.status === "IN_PROGRESS" || a.status === "In Progress"
  );
  const waiting = appointments.filter(
    (a) => a.status === "WAITING" || a.status === "Scheduled"
  ).length;
  const completed = appointments.filter(
    (a) => a.status === "COMPLETED" || a.status === "Completed"
  ).length;
  const total = appointments.length;

  const waitTime = waiting > 0 ? `~ ${waiting * 15}min` : "0min";

  return (
    <div style={cardStyles.container}>
      {/* Avatar overlapping card top */}
      <div style={cardStyles.avatarWrapper}>
        <StaffIllustration
          role="Doctor"
          gender={(doctorGender || "male") as "male" | "female" | "other"}
          width="56px"
          height="56px"
          borderRadius="50%"
        />
      </div>

      <div style={cardStyles.card}>
        {/* Doctor name */}
        <p style={cardStyles.doctorName}>{doctorName || "Doctor"}</p>

        <div style={cardStyles.divider} />

        <StatRow
          icon={<IconStopwatch />}
          text={
            <span>
              <span style={statStyles.label}>At the doc : </span>
              <span style={statStyles.value}>
                {inProgress ? inProgress.patientName : "—"}
              </span>
            </span>
          }
        />

        <StatRow
          icon={<IconUser />}
          text={
            <span>
              <span style={statStyles.label}>Waiting : </span>
              <span style={statStyles.value}>{waiting}</span>
            </span>
          }
        />

        <StatRow
          icon={<IconHourglass />}
          text={
            <span>
              <span style={statStyles.label}>Wait time : </span>
              <span style={statStyles.value}>{waitTime}</span>
            </span>
          }
        />

        <StatRow
          icon={<IconUserCheck />}
          text={
            <span>
              <span style={statStyles.label}>Completed : </span>
              <span style={statStyles.value}>{completed}</span>
            </span>
          }
        />

        <div style={cardStyles.divider} />

        <StatRow
          icon={<IconUsersGroup />}
          text={
            <span>
              <span style={statStyles.label}>Total : </span>
              <span style={statStyles.value}>{total}</span>
            </span>
          }
        />
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Styles
// ─────────────────────────────────────────────────────────────────────────────
const cardStyles: Record<string, React.CSSProperties> = {
  container: {
    position: "relative",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    flexShrink: 0,
  },

  avatarWrapper: {
    width: "60px",
    height: "60px",
    borderRadius: "50%",
    border: `2.5px solid ${colors.primary400}`,
    overflow: "hidden",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
    zIndex: 2,
    marginBottom: "-30px",
  },

  card: {
    backgroundColor: colors.primary100,   // #F9F9ED — warm cream from Figma
    borderRadius: "20px",
    border: `1px solid ${colors.primary300}`,
    padding: "40px 20px 20px",
    display: "flex",
    flexDirection: "column",
    gap: "2px",
    width: "246px",
  },

  doctorName: {
    fontFamily: fonts.family.primary,
    fontSize: "15px",
    fontWeight: 600,
    color: colors.blindBlack,
    textAlign: "center",
    margin: "0 0 8px",
  },

  divider: {
    height: "1px",
    backgroundColor: colors.primary300,
    margin: "8px 0",
  },
};

const statStyles: Record<string, React.CSSProperties> = {
  row: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    padding: "5px 0",
  },

  iconWrap: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    width: "20px",
    height: "20px",
  },

  text: {
    fontFamily: fonts.family.primary,
    fontSize: "14px",
    color: colors.neutral900,
    lineHeight: "20px",
  },

  label: {
    fontWeight: 400,
    color: colors.neutral900,
  },

  value: {
    fontWeight: 500,
    color: colors.neutral900,
  },
};
