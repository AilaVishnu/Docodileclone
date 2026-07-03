import React, { useState } from "react";
import { colors, fonts, radii, spacing, shadows } from "../../styles/theme";
import { Icon } from "../Icon";
import { SideNavItem } from "./SideNavItem";
import { SETTINGS_SECTIONS, SettingsSection } from "../../pages/Settings/sections";

// The Config entry behaves like every other compact nav item (click → open the
// Settings page) but, on hover, reveals a flyout to its RIGHT listing the
// settings sub-sections — the same pattern Slack uses for "More". Clicking a
// row jumps straight into that section. Coming-soon sections show greyed with a
// "Soon" tag. The panel is a DOM child of the hover wrapper, so moving from the
// icon into the panel keeps it open (no dead gap between them).

type Detail = { icon: string; desc: string };

const DETAIL: Record<SettingsSection, Detail> = {
  "print-template": { icon: "printer", desc: "How prescriptions look when printed" },
  "bill-template": { icon: "bill-check", desc: "How printed bills & receipts look" },
  "archived-patients": { icon: "archive-box", desc: "Restore patients you've archived" },
  "import-data": { icon: "download-tray", desc: "Migrate records from another platform" },
  "profile": { icon: "user", desc: "Your account details" },
  "clinic": { icon: "buildings", desc: "Clinic profile & branding" },
  "users": { icon: "users-group", desc: "Team members & roles" },
  "billing": { icon: "billing", desc: "Subscription & invoices" },
};

type SettingsNavItemProps = {
  label: string;
  icon: React.ReactNode;
  active: boolean;
  /** Open the Settings page (default section). */
  onOpen: () => void;
  /** The section currently shown — highlighted in the flyout. */
  activeSection?: SettingsSection;
  /** Jump to a specific section (also navigates to the Settings page). */
  onSelectSection: (section: SettingsSection) => void;
};

export function SettingsNavItem({
  label,
  icon,
  active,
  onOpen,
  activeSection,
  onSelectSection,
}: SettingsNavItemProps) {
  const [open, setOpen] = useState(false);
  const [hoveredId, setHoveredId] = useState<SettingsSection | null>(null);

  const select = (section: SettingsSection) => {
    onSelectSection(section);
    setOpen(false);
  };

  return (
    <div
      style={{ position: "relative" }}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => { setOpen(false); setHoveredId(null); }}
    >
      <SideNavItem label={label} icon={icon} active={active} onClick={onOpen} />

      {open && (
        <div style={styles.panel} role="menu" aria-label="Config sections">
          <div style={styles.header}>Config</div>
          {SETTINGS_SECTIONS.map((s) => {
            const d = DETAIL[s.id];
            const isActive = active && activeSection === s.id;
            const isHover = hoveredId === s.id;
            const bg = isActive || (s.ready && isHover) ? colors.primary100 : "transparent";
            return (
              <button
                key={s.id}
                type="button"
                role="menuitem"
                disabled={!s.ready}
                onClick={() => s.ready && select(s.id)}
                onMouseEnter={() => setHoveredId(s.id)}
                onMouseLeave={() => setHoveredId(null)}
                style={{
                  ...styles.row,
                  backgroundColor: bg,
                  cursor: s.ready ? "pointer" : "default",
                  opacity: s.ready ? 1 : 0.55,
                }}
              >
                <Icon name={d.icon} size={20} tone="inherit" />
                <span style={styles.rowText}>
                  <span style={styles.rowLabel}>{s.label}</span>
                  <span style={styles.rowDesc}>{d.desc}</span>
                </span>
                {!s.ready && <span style={styles.soon}>Soon</span>}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  // Flush to the sidebar's right edge (no gap → hover stays alive), anchored to
  // the item's bottom so it rises upward — Config is the last, lowest item.
  panel: {
    position: "absolute",
    // Flush to the rail (no gap) so moving the pointer from the icon into the
    // panel never crosses dead space that would trip mouseleave and close it.
    left: "100%",
    bottom: 0,
    width: 260,
    backgroundColor: colors.neutral100,
    border: `1px solid ${colors.primary300}`,
    borderRadius: radii.m,
    boxShadow: shadows.menu,
    padding: spacing.xs,
    display: "flex",
    flexDirection: "column",
    gap: 2,
    zIndex: 3100,
  },
  header: {
    padding: `${spacing.xs} ${spacing.s} ${spacing.s}`,
    fontFamily: "Inter, sans-serif",
    fontSize: fonts.size.xs,
    fontWeight: 600,
    letterSpacing: "0.04em",
    textTransform: "uppercase",
    color: colors.neutral500,
  },
  row: {
    display: "flex",
    alignItems: "center",
    gap: spacing.s,
    width: "100%",
    padding: `${spacing.s} ${spacing.s}`,
    border: "none",
    borderRadius: radii.s,
    background: "transparent",
    textAlign: "left",
    color: colors.neutral900,
    transition: "background-color 0.15s ease",
  },
  rowText: { display: "flex", flexDirection: "column", gap: 1, minWidth: 0, flex: 1 },
  rowLabel: {
    fontFamily: "Inter, sans-serif",
    fontSize: fonts.size.s,
    fontWeight: 500,
    color: colors.neutral900,
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  rowDesc: {
    fontFamily: "Inter, sans-serif",
    fontSize: fonts.size.caption,
    lineHeight: fonts.lineHeight.caption,
    color: colors.neutral500,
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  soon: {
    flexShrink: 0,
    fontFamily: "Inter, sans-serif",
    fontSize: fonts.size.caption,
    fontWeight: 600,
    color: colors.neutral500,
    backgroundColor: colors.neutral200,
    borderRadius: radii.s,
    padding: "2px 6px",
  },
};
