import { CSSProperties } from "react";
import { colors, fonts, fluidSpacing } from "../../styles/theme";
import { PageHeader } from "../PageHeader/PageHeader";

// Placeholder for not-yet-built modules (e.g. Bills). Gives the page the same
// sticky <PageHeader> + scroll-container shell as the real modules, with a
// simple "coming soon" body, so unfinished tabs still feel part of the app.
const styles: Record<string, CSSProperties> = {
  page: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    display: "flex",
    flexDirection: "column",
    padding: `0 ${fluidSpacing.outerX} ${fluidSpacing.outerY}`,
    overflowY: "auto",
    overflowX: "hidden",
  },
  body: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    minHeight: 240,
  },
  title: {
    fontFamily: fonts.family.primary,
    fontSize: fonts.size.l,
    fontWeight: fonts.weight.medium,
    color: colors.neutral700,
  },
  sub: {
    fontFamily: fonts.family.primary,
    fontSize: fonts.size.s,
    color: colors.neutral500,
  },
};

export function ComingSoon({ title }: { title: string }) {
  return (
    <div style={styles.page}>
      <PageHeader title={title} />
      <div style={styles.body}>
        <div style={styles.title}>Coming soon</div>
        <div style={styles.sub}>This section is under development.</div>
      </div>
    </div>
  );
}
