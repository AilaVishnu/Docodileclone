import React, { useState } from 'react';
import "./styles/globals.css";
import { AdminLoginPage, StaffLoginPage } from './pages/LoginPage';
import { HomePage } from './pages/Home';
import { BuildYourClinicPage } from './pages/BuildYourClinicPage';
import { AppointmentsPage } from './pages/AppointmentsPage';

type ViewType = "login" | "home" | "build" | "appointments";

function App() {
  const [view, setView] = useState<ViewType>("login");

  const handleLoginSuccess = async () => {
    const role = localStorage.getItem("docodile_role");
    const token = localStorage.getItem("docodile_token");

    if (!token) {
      setView("login");
      return;
    }

    if (role !== "ADMIN") {
      // Non-admin staff go directly to appointments
      setView("appointments");
      return;
    }

    try {
      const response = await fetch("http://localhost:8080/api/tenant/status", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        setView("appointments");
        return;
      }

      const data = (await response.json()) as { complete: boolean };
      // Admin with complete clinic setup goes to appointments
      setView(data.complete ? "appointments" : "build");
    } catch {
      setView("appointments");
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        {view === "login" && (
          <AdminLoginPage onLoginSuccess={handleLoginSuccess} />
        )}
        {view === "build" && <BuildYourClinicPage />}
        {view === "home" && <HomePage />}
        {view === "appointments" && <AppointmentsPage />}
      </header>
    </div>
  );
}

export default App;
