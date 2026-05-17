import React from 'react';
import {
  HomeIcon,
  AppointmentsIcon,
  PrescriptionIcon,
  PatientFilesIcon,
  ServicesIcon,
  BillingIcon,
  BusinessIcon,
  PharmacyIcon
} from '../../iconsUtil';
import { SideNavItem } from './SideNavItem';
import { ReactComponent as LogoSmall } from "../../assets/logo-small.svg";
import { ReactComponent as LogoFull } from "../../assets/logo-full.svg";
import { ReactComponent as ChevronLeftIcon } from "../../assets/chevron_left.svg";
import { ReactComponent as ChevronRightIcon } from "../../assets/chevron_right.svg";
import { fonts, colors, ThemeMode } from "../../styles/theme";
import { SETTINGS_SECTIONS, SettingsSection } from "../../pages/Settings";

export type NavTab =
  | 'Home'
  | 'Appointments'
  | 'Prescription'
  | 'Patient Files'
  | 'Services'
  | 'Billing'
  | 'Stats'
  | 'Pharmacy'
  | 'Settings'
  | 'Design System';

type SideNavProps = {
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  isExpanded: boolean;
  onToggleExpand: () => void;
  themeMode?: ThemeMode;
  // Sub-navigation: which Settings section is selected. Only meaningful when
  // activeTab === 'Settings'. The dropdown below "Settings" surfaces these.
  settingsSection?: SettingsSection;
  onSettingsSection?: (section: SettingsSection) => void;
};

export function SideNav({
  activeTab,
  onTabChange,
  isExpanded,
  onToggleExpand,
  settingsSection,
  onSettingsSection,
}: SideNavProps) {
  const styles = {
    container: {
      width: isExpanded ? 'var(--sidenav-w-expanded)' : 'var(--sidenav-w-collapsed)',
      height: '100vh',
      backgroundColor: colors.active.shade300,
      display: 'flex',
      flexDirection: 'column',
      position: 'fixed' as const,
      left: 0,
      top: 0,
      transition: 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      zIndex: 3000,
    },
    // Logo strip matches TopNav height (var --topnav-h) so the mark
    // sits on the same horizontal baseline as the search bar to the right.
    // Bottom spacer separates it from the nav items below.
    logoSection: {
      height: 'var(--topnav-h)',
      flexShrink: 0,
      padding: isExpanded ? '0 24px' : '0',
      marginBottom: '16px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: isExpanded ? 'flex-start' : 'center',
      gap: '8px',
      position: 'relative' as const,
    },
    logoText: {
      fontSize: fonts.size.h5,
      fontWeight: 500,
      color: '#202020',
      fontFamily: fonts.family.secondary,
      fontStyle: 'italic',
      letterSpacing: '-0.5px',
    },
    toggleButton: {
      position: 'absolute' as const,
      right: '-16px',
      top: '50%',
      transform: 'translateY(-50%)',
      width: '32px',
      height: '32px',
      borderRadius: '50%',
      backgroundColor: colors.active.shade300,
      border: '1px solid rgba(0,0,0,0.05)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      cursor: 'pointer',
      boxShadow: '0 2px 10px rgba(0,0,0,0.08)',
      zIndex: 101,
      transition: 'transform 0.3s ease',
    },
    navList: {
      display: 'flex',
      flexDirection: 'column',
      // Slightly looser stack when collapsed so icon-only items breathe.
      gap: isExpanded ? '4px' : '8px',
    }
  } as const;

  // Palette icon for the Design System menu entry. Remove this item (and the
  // 'Design System' branch in NavTab) to hide the page from end users.
  const DesignSystemIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22a10 10 0 1 1 10-10c0 2-1.5 3-3 3h-2a2 2 0 0 0-2 2 2 2 0 0 1-2 2h-1Z" />
      <circle cx="7.5" cy="10.5" r="1.2" />
      <circle cx="12" cy="7" r="1.2" />
      <circle cx="16.5" cy="10.5" r="1.2" />
    </svg>
  );

  // Rotating chevron for the Settings expander.
  const ExpanderChevron = ({ open }: { open: boolean }) => (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 160ms' }}
    >
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );

  // Gear icon for Settings.
  const SettingsIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  );

  const menuItems: { label: NavTab; icon: React.ReactNode }[] = [
    { label: 'Home', icon: <HomeIcon /> },
    { label: 'Appointments', icon: <AppointmentsIcon /> },
    { label: 'Prescription', icon: <PrescriptionIcon /> },
    { label: 'Patient Files', icon: <PatientFilesIcon /> },
    { label: 'Services', icon: <ServicesIcon /> },
    { label: 'Billing', icon: <BillingIcon /> },
    { label: 'Stats', icon: <BusinessIcon /> },
    { label: 'Pharmacy', icon: <PharmacyIcon /> },
    { label: 'Settings', icon: <SettingsIcon /> },
    { label: 'Design System', icon: <DesignSystemIcon /> },
  ];

  return (
    <div style={styles.container}>
      <div style={styles.logoSection}>
        {isExpanded ? (
          // Height locked to the search-bar height so the wordmark and the
          // header search share a baseline. Width auto preserves aspect.
          <LogoFull style={{ height: 'var(--search-h)', width: 'auto' }} />
        ) : (
          <LogoSmall style={{ height: 'var(--search-h)', width: 'var(--search-h)' }} />
        )}
      </div>

      <div style={styles.navList}>
        {menuItems.map((item) => {
          // Settings is expandable: when active and the sidebar is expanded,
          // render its sub-sections below. Collapsed sidebar shows the gear
          // icon only — clicking it routes to the current/default section.
          if (item.label === 'Settings') {
            const settingsActive = activeTab === 'Settings';
            return (
              <React.Fragment key={item.label}>
                <SideNavItem
                  label={item.label}
                  icon={item.icon}
                  active={settingsActive}
                  onClick={() => onTabChange('Settings')}
                  isExpanded={isExpanded}
                  trailing={isExpanded ? <ExpanderChevron open={settingsActive} /> : undefined}
                />
                {settingsActive && isExpanded && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 2, padding: '4px 0' }}>
                    {SETTINGS_SECTIONS.map((s) => {
                      const childActive = settingsSection === s.id;
                      return (
                        <button
                          key={s.id}
                          type="button"
                          disabled={!s.ready}
                          onClick={() => {
                            if (!s.ready) return;
                            onTabChange('Settings');
                            onSettingsSection?.(s.id);
                          }}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            gap: 6,
                            // Left-align the sub-item TEXT with the parent's
                            // "Settings" label. Parent text starts at:
                            //   marginLeft(12) + padding-x(16) + icon(24) + gap(12) = 64px.
                            // Sub button: marginLeft(52) + padding-x(12) = 64px to text.
                            marginLeft: 52,
                            marginRight: 12,
                            padding: '8px 12px',
                            borderRadius: 8,
                            border: 'none',
                            background: childActive ? colors.active.shade200 : 'transparent',
                            color: s.ready ? colors.neutral900 : colors.neutral500,
                            fontFamily: 'Inter, sans-serif',
                            fontSize: fonts.size.s,
                            fontWeight: 500,
                            textAlign: 'left',
                            cursor: s.ready ? 'pointer' : 'not-allowed',
                          }}
                        >
                          <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{s.label}</span>
                          {!s.ready && <span style={{
                            fontSize: 9,
                            fontWeight: 600,
                            backgroundColor: 'rgba(0,0,0,0.06)',
                            color: colors.neutral500,
                            padding: '1px 5px',
                            borderRadius: 999,
                            flexShrink: 0,
                          }}>Soon</span>}
                        </button>
                      );
                    })}
                  </div>
                )}
              </React.Fragment>
            );
          }

          return (
            <SideNavItem
              key={item.label}
              label={item.label}
              icon={item.icon}
              active={activeTab === item.label}
              onClick={() => onTabChange(item.label)}
              isExpanded={isExpanded}
            />
          );
        })}
      </div>

      <div style={{ position: 'relative', marginTop: 'auto', marginBottom: '60px' }}>
        <div 
          style={styles.toggleButton} 
          onClick={onToggleExpand}
          title={isExpanded ? "Collapse" : "Expand"}
        >
          {isExpanded ? (
            <ChevronLeftIcon style={{ width: 16, height: 16 }} />
          ) : (
            <ChevronRightIcon style={{ width: 16, height: 16 }} />
          )}
        </div>
      </div>
    </div>
  );
}
