import React, { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import "./styles/globals.css";
import { AdminLoginPage, StaffLoginPage } from './pages/LoginPage';
import { HomePage } from './pages/Home';
import { BuildYourClinicPage } from './pages/BuildYourClinicPage';
import { ClinicSelectionPage } from './pages/ClinicSelectionPage';
import { SetupPasswordPage } from './pages/SetupPasswordPage/SetupPasswordPage';
import { AuditGalleryPage } from './pages/AuditGallery'; // TEMP — UI audit, delete with the route below

function App() {
  const [loginMode, setLoginMode] = useState<"admin" | "staff">("admin");
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
    <BrowserRouter>
      <Routes>
        <Route path="/setup-password" element={<SetupPasswordPage />} />
        <Route path="/audit" element={<AuditGalleryPage />} /> {/* TEMP — UI audit gallery, delete when review done */}
        <Route path="/*" element={<MainApp
          view={view}
          loginMode={loginMode}
          setLoginMode={setLoginMode}
          handleLoginSuccess={handleLoginSuccess}
          handleLogout={handleLogout}
          handleNavigateToBuild={handleNavigateToBuild}
          handleNavigateToSelection={handleNavigateToSelection}
          setView={setView}
        />} />
      </Routes>
    </BrowserRouter>
  );
}

type MainAppProps = {
  view: "login" | "home" | "build" | "select";
  loginMode: "admin" | "staff";
  setLoginMode: (m: "admin" | "staff") => void;
  handleLoginSuccess: () => void;
  handleLogout: () => void;
  handleNavigateToBuild: () => void;
  handleNavigateToSelection: () => void;
  setView: (v: "login" | "home" | "build" | "select") => void;
};

function MainApp({
  view, loginMode, setLoginMode,
  handleLoginSuccess, handleLogout,
  handleNavigateToBuild, handleNavigateToSelection, setView,
}: MainAppProps) {
  return (
    <div className="App">
      {view === "login" && (
        <div className="centered-layout">
          <header className="App-header">
            {loginMode === "staff" ? (
              <StaffLoginPage
                onLoginSuccess={handleLoginSuccess}
                onSwitchToAdmin={() => setLoginMode("admin")}
              />
            ) : (
              <AdminLoginPage
                onLoginSuccess={handleLoginSuccess}
                onSwitchToStaff={() => setLoginMode("staff")}
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
