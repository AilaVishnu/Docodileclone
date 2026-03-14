import React, { useState } from 'react';
import { colors } from '../../styles/theme';

type SideNavItemProps = {
  label: string;
  icon: React.ReactNode;
  active?: boolean;
  onClick: () => void;
};

export function SideNavItem({ label, icon, active, onClick }: SideNavItemProps) {
  const [hovered, setHovered] = useState(false);

  const getBackgroundColor = () => {
    if (active) return colors.primary100;
    if (hovered) return colors.neutralAlphaBlack;
    return 'transparent';
  };

  const styles = {
    container: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      padding: '12px 16px',
      cursor: 'pointer',
      backgroundColor: getBackgroundColor(),
      borderTopLeftRadius: '12px',
      borderBottomLeftRadius: '12px',
      marginLeft: '12px',
      width: 'calc(100% - 12px)',
      transition: 'background-color 0.2s ease',
    },
    label: {
      fontSize: '14px',
      fontWeight: 400,
      color: colors.neutral900,
      fontFamily: 'Inter, sans-serif',
    }
  } as const;

  return (
    <div 
      style={styles.container} 
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div style={{ display: 'flex', flexShrink: 0 }}>
        {icon}
      </div>
      <span style={styles.label}>{label}</span>
    </div>
  );
}
