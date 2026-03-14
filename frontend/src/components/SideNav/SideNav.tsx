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
} from './Icons';
import { SideNavItem } from './SideNavItem';
import { ReactComponent as LogoIcon } from "../../assets/logo.svg";
import { fonts } from "../../styles/theme";

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
};

export function SideNav({ activeTab, onTabChange }: SideNavProps) {
  const styles = {
    container: {
      width: '204px',
      height: '100vh',
      backgroundColor: '#F3F3DC',
      display: 'flex',
      flexDirection: 'column',
      paddingTop: '40px',
      position: 'fixed' as const,
      left: 0,
      top: 0,
      boxShadow: 'inset -2px 0 10px rgba(0,0,0,0.02)',
    },
    logoSection: {
      padding: '0 24px 48px 24px',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
    },
    logoText: {
      fontSize: '24px',
      fontWeight: 500,
      color: '#202020',
      fontFamily: fonts.family.secondary,
      fontStyle: 'italic',
      letterSpacing: '-0.5px',
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
        <LogoIcon style={{ width: 29, height: 24 }} />
        <span style={styles.logoText}>Docodile</span>
      </div>

      <div style={styles.navList}>
        {menuItems.map((item) => (
          <SideNavItem
            key={item.label}
            label={item.label}
            icon={item.icon}
            active={activeTab === item.label}
            onClick={() => onTabChange(item.label)}
          />
        ))}
      </div>
    </div>
  );
}
