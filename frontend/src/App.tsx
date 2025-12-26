import React from 'react';
import './App.css';
import { RoundedButton } from './components/Button';
import "./styles/globals.css";


function App() {
  return (
    <div className="App">
      <header className="App-header">
        <RoundedButton width={120}>Login</RoundedButton>
      </header>
    </div>
  );
}

export default App;
