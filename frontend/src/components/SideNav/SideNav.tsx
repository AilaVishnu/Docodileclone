import React from 'react';
import { Icon } from "../Icon";
import { SideNavItem } from './SideNavItem';
import { ReactComponent as LogoSmall } from "../../assets/logo-small.svg";
import { colors } from "../../styles/theme";

export type NavTab =
  | 'Home'
  | 'Appointments'
  | 'Prescription'
  | 'Patient Files'
  | 'Services'
  | 'Billing'
  | 'Stats'
  | 'Pharmacy'
  | 'Settings';

type SideNavProps = {
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
};

export function SideNav({ activeTab, onTabChange }: SideNavProps) {
  const styles = {
    container: {
      width: 'var(--sidenav-w)',
      height: '100vh',
      backgroundColor: colors.active.shade300,
      display: 'flex',
      flexDirection: 'column',
      position: 'fixed' as const,
      left: 0,
      top: 0,
      zIndex: 3000,
    },
    // Logo strip matches TopNav height so the mark shares the search bar's
    // baseline. Centered — the compact sidebar has no room for padding.
    logoSection: {
      height: 'var(--topnav-h)',
      flexShrink: 0,
      marginBottom: '16px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    },
    navList: {
      display: 'flex',
      flexDirection: 'column',
      gap: '8px',
    }
  } as const;

  // Gear icon for Settings.
  const SettingsIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  );

  // `label` is the routing key (the NavTab); `display` is the short name shown
  // in the compact sidebar. Keep them separate so the wording can change
  // without touching navigation / persisted tab state.
  const menuItems: { label: NavTab; display: string; icon: React.ReactNode }[] = [
    { label: 'Home', display: 'Home', icon: <Icon name="home" tone="inherit" /> },
    { label: 'Appointments', display: 'Appts', icon: <Icon name="appointments" tone="inherit" /> },
    { label: 'Prescription', display: 'Rx Pad', icon: <Icon name="prescription" tone="inherit" /> },
    { label: 'Patient Files', display: 'Patients', icon: <Icon name="patient-files" tone="inherit" /> },
    { label: 'Services', display: 'Catalog', icon: <Icon name="services" tone="inherit" /> },
    { label: 'Billing', display: 'Bills', icon: <Icon name="billing" tone="inherit" /> },
    { label: 'Stats', display: 'Stats', icon: <Icon name="business" tone="inherit" /> },
    { label: 'Pharmacy', display: 'Meds', icon: <Icon name="pharmacy-nav" tone="inherit" /> },
    { label: 'Settings', display: 'Config', icon: <SettingsIcon /> },
  ];

  return (
    <div style={styles.container}>
      <div style={styles.logoSection}>
        <LogoSmall style={{ height: 'var(--search-h)', width: 'var(--search-h)' }} />
      </div>

      <div style={styles.navList}>
        {menuItems.map((item) => (
          <SideNavItem
            key={item.label}
            label={item.display}
            icon={item.icon}
            active={activeTab === item.label}
            onClick={() => onTabChange(item.label)}
          />
        ))}
      </div>
    </div>
  );
}
