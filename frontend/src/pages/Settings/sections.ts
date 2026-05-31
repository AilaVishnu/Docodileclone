// ─────────────────────────────────────────────────────────────────────────────
// Settings sub-section registry. Single source of truth used by:
//   • The SideNav (renders these as nested children under "Settings")
//   • SettingsPage (routes the active section to the right editor)
// Adding a new settings sub-section means appending to SECTIONS and adding
// a render branch in SettingsPage — nothing else.
// ─────────────────────────────────────────────────────────────────────────────

export type SettingsSection =
  | "print-template"
  | "archived-patients"
  | "import-data"
  | "profile"
  | "clinic"
  | "users"
  | "billing";

export type SettingsSectionMeta = {
  id: SettingsSection;
  label: string;
  ready: boolean;
  group: "Workflow" | "Account";
};

export const SETTINGS_SECTIONS: SettingsSectionMeta[] = [
  { id: "print-template",     label: "Print template",     ready: true,  group: "Workflow" },
  { id: "archived-patients",  label: "Archived patients",  ready: true,  group: "Workflow" },
  { id: "import-data",        label: "Import data",        ready: true,  group: "Workflow" },
  { id: "profile",            label: "Profile",            ready: false, group: "Account" },
  { id: "clinic",             label: "Clinic",             ready: false, group: "Account" },
  { id: "users",              label: "Users",              ready: false, group: "Account" },
  { id: "billing",            label: "Billing",            ready: false, group: "Account" },
];

export const DEFAULT_SETTINGS_SECTION: SettingsSection = "print-template";
