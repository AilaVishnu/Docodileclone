import React, { useState, useRef, useEffect } from 'react';
import { colors, fonts, radii, spacing } from '../../styles/theme';
import { Button } from '../Button';
import { MessageIcon, BellIcon } from '../../iconsUtil';
import { StaffIllustration } from '../AddStaffModal/StaffIllustration';
import { ReactComponent as SearchIcon } from '../../assets/search.svg';
import { ReactComponent as PlusIcon } from '../../assets/Plus.svg';
import type { NavTab } from '../SideNav';
import { SessionTrayButton } from './SessionTrayButton';

type TopNavProps = {
  onBuildClinic?: () => void;
  onViewAllClinics?: () => void;
  onLogout?: () => void;
  onNewAppointment?: () => void;
  isBooking?: boolean;
  // Overrides the default "New Appointment" CTA label. The Prescription page
  // passes "New Prescription" since that's the user's intent there even
  // though the action still opens the booking flow.
  primaryActionLabel?: string;
  // Switches the active home tab. Passed from HomePage so the SessionTray
  // can route the doctor back to the Prescription form on click.
  onNavigate?: (tab: NavTab) => void;
};

export function TopNav({ onBuildClinic, onViewAllClinics, onLogout, onNewAppointment, isBooking, primaryActionLabel, onNavigate }: TopNavProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const styles = {
    container: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: `0 ${spacing.xl} 0 0`,
      height: '70px',
      backgroundColor: colors.active.shade300,
      width: '100%',
      zIndex: 3000,
      position: 'relative' as const,
      flexShrink: 0,
    },

    actions: {
      display: 'flex',
      alignItems: 'center',
      gap: spacing.s, // was spacing.l (20) — tighter grouping per design
    },
    iconGroup: {
      display: 'flex',
      alignItems: 'center',
      gap: spacing['2xs'], // was spacing.s (12) — icons sit close together
    },
    iconButton: {
      position: 'relative' as const,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: '48px',
      height: '48px',
      borderRadius: '50%',
      backgroundColor: 'transparent',
      cursor: 'pointer',
      transition: 'background-color 0.15s ease, transform 0.15s ease',
    },
    iconButtonHover: {
      backgroundColor: colors.neutralAlphaBlack, // subtle dim bg on hover
    },
    searchBarContainer: {
      display: 'flex',
      alignItems: 'center',
      backgroundColor: colors.active.shade100,
      borderRadius: '55px',
      padding: '0 16px',
      width: '364px',
      height: '40px',
      boxSizing: 'border-box',
      gap: '12px',
    },
    searchInput: {
      flex: 1,
      backgroundColor: 'transparent',
      border: 'none',
      outline: 'none',
      fontFamily: fonts.family.primary,
      fontSize: fonts.size.m,
      color: colors.neutral900,
      padding: 0,
    },
    profileWrapper: {
      position: 'relative' as const,
    },
    profileAvatar: {
      width: '48px',
      height: '48px',
      borderRadius: '50%',
      overflow: 'hidden',
      display: 'flex',
      cursor: 'pointer',
      transition: 'transform 0.15s ease, box-shadow 0.15s ease',
      boxSizing: 'border-box' as const,
    },
    profileAvatarHover: {
      transform: 'scale(1.05)',
      // Very subtle ring — just enough to feel interactive, not an outline
      boxShadow: '0 0 0 2px rgba(0, 0, 0, 0.08)',
    },
    dropdown: {
      position: 'absolute' as const,
      top: '56px',
      right: 0,
      backgroundColor: colors.neutral100,
      borderRadius: radii.m,
      boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
      border: `1px solid ${colors.neutral200}`,
      padding: spacing.xs,
      minWidth: '200px',
      display: 'flex',
      flexDirection: 'column' as const,
      gap: '4px',
      zIndex: 3100,
    },
    dropdownItem: {
      fontFamily: fonts.family.primary,
      fontSize: fonts.size.s,
      color: colors.neutral900,
      padding: '10px 16px',
      borderRadius: radii.m,
      cursor: 'pointer',
      backgroundColor: 'transparent',
      border: 'none',
      textAlign: 'left' as const,
      transition: 'background-color 0.2s',
      display: 'block',
      width: '100%',
    },
    dropdownItemHover: {
      backgroundColor: colors.active.shade100,
    },
    dropdownItemDestructive: {
      color: colors.red200,
    }
  } as const;

  const handleDropdownItemClick = (action: () => void) => {
    setIsDropdownOpen(false);
    action();
  };

  const HoverIconButton = ({ children, onClick }: { children: React.ReactNode; onClick?: () => void }) => {
    const [hovered, setHovered] = useState(false);
    return (
      <div
        style={{ ...styles.iconButton, ...(hovered ? styles.iconButtonHover : {}) }}
        onClick={onClick}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        {children}
      </div>
    );
  };

  const HoverAvatar = ({ onClick }: { onClick: () => void }) => {
    const [hovered, setHovered] = useState(false);
    const rawRole = localStorage.getItem("docodile_role") ?? "ADMIN";
    const rawGender = localStorage.getItem("docodile_gender") ?? "male";
    const isAdmin = rawRole === "ADMIN";
    const displayRole = isAdmin
      ? "Doctor"
      : rawRole.split("_").map((w: string) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(" ");
    return (
      <div
        style={{ ...styles.profileAvatar, ...(hovered ? styles.profileAvatarHover : {}) }}
        onClick={onClick}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        <StaffIllustration
          role={displayRole}
          gender={(isAdmin ? "male" : rawGender) as "male" | "female" | "other"}
          width="100%"
          height="100%"
          borderRadius="0"
          crop="face"
        />
      </div>
    );
  };

  const DropdownItem = ({ label, onClick, destructive = false }: { label: string, onClick: () => void, destructive?: boolean }) => {
    const [isHovered, setIsHovered] = useState(false);
    return (
      <button
        style={{
          ...styles.dropdownItem,
          ...(isHovered ? styles.dropdownItemHover : {}),
          ...(destructive ? styles.dropdownItemDestructive : {})
        }}
        onClick={() => handleDropdownItemClick(onClick)}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {label}
      </button>
    );
  };

  return (
    <div style={styles.container}>
      {/* Search Bar */}
      <div style={styles.searchBarContainer}>
        <SearchIcon style={{ width: 20, height: 20, color: '#ABABAB' }} />
        <input
          type="text"
          placeholder="Search for anything..."
          className="topnav-search-input"
          style={styles.searchInput}
        />
        <style>{`
          .topnav-search-input::placeholder {
            color: #ABABAB;
            opacity: 1;
          }
        `}</style>
      </div>

      <div style={styles.actions}>
        {!isBooking && (
          <Button
            variant="primary"
            size="sm"
            iconLeft={<PlusIcon style={{ width: 16, height: 16, fill: '#fff' }} />}
            style={{ height: '40px', fontSize: fonts.size.s, padding: '0 16px' }}
            onClick={onNewAppointment}
          >
            {primaryActionLabel ?? "New Appointment"}
          </Button>
        )}

        <div style={styles.iconGroup}>
          {onNavigate && <SessionTrayButton onNavigate={onNavigate} />}
          <HoverIconButton>
            <MessageIcon />
          </HoverIconButton>
          <HoverIconButton>
            <BellIcon />
          </HoverIconButton>
        </div>

        <div style={styles.profileWrapper} ref={dropdownRef}>
          <HoverAvatar onClick={() => setIsDropdownOpen(!isDropdownOpen)} />

          {isDropdownOpen && (
            <div style={styles.dropdown}>
              <DropdownItem
                label="My Profile"
                onClick={() => { }}
              />
              <DropdownItem
                label="Settings"
                onClick={() => { }}
              />
              <DropdownItem
                label="Build Your Clinic"
                onClick={() => onBuildClinic && onBuildClinic()}
              />
              <DropdownItem
                label="View All Clinics"
                onClick={() => onViewAllClinics && onViewAllClinics()}
              />
              <DropdownItem
                label="Logout"
                onClick={() => onLogout && onLogout()}
                destructive
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
