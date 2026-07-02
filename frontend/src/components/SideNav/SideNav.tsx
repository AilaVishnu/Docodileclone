import React from 'react';
import { Icon } from "../Icon";
import { SideNavItem } from './SideNavItem';
import { SettingsNavItem } from './SettingsNavItem';
import { ReactComponent as LogoSmall } from "../../assets/logo-small.svg";
import { colors } from "../../styles/theme";
import { SettingsSection } from "../../pages/Settings/sections";
import { LottieIcon } from "../Icon/LottieIcon";
import homeLottie from "../../assets/lottie/home.json";
import calendarLottie from "../../assets/lottie/calendar.json";
import filesLottie from "../../assets/lottie/files.json";
import pieChartLottie from "../../assets/lottie/pie-chart.json";
import settingsLottie from "../../assets/lottie/settings.json";
import patientLottie from "../../assets/lottie/patient.json";
import catalogLottie from "../../assets/lottie/catalog.json";
import medsLottie from "../../assets/lottie/meds.json";

export type NavTab =
  | 'Home'
  | 'Appointments'
  | 'Prescription'
  | 'Patient Files'
  | 'Services'
  | 'Billing'
  | 'Stats'
  | 'Pharmacy'
  | 'Docs'
  | 'Settings';

type SideNavProps = {
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  // Config sub-section: which Settings section is shown (for the hover flyout's
  // highlight), and the callback to jump to one. Only meaningful for 'Settings'.
  settingsSection?: SettingsSection;
  onSettingsSection?: (section: SettingsSection) => void;
};

export function SideNav({ activeTab, onTabChange, settingsSection, onSettingsSection }: SideNavProps) {
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

  // `label` is the routing key (the NavTab); `display` is the short name shown
  // in the compact sidebar. Keep them separate so the wording can change
  // without touching navigation / persisted tab state.
  const menuItems: { label: NavTab; display: string; icon: React.ReactNode }[] = [
    // Animated Lottie glyphs play a one-shot when their module becomes active
    // (see LottieIcon). Home / Appointments / Patient Files / Stats / Settings are
    // wired; the rest stay static <Icon>s until they get their own animated glyphs.
    { label: 'Home', display: 'Home', icon: <LottieIcon animationData={homeLottie} active={activeTab === 'Home'} size={36} /> },
    { label: 'Appointments', display: 'Appts', icon: <LottieIcon animationData={calendarLottie} active={activeTab === 'Appointments'} size={36} /> },
    { label: 'Prescription', display: 'Rx Pad', icon: <LottieIcon animationData={filesLottie} active={activeTab === 'Prescription'} size={36} /> },
    { label: 'Patient Files', display: 'Patients', icon: <LottieIcon animationData={patientLottie} active={activeTab === 'Patient Files'} size={36} /> },
    { label: 'Services', display: 'Catalog', icon: <LottieIcon animationData={catalogLottie} active={activeTab === 'Services'} size={36} /> },
    { label: 'Billing', display: 'Bills', icon: <Icon name="billing" tone="inherit" size={36} /> },
    { label: 'Stats', display: 'Stats', icon: <LottieIcon animationData={pieChartLottie} active={activeTab === 'Stats'} size={36} /> },
    { label: 'Pharmacy', display: 'Meds', icon: <LottieIcon animationData={medsLottie} active={activeTab === 'Pharmacy'} size={36} /> },
    { label: 'Docs', display: 'Docs', icon: <Icon name="document-school" tone="inherit" size={36} /> },
    { label: 'Settings', display: 'Config', icon: <LottieIcon animationData={settingsLottie} active={activeTab === 'Settings'} size={36} /> },
  ];

  return (
    <div style={styles.container}>
      <div style={styles.logoSection}>
        <LogoSmall style={{ height: 'var(--search-h)', width: 'var(--search-h)' }} />
      </div>

      <div style={styles.navList}>
        {menuItems.map((item) =>
          item.label === 'Settings' ? (
            <SettingsNavItem
              key={item.label}
              label={item.display}
              icon={item.icon}
              active={activeTab === 'Settings'}
              onOpen={() => onTabChange('Settings')}
              activeSection={settingsSection}
              onSelectSection={(s) => { onSettingsSection?.(s); onTabChange('Settings'); }}
            />
          ) : (
            <SideNavItem
              key={item.label}
              label={item.display}
              icon={item.icon}
              active={activeTab === item.label}
              onClick={() => onTabChange(item.label)}
            />
          )
        )}
      </div>
    </div>
  );
}
