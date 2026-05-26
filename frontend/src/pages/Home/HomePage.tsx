import React, { useEffect, useState } from "react";
import { SideNav, NavTab } from "../../components/SideNav";
import { TopNav } from "../../components/TopNav";
import { PrescriptionView, PatientFilesView, AppointmentsView } from "./Views";
import { ServicesView } from "../Services";
import { HomeView } from "./HomeView";
import { StatsPage } from "../Stats";
import { PharmacyView } from "../Pharmacy";
import { SettingsPage, DEFAULT_SETTINGS_SECTION, SettingsSection } from "../Settings";
import { DesignSystemPage } from "../DesignSystem";
import { colors, fonts, ThemeMode } from "../../styles/theme";
import { confirmStyles } from "../../components/AddStaffModal/AddStaffModal.styles";
import { Button } from "../../components/Button";
import { ChatBubble } from "../../components/Chat/ChatBubble";
import { setPendingSessionNav } from "../../components/TopNav/SessionTrayButton";
import { hydrateScheduleFromBackend } from "../../components/DoctorSchedule/scheduleStorage";

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

  // Pull the canonical clinic schedule from the backend on mount and seed the
  // local cache. Without this, the schedule-aware widgets (AnalogClock,
  // HeatmapCard, DoctorScheduleStrip) would read stale localStorage from a
  // previous clinic / device.
  useEffect(() => {
    void hydrateScheduleFromBackend();
  }, []);
  
  // Selected theme mode
  const [themeMode] = useState<ThemeMode>("primary");

  const [bookingKey, setBookingKey] = useState(0);
  const [isEditing, setIsEditing] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [patientFileNavId, setPatientFileNavId] = useState<string | null>(null);
  // Which Settings sub-section is open. Persisted so a reload returns to the
  // user's last view inside Settings. Owned at this level because the SideNav
  // (left of the main content) needs it to highlight the active child.
  const [settingsSection, setSettingsSectionState] = useState<SettingsSection>(() => {
    return (localStorage.getItem("docodile_settings_section") as SettingsSection) || DEFAULT_SETTINGS_SECTION;
  });
  const setSettingsSection = (section: SettingsSection) => {
    localStorage.setItem("docodile_settings_section", section);
    setSettingsSectionState(section);
  };

  const handleNewAppointment = () => {
    // Only gate on isBooking — the "Current booking data will be discarded"
    // message only makes sense when a new-booking form is open. isEditing
    // tracks the Edit Appointment modal which has its own discard flow.
    if (isBooking) {
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
    // Leaving the Appointments tab implicitly closes any open booking /
    // edit flow. Without this reset, navigating to another section while
    // the booking form is open leaves isBooking=true stuck on — the next
    // "+ New Appointment" click then triggers a phantom discard prompt
    // even though no form is visible.
    if (activeTab !== "Appointments") {
      setIsBooking(false);
      setIsEditing(false);
    }
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
      flex: 1,
      display: "flex",
      flexDirection: "column" as const,
      transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
      minWidth: 0,
    },
    mainContent: {
      padding: "40px 40px 24px",
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
      margin: 0,
      textAlign: "center" as const,
      fontFamily: fonts.family.secondary,
      fontSize: fonts.size.h5,
      lineHeight: fonts.lineHeight.h5,
      fontWeight: fonts.weight.regular,
      color: colors.neutral900,
    }
  } as const;


  const renderContent = () => {
    switch (activeTab) {
      case "Home":
        return <HomeView />;
      case "Appointments":
        return <AppointmentsView isBooking={isBooking} bookingKey={bookingKey} onBack={() => { setIsBooking(false); setIsEditing(false); }} onEditStart={() => setIsEditing(true)} onViewPatientFile={(patient, appointmentId) => {
          // Open the patient's prescription/visit directly — same path
          // PrescriptionQueue's View Pad uses, so the doctor lands inside
          // the file instead of on the Patient Files index summary.
          setPendingSessionNav({ patient, appointmentId });
          setActiveTab("Prescription");
        }} />;
      case "Prescription":
        return <PrescriptionView onNavigate={setActiveTab} />;
      case "Patient Files":
        return <PatientFilesView onNavigate={setActiveTab} initialSelectedId={patientFileNavId} />;
      case "Services":
        return <ServicesView />;
      case "Stats":
        return <StatsPage />;
      case "Pharmacy":
        return <PharmacyView />;
      case "Settings":
        return <SettingsPage section={settingsSection} />;
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
        settingsSection={settingsSection}
        onSettingsSection={setSettingsSection}
      />
      <div style={styles.contentArea}>
        <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
          <TopNav
            onBuildClinic={onViewClinic}
            onViewAllClinics={onViewAllClinics}
            onLogout={onLogout}
            onNewAppointment={handleNewAppointment}
            isBooking={isBooking}
            onNavigate={setActiveTab}
          />
          <main style={styles.mainContent}>
            {renderContent()}
          </main>
        </div>
      </div>
    </div>

    <ChatBubble
      clinicId={localStorage.getItem("docodile_clinic_id") ?? ""}
      currentUserId={localStorage.getItem("docodile_user_id") ?? ""}
      currentUserName={localStorage.getItem("docodile_user_email") ?? ""}
    />

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
