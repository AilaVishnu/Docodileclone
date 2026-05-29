import React, { useState } from 'react';
import { colors, fonts } from '../../styles/theme';

type SideNavItemProps = {
  label: string;
  icon: React.ReactNode;
  active?: boolean;
  onClick: () => void;
};

// Single fixed form: icon centered with its label directly underneath.
export function SideNavItem({ label, icon, active, onClick }: SideNavItemProps) {
  const [hovered, setHovered] = useState(false);

  const getBackgroundColor = () => {
    if (active) return colors.active.shade200;
    if (hovered) return colors.neutralAlphaBlack;
    return 'transparent';
  };

  const styles = {
    container: {
      display: 'flex',
      flexDirection: 'column' as const,
      alignItems: 'center',
      justifyContent: 'center',
      gap: '4px',
      // More horizontal breathing room around the icon (8px); the outer
      // margin is trimmed to 4px to keep the short labels' width unchanged.
      padding: '8px 8px',
      cursor: 'pointer',
      backgroundColor: getBackgroundColor(),
      borderRadius: '8px',
      marginLeft: '4px',
      marginRight: '4px',
      width: 'calc(100% - 8px)',
      transition: 'background-color 0.2s ease',
      textAlign: 'center' as const,
    },
    label: {
      textAlign: 'center' as const,
      fontSize: fonts.size.caption,
      lineHeight: fonts.lineHeight.caption,
      fontWeight: 500,
      color: colors.neutral900,
      fontFamily: 'Inter, sans-serif',
      whiteSpace: 'nowrap' as const,
      overflow: 'hidden' as const,
      textOverflow: 'ellipsis' as const,
      width: '100%',
    },
  } as const;

  return (
    <div
      style={styles.container}
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div style={{
        display: 'flex',
        flexShrink: 0,
        transition: 'transform 0.3s ease',
        transform: hovered ? 'scale(1.1)' : 'scale(1)',
      }}>
        {icon}
      </div>
      <span style={styles.label}>{label}</span>
    </div>
  );
}
