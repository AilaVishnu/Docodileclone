import React, { useState } from 'react';
import "./styles/globals.css";
import { AdminLoginPage, StaffLoginPage } from './pages/LoginPage';
import { HomePage } from './pages/Home';
import { BuildYourClinicPage } from './pages/BuildYourClinicPage';
import { ClinicSelectionPage } from './pages/ClinicSelectionPage';

function App() {
  const [view, setViewState] = useState<"login" | "home" | "build" | "select">(() => {
    const token = localStorage.getItem("docodile_token");
    const sessionActive = sessionStorage.getItem("docodile_session");

    if (!token || !sessionActive) {
      // New browser session — clear everything and go to login
      localStorage.removeItem("docodile_token");
      localStorage.removeItem("docodile_role");
      localStorage.removeItem("docodile_view");
      localStorage.removeItem("docodile_home_tab");
      localStorage.removeItem("docodile_clinic_id");
      localStorage.removeItem("docodile_clinic_name");
      return "login";
    }

    // Existing session (refresh) — restore saved view
    const savedView = localStorage.getItem("docodile_view") as "login" | "home" | "build" | "select";
    return savedView || "select";
  });

  const setView = (newView: "login" | "home" | "build" | "select") => {
    localStorage.setItem("docodile_view", newView);
    setViewState(newView);
  };

  const handleLoginSuccess = () => {
    sessionStorage.setItem("docodile_session", "true");
    setView("select");
  };

  const handleLogout = () => {
    localStorage.removeItem("docodile_token");
    localStorage.removeItem("docodile_role");
    localStorage.removeItem("docodile_view");
    localStorage.removeItem("docodile_home_tab");
    sessionStorage.removeItem("docodile_session");
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
