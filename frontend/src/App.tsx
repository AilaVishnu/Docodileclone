import React, { useState } from 'react';
import "./styles/globals.css";
import { AdminLoginPage, StaffLoginPage } from './pages/LoginPage';
import { HomePage } from './pages/Home';
import { BuildYourClinicPage } from './pages/BuildYourClinicPage';

function App() {
  const [view, setView] = useState<"login" | "home" | "build">("login");

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
      const response = await fetch("http://localhost:8080/api/tenant/status", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        setView("home");
        return;
      }

      const data = (await response.json()) as { complete: boolean };
      setView(data.complete ? "home" : "build");
    } catch {
      setView("home");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("docodile_token");
    localStorage.removeItem("docodile_role");
    // Also remove clinic specific data if needed, but token is primary
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
      {view === "build" && (
        <div className="centered-layout">
          <header className="App-header">
            <BuildYourClinicPage onNext={() => setView("home")} />
          </header>
        </div>
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
