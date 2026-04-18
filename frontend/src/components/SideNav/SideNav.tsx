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

export type NavTab = 
  | 'Home' 
  | 'Appointments' 
  | 'Prescription' 
  | 'Patient Files' 
  | 'Services' 
  | 'Billing' 
  | 'Business' 
  | 'Pharmacy';

type SideNavProps = {
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  isExpanded: boolean;
  onToggleExpand: () => void;
  themeMode?: ThemeMode;
};

export function SideNav({ activeTab, onTabChange, isExpanded, onToggleExpand }: SideNavProps) {
  const styles = {
    container: {
      width: isExpanded ? '204px' : '95px',
      height: '100vh',
      backgroundColor: colors.active.shade300,
      display: 'flex',
      flexDirection: 'column',
      paddingTop: '19px',
      position: 'fixed' as const,
      left: 0,
      top: 0,
      transition: 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      zIndex: 3000,
    },
    logoSection: {
      padding: isExpanded ? '0 24px 32px 24px' : '0 0 32px 0',
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
      gap: '4px',
    }
  } as const;

  const menuItems: { label: NavTab; icon: React.ReactNode }[] = [
    { label: 'Home', icon: <HomeIcon /> },
    { label: 'Appointments', icon: <AppointmentsIcon /> },
    { label: 'Prescription', icon: <PrescriptionIcon /> },
    { label: 'Patient Files', icon: <PatientFilesIcon /> },
    { label: 'Services', icon: <ServicesIcon /> },
    { label: 'Billing', icon: <BillingIcon /> },
    { label: 'Business', icon: <BusinessIcon /> },
    { label: 'Pharmacy', icon: <PharmacyIcon /> },
  ];

  return (
    <div style={styles.container}>
      <div style={styles.logoSection}>
        {isExpanded ? (
          <LogoFull style={{ width: 140, height: 42 }} />
        ) : (
          <LogoSmall style={{ width: 32, height: 32 }} />
        )}
      </div>

      <div style={styles.navList}>
        {menuItems.map((item) => (
          <SideNavItem
            key={item.label}
            label={item.label}
            icon={item.icon}
            active={activeTab === item.label}
            onClick={() => onTabChange(item.label)}
            isExpanded={isExpanded}
          />
        ))}
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
