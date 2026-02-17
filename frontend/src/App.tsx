import React, { useState } from 'react';
import "./styles/globals.css";
import { AdminLoginPage, StaffLoginPage } from './pages/LoginPage';
import { HomePage } from './pages/Home';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  return (
    <div className="App">
      <header className="App-header">
        {isLoggedIn ? (
          <HomePage />
        ) : (
          <StaffLoginPage onLoginSuccess={() => setIsLoggedIn(true)} />
        )}
      </header>
    </div>
  );
}

export default App;
