import React from 'react';
import { colors, fonts, radii, spacing } from '../../styles/theme';
import { Button } from '../Button';
import { MessageIcon, BellIcon } from '../SideNav/Icons';
import { StaffIllustration } from '../AddStaffModal/StaffIllustration';
import { ReactComponent as SearchIcon } from '../../assets/search.svg'; 
import { ReactComponent as PlusIcon } from '../../assets/Plus.svg'; 

export function TopNav() {
  const styles = {
    container: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: `0 ${spacing.xl}`,
      height: '80px',
      backgroundColor: colors.primary300,
      width: '100%',
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
      width: '40px',
      height: '40px',
      borderRadius: '50%',
      backgroundColor: 'transparent', // removed background according to image
      cursor: 'pointer',
      transition: 'all 0.2s ease',
    },
    searchBarContainer: {
      display: 'flex',
      alignItems: 'center',
      backgroundColor: colors.primary100,
      borderRadius: '55px',
      padding: '0 16px',
      width: '416px',
      height: '40px',
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
    profileAvatar: {
      width: '40px',
      height: '40px',
      borderRadius: '50%',
      overflow: 'hidden',
      backgroundColor: '#C4581C', // Deep orange solid background based on image
      display: 'flex',
      alignItems: 'flex-end',
      justifyContent: 'center',
      cursor: 'pointer',
    },
  } as const;

  return (
    <div style={styles.container}>
      {/* Search Bar */}
      <div style={styles.searchBarContainer}>
        <SearchIcon style={{ width: 20, height: 20 }} />
        <input 
          type="text" 
          placeholder="Search for anything..." 
          style={styles.searchInput}
        />
      </div>

      <div style={styles.actions}>
        <Button 
          variant="primary" 
          size="sm" 
          iconLeft={<PlusIcon style={{width: 14, height: 14, fill: '#fff'}}/>}
          style={{ height: '32px', fontSize: '14px', padding: '0 12px' }}
        >
          New Appointment
        </Button>

        <div style={styles.iconGroup}>
          <div style={styles.iconButton}>
            <MessageIcon />
          </div>
          <div style={styles.iconButton}>
            <BellIcon />
          </div>
        </div>

        <div style={styles.profileAvatar}>
          <StaffIllustration 
            role="Doctor" 
            gender="male" 
            width="36px" 
            height="36px" 
            borderRadius="0"
          />
        </div>
      </div>
    </div>
  );
}
