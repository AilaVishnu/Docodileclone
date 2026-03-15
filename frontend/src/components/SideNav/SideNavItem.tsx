import React, { useState } from 'react';
import { colors } from '../../styles/theme';

type SideNavItemProps = {
  label: string;
  icon: React.ReactNode;
  active?: boolean;
  onClick: () => void;
  isExpanded: boolean;
};

export function SideNavItem({ label, icon, active, onClick, isExpanded }: SideNavItemProps) {
  const [hovered, setHovered] = useState(false);

  const getBackgroundColor = () => {
    if (active) return colors.primary100;
    if (hovered) return colors.neutralAlphaBlack;
    return 'transparent';
  };

  const styles = {
    container: {
      display: 'flex',
      flexDirection: isExpanded ? 'row' : 'column',
      alignItems: 'center',
      justifyContent: isExpanded ? 'flex-start' : 'center',
      gap: isExpanded ? '12px' : '4px',
      padding: isExpanded ? '12px 16px' : '8px 4px',
      cursor: 'pointer',
      backgroundColor: getBackgroundColor(),
      borderTopLeftRadius: isExpanded ? '12px' : '8px', // Slightly smaller for collapsed
      borderBottomLeftRadius: isExpanded ? '12px' : '8px',
      marginLeft: isExpanded ? '12px' : '8px',
      marginRight: isExpanded ? '0' : '0',
      width: isExpanded ? 'calc(100% - 12px)' : 'calc(100% - 8px)',
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      textAlign: isExpanded ? 'left' : 'center' as const,
    },
    label: {
      textAlign: isExpanded ? 'left' : 'center' as const,
      fontSize: isExpanded ? '14px' : '10px',
      fontWeight: active ? 600 : 400,
      color: colors.neutral900,
      fontFamily: 'Inter, sans-serif',
      transition: 'all 0.3s ease',
      whiteSpace: 'nowrap' as const,
      overflow: 'hidden' as const,
      textOverflow: 'ellipsis' as const,
      width: '100%',
    }
  } as const;

  return (
    <div 
      style={styles.container} 
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      title={!isExpanded ? label : undefined}
    >
      <div style={{ 
        display: 'flex', 
        flexShrink: 0,
        transition: 'transform 0.3s ease',
        transform: !isExpanded && hovered ? 'scale(1.1)' : 'scale(1)'
      }}>
        {icon}
      </div>
      <span style={styles.label}>{label}</span>
    </div>
  );
}
