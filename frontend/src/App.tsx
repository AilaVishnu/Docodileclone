import React, { useState } from 'react';
import "./styles/globals.css";
import { AdminLoginPage } from './pages/LoginPage';
import { BuildYourClinicPage } from './pages/BuildYourClinicPage';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  return (
    <div className="App">
      <header className="App-header">
        {isLoggedIn ? (
          <BuildYourClinicPage />
        ) : (
          <AdminLoginPage onLoginSuccess={() => setIsLoggedIn(true)} />
        )}
      </header>
    </div>
  );
}

export default App;
