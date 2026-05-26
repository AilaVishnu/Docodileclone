import React, { useState } from 'react';
import "./styles/globals.css";
import "./styles/responsive.css";
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
      localStorage.removeItem("docodile_user_id");
      localStorage.removeItem("docodile_user_email");
      return "login";
    }

    // Existing session (refresh) — restore saved view
    const savedView = localStorage.getItem("docodile_view") as "login" | "home" | "build" | "select";
    const role = localStorage.getItem("docodile_role");
    if (role && role !== "ADMIN") {
      return "home"; // Staff should always go straight to home
    }
    return savedView || "select";
  });

  const [loginMode, setLoginMode] = useState<"admin" | "staff">("admin");

  const setView = (newView: "login" | "home" | "build" | "select") => {
    const role = localStorage.getItem("docodile_role");
    let targetView = newView;
    if (role && role !== "ADMIN" && (newView === "build" || newView === "select")) {
      targetView = "home";
    }
    localStorage.setItem("docodile_view", targetView);
    setViewState(targetView);
  };

  const handleLoginSuccess = () => {
    sessionStorage.setItem("docodile_session", "true");
    const role = localStorage.getItem("docodile_role");
    if (role && role !== "ADMIN") {
      setView("home");
    } else {
      setView("select");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("docodile_token");
    localStorage.removeItem("docodile_role");
    localStorage.removeItem("docodile_view");
    localStorage.removeItem("docodile_home_tab");
    localStorage.removeItem("docodile_clinic_id");
    localStorage.removeItem("docodile_clinic_name");
    localStorage.removeItem("docodile_user_id");
    localStorage.removeItem("docodile_user_email");
    sessionStorage.removeItem("docodile_session");
    setLoginMode("admin");
    setView("login");
  };

  const handleNavigateToBuild = () => {
    setView("build");
  };

  const handleNavigateToSelection = () => {
    setView("select");
  };

  return (
    <div className="App">
      {view === "login" && (
        <div className="centered-layout">
          <header className="App-header">
            {loginMode === "admin" ? (
              <AdminLoginPage
                onLoginSuccess={handleLoginSuccess}
                onSwitchToStaff={() => setLoginMode("staff")}
              />
            ) : (
              <StaffLoginPage
                onLoginSuccess={handleLoginSuccess}
                onSwitchToAdmin={() => setLoginMode("admin")}
              />
            )}
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
          onViewAllClinics={handleNavigateToSelection}
        />
      )}
    </div>
  );
}

export default App;
