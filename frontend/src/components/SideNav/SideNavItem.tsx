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
      padding: '8px 4px',
      cursor: 'pointer',
      backgroundColor: getBackgroundColor(),
      borderRadius: '8px',
      // The highlight box keeps its size; the 10px side margin gives it
      // clear breathing room from the sidebar edges (left + right).
      marginLeft: '10px',
      marginRight: '10px',
      width: 'calc(100% - 20px)',
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
