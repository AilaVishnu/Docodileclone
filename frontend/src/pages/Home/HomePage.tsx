import React, { useEffect, useState } from "react";
import { SideNav, NavTab } from "../../components/SideNav";
import { TopNav } from "../../components/TopNav";
import { PrescriptionView, PatientFilesView, AppointmentsView } from "./Views";
import { colors, ThemeMode } from "../../styles/theme";

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

  const handleNewAppointment = () => {
    setActiveTab("Appointments");
    setIsBooking(true);
  };

  useEffect(() => {
    document.title = `Docodile | ${activeTab}`;
  }, [activeTab]);

  const styles = {
    container: {
      display: "flex",
      width: "100%",
      minHeight: "100vh",
      backgroundColor: colors.active.shade300,
    },
    contentArea: {
      marginLeft: isSidebarExpanded ? "204px" : "95px",
      flex: 1,
      display: "flex",
      flexDirection: "column" as const,
      transition: "margin-left 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
    },
    mainContent: {
      padding: "24px 40px",
      display: "flex",
      flexDirection: "column" as const,
      gap: "24px",
      flex: 1,
      overflow: "auto" as const,
      backgroundColor: colors.active.shade200,
      borderTopLeftRadius: "32px",
      position: "relative",
    },
    title: {
      fontSize: "24px",
      fontWeight: 600,
      color: "#202020",
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
        return <AppointmentsView isBooking={isBooking} onBack={() => setIsBooking(false)} />;
      case "Prescription":
        return <PrescriptionView />;
      case "Patient Files":
        return <PatientFilesView />;
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
  );
}
