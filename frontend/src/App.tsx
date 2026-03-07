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

  return (
    <div className="App">
      <header className="App-header">
        {view === "login" && (
          <AdminLoginPage onLoginSuccess={handleLoginSuccess} />
        )}
        {view === "build" && <BuildYourClinicPage />}
        {view === "home" && <HomePage />}
      </header>
    </div>
  );
}

export default App;
