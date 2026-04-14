import React, { useState, useRef, useEffect } from 'react';
import { colors, fonts, radii, spacing } from '../../styles/theme';
import { Button } from '../Button';
import { MessageIcon, BellIcon } from '../../iconsUtil';
import { StaffIllustration } from '../AddStaffModal/StaffIllustration';
import { ReactComponent as SearchIcon } from '../../assets/search.svg';
import { ReactComponent as PlusIcon } from '../../assets/Plus.svg';

type TopNavProps = {
  onBuildClinic?: () => void;
  onViewAllClinics?: () => void;
  onLogout?: () => void;
  onNewAppointment?: () => void;
  isBooking?: boolean;
};

export function TopNav({ onBuildClinic, onViewAllClinics, onLogout, onNewAppointment, isBooking }: TopNavProps) {
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
      gap: spacing.l,
    },
    iconGroup: {
      display: 'flex',
      alignItems: 'center',
      gap: spacing.s,
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
      transition: 'all 0.2s ease',
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
      backgroundColor: '#C4581C',
      display: 'flex',
      alignItems: 'flex-end',
      justifyContent: 'center',
      cursor: 'pointer',
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
            style={{ height: '40px', fontSize: '14px', padding: '0 16px' }}
            onClick={onNewAppointment}
          >
            New Appointment
          </Button>
        )}

        <div style={styles.iconGroup}>
          <div style={styles.iconButton}>
            <MessageIcon />
          </div>
          <div style={styles.iconButton}>
            <BellIcon />
          </div>
        </div>

        <div style={styles.profileWrapper} ref={dropdownRef}>
          <div style={styles.profileAvatar} onClick={() => setIsDropdownOpen(!isDropdownOpen)}>
            <StaffIllustration
              role="Doctor"
              gender="male"
              width="44px"
              height="44px"
              borderRadius="0"
            />
          </div>

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
