import React, { useState } from 'react';
import "./styles/globals.css";
import { AdminLoginPage, StaffLoginPage } from './pages/LoginPage';
import { HomePage } from './pages/Home';
import { BuildYourClinicPage } from './pages/BuildYourClinicPage';
import { ClinicSelectionPage } from './pages/ClinicSelectionPage';
import { Clinic } from './components/ClinicTabs';
import { API_BASE_URL } from './apiConfig';

type ViewState = "login" | "home" | "build" | "selection";

function App() {
  const [view, setViewState] = useState<ViewState>(() => {
    const savedView = localStorage.getItem("docodile_view") as ViewState;
    const token = localStorage.getItem("docodile_token");
    
    if (!token) return "login";
    
    const validViews: ViewState[] = ["login", "home", "build", "selection"];
    if (savedView && validViews.includes(savedView)) {
      return savedView;
    }
    return "login";
  });

  const setView = (newView: ViewState) => {
    localStorage.setItem("docodile_view", newView);
    setViewState(newView);
  };

  const handleLoginSuccess = async () => {
    const role = localStorage.getItem("docodile_role");
    const token = localStorage.getItem("docodile_token");

    if (!token) {
      setView("login");
      return;
    }

    if (role !== "ADMIN") {
      setView("home");
      return;
    }

    try {
      // Fetch clinics to determine routing
      const clinicsResponse = await fetch(`${API_BASE_URL}/api/tenant/clinics`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!clinicsResponse.ok) {
        setView("home");
        return;
      }

      const clinics = (await clinicsResponse.json()) as any[];

      if (clinics.length === 0) {
        setView("build");
        return;
      }

      if (clinics.length === 1) {
        localStorage.setItem("docodile_clinic_id", clinics[0].id);
        localStorage.setItem("docodile_clinic_name", clinics[0].name);
        setView("home");
        return;
      }

      // If more than 1 clinic, go to selection
      setView("selection");
    } catch {
      setView("home");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("docodile_token");
    localStorage.removeItem("docodile_role");
    localStorage.removeItem("docodile_view");
    localStorage.removeItem("docodile_home_tab");
    localStorage.removeItem("docodile_clinic_id");
    localStorage.removeItem("docodile_clinic_name");
    setView("login");
  };

  const handleNavigateToBuild = () => {
    setView("build");
  };

  const handleNavigateToSelection = () => {
    setView("selection");
  };

  const handleSelectClinic = (clinic: Clinic) => {
    localStorage.setItem("docodile_clinic_id", clinic.id);
    localStorage.setItem("docodile_clinic_name", clinic.name);
    setView("home");
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
      {view === "build" && (
        <BuildYourClinicPage 
          onNext={() => setView("home")} 
          onLogout={handleLogout}
        />
      )}
      {view === "selection" && (
        <ClinicSelectionPage 
          onSelectClinic={handleSelectClinic} 
          onLogout={handleLogout}
        />
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
