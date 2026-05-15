import React from "react";
import { colors, fonts, radii, spacing } from "../../styles/theme";
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
  const sub = SUBS[active];

  return (
    <div style={S.page}>
      {/* Single page header — the title is the active section's label, so
          there's no duplicate "Settings" / "Print template" stack. The
          section descriptor sits centered under it. */}
      <header style={{ textAlign: "center" }}>
        <h1 style={S.title}>{META[active].label}</h1>
        {sub && <p style={S.titleSub}>{sub}</p>}
      </header>

      <div>
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
  titleSub: {
    margin: "6px 0 0",
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
