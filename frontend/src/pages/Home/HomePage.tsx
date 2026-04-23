import React, { useEffect, useState } from "react";
import { SideNav, NavTab } from "../../components/SideNav";
import { TopNav } from "../../components/TopNav";
import { PrescriptionView, PatientFilesView, AppointmentsView } from "./Views";
import { DesignSystemPage } from "../DesignSystem";
import { colors, fonts, ThemeMode } from "../../styles/theme";
import { confirmStyles } from "../../components/AddStaffModal/AddStaffModal.styles";
import { Button } from "../../components/Button";

type HomePageProps = {
  onLogout: () => void;
  onViewClinic: () => void;
  onViewAllClinics: () => void;
};

export function HomePage({ onLogout, onViewClinic, onViewAllClinics }: HomePageProps) {
  const [activeTab, setActiveTabState] = useState<NavTab>(() => {
    return (localStorage.getItem("docodile_home_tab") as NavTab) || "Home";
  });

  const setActiveTab = (tab: NavTab) => {
    localStorage.setItem("docodile_home_tab", tab);
    setActiveTabState(tab);
  };
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);
  const [isBooking, setIsBooking] = useState(false);
  
  // Selected theme mode
  const [themeMode] = useState<ThemeMode>("primary");

  const clinicName = localStorage.getItem("docodile_clinic_name") || "your clinic";

  const [bookingKey, setBookingKey] = useState(0);
  const [isEditing, setIsEditing] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleNewAppointment = () => {
    if (isBooking || isEditing) {
      setShowConfirm(true);
      return;
    }
    setActiveTab("Appointments");
    setIsBooking(true);
    setBookingKey((k) => k + 1);
  };

  const handleConfirmNewAppointment = () => {
    setShowConfirm(false);
    setIsEditing(false);
    setActiveTab("Appointments");
    setIsBooking(true);
    setBookingKey((k) => k + 1);
  };

  useEffect(() => {
    document.title = `Docodile | ${activeTab}`;
  }, [activeTab]);

  const styles = {
    container: {
      display: "flex",
      width: "100%",
      height: "100vh",
      overflow: "hidden" as const,
      backgroundColor: colors.active.shade300,
    },
    contentArea: {
      marginLeft: isSidebarExpanded ? "204px" : "95px",
      width: isSidebarExpanded ? "calc(100% - 204px)" : "calc(100% - 95px)",
      display: "flex",
      flexDirection: "column" as const,
      transition: "margin-left 0.3s cubic-bezier(0.4, 0, 0.2, 1), width 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
    },
    mainContent: {
      padding: "24px 40px",
      display: "flex",
      flexDirection: "column" as const,
      gap: "24px",
      flex: 1,
      overflowY: "auto" as const,
      overflowX: "hidden" as const,
      backgroundColor: colors.active.shade200,
      borderTopLeftRadius: "16px",
      position: "relative",
    },
    title: {
      fontFamily: fonts.family.secondary,
      fontSize: fonts.size.h5,
      fontWeight: 400,
      lineHeight: "34px",
      color: colors.neutral900,
      margin: 0,
    }
  } as const;


  const renderContent = () => {
    switch (activeTab) {
      case "Home":
        return (
          <div>
            <h1 style={styles.title}>Welcome back to {clinicName}</h1>
            <p style={{ marginTop: '12px', color: '#666' }}>Select a tab from the sidebar to manage your clinic operations.</p>
          </div>
        );
      case "Appointments":
        return <AppointmentsView isBooking={isBooking} bookingKey={bookingKey} onBack={() => { setIsBooking(false); setIsEditing(false); }} onEditStart={() => setIsEditing(true)} />;
      case "Prescription":
        return <PrescriptionView />;
      case "Patient Files":
        return <PatientFilesView />;
      case "Design System":
        return <DesignSystemPage />;
      default:
        return (
          <div>
            <h1 style={styles.title}>{activeTab}</h1>
            <p style={{ marginTop: '12px', color: '#666' }}>This section is currently under development.</p>
          </div>
        );
    }
  };

  return (
    <>
    <div style={styles.container} data-theme={themeMode}>
      <SideNav 
        activeTab={activeTab} 
        onTabChange={setActiveTab} 
        isExpanded={isSidebarExpanded}
        onToggleExpand={() => setIsSidebarExpanded(!isSidebarExpanded)}
      />
      <div style={styles.contentArea}>
        <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
          <TopNav 
            onBuildClinic={onViewClinic} 
            onViewAllClinics={onViewAllClinics}
            onLogout={onLogout} 
            onNewAppointment={handleNewAppointment}
            isBooking={isBooking}
          />
          <main style={styles.mainContent}>
            {renderContent()}
          </main>
        </div>
      </div>
    </div>

    {showConfirm && (
      <div style={{ ...confirmStyles.overlay, zIndex: 9999 }}>
        <div style={confirmStyles.dialog}>
          <h4 style={confirmStyles.title}>Are you sure?</h4>
          <p style={{ margin: 0, fontSize: fonts.size.s, color: colors.neutral600, textAlign: "center" }}>Current booking data will be discarded.</p>
          <div style={confirmStyles.actions}>
            <Button variant="dangerLight" size="sm" onClick={() => setShowConfirm(false)}>
              Nope
            </Button>
            <Button variant="dark" size="sm" onClick={handleConfirmNewAppointment}>
              Yes
            </Button>
          </div>
        </div>
      </div>
    )}
    </>
  );
}
