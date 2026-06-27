import React, { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import "./styles/globals.css";
import { LoginPage } from './pages/LoginPage';
import { HomePage } from './pages/Home';
import { BuildYourClinicPage } from './pages/BuildYourClinicPage';
import { SetupPasswordPage } from './pages/SetupPasswordPage/SetupPasswordPage';

function App() {
  const [view, setViewState] = useState<"login" | "home" | "build">(() => {
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
    const savedView = localStorage.getItem("docodile_view") as "login" | "home" | "build";
    return savedView || "home";
  });

  const setView = (newView: "login" | "home" | "build") => {
    localStorage.setItem("docodile_view", newView);
    setViewState(newView);
  };

  const handleLoginSuccess = () => {
    sessionStorage.setItem("docodile_session", "true");
    setView("home");
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
    setView("login");
  };

  const handleNavigateToBuild = () => {
    setView("build");
  };

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/setup-password" element={<SetupPasswordPage />} />
        <Route path="/*" element={<MainApp
          view={view}
          handleLoginSuccess={handleLoginSuccess}
          handleLogout={handleLogout}
          handleNavigateToBuild={handleNavigateToBuild}
          setView={setView}
        />} />
      </Routes>
    </BrowserRouter>
  );
}

type MainAppProps = {
  view: "login" | "home" | "build";
  handleLoginSuccess: () => void;
  handleLogout: () => void;
  handleNavigateToBuild: () => void;
  setView: (v: "login" | "home" | "build") => void;
};

function MainApp({
  view,
  handleLoginSuccess, handleLogout,
  handleNavigateToBuild,
}: MainAppProps) {
  return (
    <div className="App">
      {view === "login" && (
        <div className="centered-layout">
          <header className="App-header">
            <LoginPage onLoginSuccess={handleLoginSuccess} />
          </header>
        </div>
      )}
      {view === "build" && (
        <BuildYourClinicPage onNext={() => {}} />
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
