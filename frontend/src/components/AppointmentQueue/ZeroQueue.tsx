import React from "react";
import { colors, fonts } from "../../styles/theme";
import { ReactComponent as ZeroQueueIllustration } from "../../assets/icons/zero-queue.svg";

export function ZeroQueue() {
  return (
    <div style={styles.container}>
      <div style={styles.content}>
        <ZeroQueueIllustration style={{ width: 260, height: 260 }} />
        <div style={styles.textGroup}>
          <h2 style={styles.title}>Zero Queue</h2>
          <p style={styles.subtitle}>
            No patients waiting. Maybe the universe is giving you a breather today.
          </p>
        </div>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: "72px 24px",
    backgroundColor: colors.primary100,
    borderRadius: "0 12px 12px 12px",
    minHeight: "530px",
  },
  content: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "24px",
  },
  textGroup: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "10px",
    maxWidth: "296px",
    textAlign: "center",
  },
  title: {
    margin: 0,
    fontFamily: fonts.family.secondary,
    fontSize: fonts.size.h4,
    fontWeight: 400,
    lineHeight: "44px",
    color: colors.neutral1000,
  },
  subtitle: {
    margin: 0,
    fontFamily: fonts.family.secondary,
    fontStyle: "italic",
    fontSize: fonts.size.m,
    fontWeight: 400,
    lineHeight: "22px",
    color: colors.neutral1000,
  },
};
