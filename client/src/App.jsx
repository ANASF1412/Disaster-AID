import React from "react";

const API_URL = import.meta.env.VITE_API_URL;

export default function App() {
  return (
    <div className="app">
      <header className="header">
        <h1>🚨 Disaster Relief Resource Tracker</h1>
        <p className="subtitle">Coordinating aid where it matters most</p>
      </header>

      <main className="dashboard">
        <div className="card">
          <h2>Active Disasters</h2>
          <p className="placeholder">No active events — data loads in Phase 2</p>
        </div>

        <div className="card">
          <h2>Resources Available</h2>
          <p className="placeholder">Inventory connects in Phase 2</p>
        </div>

        <div className="card">
          <h2>Relief Teams</h2>
          <p className="placeholder">Team registry loads in Phase 2</p>
        </div>
      </main>

      <footer className="footer">
        <small>API: {API_URL || "not configured"}</small>
      </footer>
    </div>
  );
}
