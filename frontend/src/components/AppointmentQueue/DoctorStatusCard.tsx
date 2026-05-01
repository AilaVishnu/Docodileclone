import React from "react";
import { colors, fonts } from "../../styles/theme";
import { StaffIllustration } from "../AddStaffModal/StaffIllustration";
import { ReactComponent as IconStopwatch } from "../../assets/icons/stopwatch.svg";
import { ReactComponent as IconUser } from "../../assets/icons/user.svg";
import { ReactComponent as IconHourglass } from "../../assets/icons/hourglass.svg";
import { ReactComponent as IconUserCheck } from "../../assets/icons/user-check.svg";
import { ReactComponent as IconUsersGroup } from "../../assets/icons/users-group.svg";

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
          crop="face"
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
    backgroundColor: colors.neutral100,
    zIndex: 2,
    marginBottom: "-30px",
  },

  card: {
    backgroundColor: colors.primary100,   // #F9F9ED — warm cream from Figma
    borderRadius: "20px",
    border: "none",
    padding: "40px 20px 20px",
    display: "flex",
    flexDirection: "column",
    gap: "2px",
    width: "246px",
  },

  doctorName: {
    fontFamily: fonts.family.primary,
    fontSize: fonts.size.m,
    fontWeight: 600,
    color: colors.neutral900,
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
    fontSize: fonts.size.s,
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
