import React, { useState } from 'react';
import "./styles/globals.css";
import { AdminLoginPage, StaffLoginPage } from './pages/LoginPage';
import { HomePage } from './pages/Home';
import { BuildYourClinicPage } from './pages/BuildYourClinicPage';
import { ClinicSelectionPage } from './pages/ClinicSelectionPage';

function App() {
  const [view, setViewState] = useState<"login" | "home" | "build" | "select">(() => {
    const savedView = localStorage.getItem("docodile_view") as "login" | "home" | "build" | "select";
    const token = localStorage.getItem("docodile_token");
    
    if (!token) return "login";
    return savedView || "login";
  });

  const setView = (newView: "login" | "home" | "build" | "select") => {
    localStorage.setItem("docodile_view", newView);
    setViewState(newView);
  };

  const handleLoginSuccess = () => {
    setView("select");
  };

  const handleLogout = () => {
    localStorage.removeItem("docodile_token");
    localStorage.removeItem("docodile_role");
    localStorage.removeItem("docodile_view");
    localStorage.removeItem("docodile_home_tab");
    setView("login");
  };

  const handleNavigateToBuild = () => {
    setView("build");
  };

  return (
    <div className="App">
      {view === "login" && (
        <div className="centered-layout">
          <header className="App-header">
            <AdminLoginPage onLoginSuccess={handleLoginSuccess} />
          </header>
        </div>
      )}
      {view === "select" && (
        <ClinicSelectionPage
          onSelectClinic={(clinicId, clinicName) => {
            localStorage.setItem("docodile_clinic_id", clinicId);
            localStorage.setItem("docodile_clinic_name", clinicName);
            setView("home");
          }}
          onGoToBuild={() => setView("build")}
          onLogout={handleLogout}
        />
      )}
      {view === "build" && (
        <BuildYourClinicPage onNext={() => setView("select")} />
      )}
      {view === "home" && (
        <HomePage 
          onLogout={handleLogout} 
          onViewClinic={handleNavigateToBuild}
        />
      )}
    </div>
  );
}

export default App;
