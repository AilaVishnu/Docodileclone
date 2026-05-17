import React, { useState } from 'react';
import { colors, fonts } from '../../styles/theme';

type SideNavItemProps = {
  label: string;
  icon: React.ReactNode;
  active?: boolean;
  onClick: () => void;
  isExpanded: boolean;
  // Optional trailing slot — used to render the expander chevron on the
  // Settings item when the sidebar is expanded.
  trailing?: React.ReactNode;
};

export function SideNavItem({ label, icon, active, onClick, isExpanded, trailing }: SideNavItemProps) {
  const [hovered, setHovered] = useState(false);

  const getBackgroundColor = () => {
    if (active) return colors.active.shade200;
    if (hovered) return colors.neutralAlphaBlack;
    return 'transparent';
  };

  const styles = {
    container: {
      position: 'relative' as const, // anchor for the collapsed-mode tooltip
      display: 'flex',
      flexDirection: isExpanded ? 'row' : 'column',
      alignItems: 'center',
      justifyContent: isExpanded ? 'flex-start' : 'center',
      gap: isExpanded ? '12px' : '4px',
      padding: isExpanded ? 'var(--sidenav-item-pady) 16px' : '8px 4px',
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
    // Floating bubble shown to the right of the item in collapsed mode.
    // Replaces the browser's slow native title attribute.
    tooltip: {
      position: 'absolute' as const,
      left: '100%',
      top: '50%',
      transform: 'translateY(-50%)',
      marginLeft: 12,
      padding: '6px 10px',
      backgroundColor: colors.neutral900,
      color: colors.neutral100,
      fontFamily: fonts.family.primary,
      fontSize: fonts.control.xs,
      fontWeight: fonts.weight.medium,
      borderRadius: 6,
      whiteSpace: 'nowrap' as const,
      pointerEvents: 'none' as const,
      boxShadow: '0 4px 10px rgba(0,0,0,0.12)',
      zIndex: 3100,
    },
    label: {
      textAlign: isExpanded ? 'left' : 'center' as const,
      fontSize: isExpanded ? fonts.size.s : fonts.size.caption,
      fontWeight: 500,
      color: colors.neutral900,
      fontFamily: 'Inter, sans-serif',
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
    >
      <div style={{
        display: 'flex',
        flexShrink: 0,
        transition: 'transform 0.3s ease',
        transform: !isExpanded && hovered ? 'scale(1.1)' : 'scale(1)'
      }}>
        {icon}
      </div>
      {isExpanded && <span style={styles.label}>{label}</span>}
      {trailing && isExpanded && (
        <span style={{ display: 'flex', alignItems: 'center', flexShrink: 0, color: colors.neutral700 }}>
          {trailing}
        </span>
      )}
      {!isExpanded && hovered && <span style={styles.tooltip}>{label}</span>}
    </div>
  );
}
