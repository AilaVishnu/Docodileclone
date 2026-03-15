import React, { useEffect, useState } from "react";
import { SideNav, NavTab } from "../../components/SideNav";
import { TopNav } from "../../components/TopNav";
import { AppointmentsView, PrescriptionView, PatientFilesView } from "./Views";
import { colors } from "../../styles/theme";

type HomePageProps = {
  onLogout: () => void;
  onViewClinic: () => void;
};

export function HomePage({ onLogout, onViewClinic }: HomePageProps) {
  const [activeTab, setActiveTabState] = useState<NavTab>(() => {
    return (localStorage.getItem("docodile_home_tab") as NavTab) || "Home";
  });

  const setActiveTab = (tab: NavTab) => {
    localStorage.setItem("docodile_home_tab", tab);
    setActiveTabState(tab);
  };
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);
  const clinicName = localStorage.getItem("docodile_clinic_name") || "your clinic";

  useEffect(() => {
    document.title = `Docodile | ${activeTab}`;
  }, [activeTab]);

  const styles = {
    container: {
      display: "flex",
      width: "100%",
      minHeight: "100vh",
      backgroundColor: colors.primary300,
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
      backgroundColor: colors.primary200,
      borderTopLeftRadius: "32px",
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
        return <AppointmentsView />;
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
    <div style={styles.container}>
      <SideNav 
        activeTab={activeTab} 
        onTabChange={setActiveTab} 
        isExpanded={isSidebarExpanded}
        onToggleExpand={() => setIsSidebarExpanded(!isSidebarExpanded)}
      />
      <div style={styles.contentArea}>
        <TopNav 
          onViewClinic={onViewClinic} 
          onLogout={onLogout} 
        />
        <main style={styles.mainContent}>
          {renderContent()}
        </main>
      </div>
    </div>
  );
}
