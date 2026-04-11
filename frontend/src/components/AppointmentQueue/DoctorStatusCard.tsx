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

export function DoctorStatusCard({ doctorName, doctorGender, appointments }: DoctorStatusCardProps) {
  const inProgress = appointments.find(a => a.status === "IN_PROGRESS" || a.status === "In Progress");
  const waiting = appointments.filter(a => a.status === "WAITING" || a.status === "Scheduled").length;
  const completed = appointments.filter(a => a.status === "COMPLETED" || a.status === "Completed").length;
  const total = appointments.length;

  // Estimate wait time (~15 min per waiting patient)
  const waitTime = waiting > 0 ? `~ ${waiting * 15}min` : "0min";

  return (
    <div style={styles.container}>
      <div style={styles.avatarWrapper}>
        <StaffIllustration
          role="Doctor"
          gender={(doctorGender || "male") as "male" | "female" | "other"}
          width="56px"
          height="56px"
          borderRadius="50%"
        />
      </div>

      <div style={styles.card}>
        <div style={styles.row}>
          <span style={styles.emoji}>🟡</span>
          <span style={styles.text}>
            At the doc : {inProgress ? inProgress.patientName : "—"}
          </span>
        </div>

        <div style={styles.row}>
          <span style={styles.emoji}>👤</span>
          <span style={styles.text}>Waiting : {waiting}</span>
        </div>

        <div style={styles.row}>
          <span style={styles.emoji}>⏳</span>
          <span style={styles.text}>Wait time : {waitTime}</span>
        </div>

        <div style={styles.row}>
          <span style={styles.emoji}>✅</span>
          <span style={styles.text}>Completed : {completed}</span>
        </div>

        <div style={styles.row}>
          <span style={styles.emoji}>👥</span>
          <span style={styles.text}>Total : {total}</span>
        </div>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    position: "relative",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  avatarWrapper: {
    width: "60px",
    height: "60px",
    borderRadius: "50%",
    border: `3px solid ${colors.blindBlack}`,
    overflow: "hidden",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
    zIndex: 2,
    marginBottom: "-30px",
  },
  card: {
    backgroundColor: colors.active.shade100,
    borderRadius: "16px",
    padding: "40px 20px 20px",
    display: "flex",
    flexDirection: "column",
    gap: "12px",
    minWidth: "240px",
    boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
  },
  row: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },
  emoji: {
    fontSize: "16px",
    width: "20px",
    textAlign: "center",
  },
  text: {
    fontFamily: fonts.family.primary,
    fontSize: fonts.size.s,
    color: colors.blindBlack,
    fontWeight: 500,
  },
};
