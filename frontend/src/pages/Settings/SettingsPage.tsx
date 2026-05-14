import React from "react";
import { colors, fonts, radii, spacing, strokes } from "../../styles/theme";
import { PrintTemplateEditor } from "./PrintTemplate/PrintTemplateEditor";
import { DEFAULT_SETTINGS_SECTION, SETTINGS_SECTIONS, SettingsSection } from "./sections";

// ─────────────────────────────────────────────────────────────────────────────
// Settings page. The section list now lives in the SideNav as a nested
// expander under the "Settings" entry, so this page is just a router: pick
// the section, render its editor. The header above the editor labels what
// the user is on and gives a one-line description.
// ─────────────────────────────────────────────────────────────────────────────

type SettingsPageProps = {
  section?: SettingsSection;
};

const META = Object.fromEntries(
  SETTINGS_SECTIONS.map((s) => [s.id, s] as const),
) as Record<SettingsSection, (typeof SETTINGS_SECTIONS)[number]>;

const SUBS: Partial<Record<SettingsSection, string>> = {
  "print-template": "Configure how prescriptions look when printed. Defaults to the template marked as default.",
};

export function SettingsPage({ section }: SettingsPageProps) {
  const active: SettingsSection = section && META[section] && META[section].ready ? section : DEFAULT_SETTINGS_SECTION;

  return (
    <div style={S.page}>
      <h1 style={S.title}>Settings</h1>

      <SectionHeader title={META[active].label} sub={SUBS[active]} />

      <div style={{ marginTop: spacing.s }}>
        {active === "print-template" && <PrintTemplateEditor />}
        {active !== "print-template" && (
          <div style={S.placeholder}>
            <h3 style={{ margin: 0, color: colors.neutral900 }}>Coming soon</h3>
            <p style={{ margin: 0, color: colors.neutral500, fontSize: fonts.size.s }}>
              This section is currently under development.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function SectionHeader({ title, sub }: { title: string; sub?: string }) {
  return (
    <header style={S.sectionHeader}>
      <h2 style={S.sectionTitle}>{title}</h2>
      {sub && <p style={S.sectionSub}>{sub}</p>}
    </header>
  );
}

const S: Record<string, React.CSSProperties> = {
  page: { display: "flex", flexDirection: "column", gap: spacing.l, minWidth: 0 },
  title: {
    margin: 0,
    textAlign: "center",
    fontFamily: fonts.family.secondary,
    fontSize: fonts.size.h5,
    lineHeight: fonts.lineHeight.h5,
    fontWeight: fonts.weight.regular,
    color: colors.neutral900,
  },

  sectionHeader: {
    borderBottomWidth: strokes.xs,
    borderBottomStyle: "solid",
    borderBottomColor: colors.neutral200,
    paddingBottom: spacing.s,
  },
  sectionTitle: {
    margin: 0,
    fontSize: fonts.size.l,
    color: colors.neutral900,
    fontFamily: fonts.family.secondary,
    fontWeight: fonts.weight.regular,
  },
  sectionSub: {
    margin: "4px 0 0",
    fontSize: fonts.size.s,
    color: colors.neutral500,
  },

  placeholder: {
    backgroundColor: colors.neutral100,
    borderRadius: radii.m,
    padding: spacing["2xl"],
    display: "flex",
    flexDirection: "column",
    gap: spacing.xs,
    alignItems: "center",
    textAlign: "center",
  },
};
