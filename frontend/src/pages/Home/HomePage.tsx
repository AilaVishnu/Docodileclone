import React, { useEffect, useState } from "react";
import { SideNav, NavTab } from "../../components/SideNav";
import { AppointmentsView, PrescriptionView, PatientFilesView } from "./Views";

export function HomePage() {
  const [activeTab, setActiveTab] = useState<NavTab>("Home");
  const clinicName = localStorage.getItem("docodile_clinic_name") || "your clinic";

  useEffect(() => {
    document.title = `Docodile | ${activeTab}`;
  }, [activeTab]);

  const styles = {
    container: {
      display: "flex",
      width: "100%",
      minHeight: "100vh",
      backgroundColor: "#F9F9ED",
    },
    contentArea: {
      marginLeft: "204px", // Width of SideNav
      flex: 1,
      padding: "40px",
      display: "flex",
      flexDirection: "column" as const,
      gap: "24px",
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
            <h1 style={styles.title}>Welcome to {clinicName}</h1>
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
      <SideNav activeTab={activeTab} onTabChange={setActiveTab} />
      <main style={styles.contentArea}>
        {renderContent()}
      </main>
    </div>
  );
}
