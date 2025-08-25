// src/App.js
import React, { useState } from "react";
import ReportForm from "./components/ReportForm";
import ReportList from "./components/ReportList";
import LiveMap from "./components/LiveMap";
import AdminLogin from "./components/AdminLogin";  // <-- new import
import SuccessModal from "./SuccessModal";
import "./App.css";
import "leaflet/dist/leaflet.css";

export default function App() {
  const [showSuccess, setShowSuccess] = useState(false);
  const [showAdminLogin, setShowAdminLogin] = useState(false); // <-- toggle for admin login

  return (
    <div className="app-container">
      {/* Header */}
      <header className="header-section">
        <h1 className="app-title">The Disaster Ledger</h1>
        <p className="app-subtitle">Tracking Emergencies Across India</p>
        {/* Admin Login Button */}
        <button 
          onClick={() => setShowAdminLogin(!showAdminLogin)} 
          style={{ padding: "6px 12px", marginTop: "10px" }}
        >
          {showAdminLogin ? "Close Admin Login" : "Admin Login"}
        </button>
      </header>

      {showAdminLogin && <AdminLogin />} {/* Render the admin login */}

      <hr className="section-divider" />

      {/* Main content */}
      <div className="content-section">
        {/* Left column */}
        <div className="content-left">
          <div className="card">
            <LiveMap />
          </div>
          <div className="horizontal-divider" />
          <div className="card">
            <ReportList />
          </div>
        </div>

        {/* vertical divider */}
        <div className="vertical-divider" />

        {/* Right column */}
        <aside className="content-right">
          <div className="card">
            <ReportForm onSuccess={() => setShowSuccess(true)} />
          </div>
        </aside>
      </div>

      {/* Success modal */}
      <SuccessModal show={showSuccess} onClose={() => setShowSuccess(false)}>
        <div className="resource-guidance">
          <h2>Emergency Resources</h2>
          <p>Find nearby help, shelters, and instructions:</p>
          <div className="guidance-section">
            <LiveMap />
          </div>
          <div className="guidance-contacts">
            <h3>Important Contacts</h3>
            <ul>
              <li>National Emergency Helpline: 112</li>
              <li>Disaster Management: 108</li>
              <li>Fire Services: 101</li>
              <li>Medical Emergency: 102</li>
            </ul>
          </div>
          <div className="guidance-instructions">
            <h3>Safety Instructions</h3>
            <p>Stay calm, follow official advisories, and keep communication lines open.</p>
          </div>
        </div>
      </SuccessModal>
    </div>
  );
}
