import React, { useState } from "react";
import { colors, fonts, radii, spacing, strokes } from "../../styles/theme";
import { PrintTemplateEditor } from "./PrintTemplate/PrintTemplateEditor";

// ─────────────────────────────────────────────────────────────────────────────
// Settings module. Left sub-nav switches between sections; each section is
// a self-contained editor. Currently only "Print template" — other sections
// are visible as placeholders so the structure is clear when the team adds
// Profile / Clinic info / Users / etc.
// ─────────────────────────────────────────────────────────────────────────────

type SettingsSection =
  | "print-template"
  | "profile"
  | "clinic"
  | "users"
  | "billing";

const SECTIONS: { id: SettingsSection; label: string; ready: boolean; group: string }[] = [
  { id: "print-template", label: "Print template",  ready: true,  group: "Workflow" },
  { id: "profile",         label: "My profile",      ready: false, group: "Account" },
  { id: "clinic",          label: "Clinic info",     ready: false, group: "Account" },
  { id: "users",           label: "Users & roles",   ready: false, group: "Account" },
  { id: "billing",         label: "Billing & plan",  ready: false, group: "Account" },
];

export function SettingsPage() {
  const [active, setActive] = useState<SettingsSection>("print-template");

  // Group the items so the left rail has clear headings.
  const grouped = SECTIONS.reduce<Record<string, typeof SECTIONS>>((acc, s) => {
    (acc[s.group] = acc[s.group] || []).push(s);
    return acc;
  }, {});

  return (
    <div style={S.page}>
      <h1 style={S.title}>Settings</h1>
      <div style={S.shell}>
        <aside style={S.aside}>
          {Object.entries(grouped).map(([group, items]) => (
            <div key={group} style={S.group}>
              <div style={S.groupLabel}>{group}</div>
              {items.map((s) => {
                const isActive = s.id === active;
                return (
                  <button
                    key={s.id}
                    type="button"
                    style={{
                      ...S.navItem,
                      ...(isActive ? S.navItemActive : null),
                      ...(s.ready ? null : S.navItemDisabled),
                    }}
                    onClick={() => s.ready && setActive(s.id)}
                  >
                    <span>{s.label}</span>
                    {!s.ready && <span style={S.soon}>Soon</span>}
                  </button>
                );
              })}
            </div>
          ))}
        </aside>

        <section style={S.body}>
          {active === "print-template" && (
            <SectionHeader
              title="Print template"
              sub="Configure how prescriptions look when printed. Defaults to the template marked as default."
            />
          )}
          <div style={{ marginTop: spacing.m }}>
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
        </section>
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

  shell: {
    display: "grid",
    gridTemplateColumns: "minmax(220px, 240px) minmax(0, 1fr)",
    gap: spacing.l,
    alignItems: "start",
  },

  aside: {
    backgroundColor: colors.neutral100,
    borderRadius: radii.m,
    padding: spacing.s,
    display: "flex",
    flexDirection: "column",
    gap: spacing.m,
    position: "sticky",
    top: 0,
  },
  group: { display: "flex", flexDirection: "column", gap: 4 },
  groupLabel: {
    fontSize: fonts.size.xs,
    fontWeight: 600,
    color: colors.neutral500,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    padding: `${spacing.xs} ${spacing.s}`,
  },
  navItem: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    border: "none",
    background: "transparent",
    color: colors.neutral900,
    fontFamily: "inherit",
    fontSize: fonts.control.md,
    padding: `${spacing.s} ${spacing.m}`,
    borderRadius: radii.s,
    cursor: "pointer",
    textAlign: "left",
  },
  navItemActive: {
    backgroundColor: colors.active.shade300,
    color: colors.neutral900,
    fontWeight: 500,
  },
  navItemDisabled: { color: colors.neutral400, cursor: "not-allowed" },
  soon: {
    fontSize: 10,
    fontWeight: 600,
    backgroundColor: colors.neutral200,
    color: colors.neutral500,
    padding: "2px 6px",
    borderRadius: radii.full,
  },

  body: { minWidth: 0 },
  sectionHeader: {
    borderBottom: `${strokes.xs} solid ${colors.neutral200}`,
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
