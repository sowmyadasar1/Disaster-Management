// src/App.js
import React from "react";
import ReportForm from "./components/ReportForm";
import ReportList from "./components/ReportList";
import LiveMap from "./components/LiveMap";
import "./App.css";
import "leaflet/dist/leaflet.css";


export default function App() {
  return (
    <div className="app-container">
      {/* Header */}
      <header className="header-section">
        <h1 className="app-title">The Disaster Ledger</h1>
        <p className="app-subtitle">Tracking Emergencies Across India</p>
      </header>

      <hr className="section-divider" />

      {/* Main content: left = map + reports (stacked), right = form */}
      <div className="content-section">
        {/* Left column: map (top) + horizontal divider + recent reports (below) */}
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

        {/* Right column: form */}
        <aside className="content-right">
          <div className="card">
            <ReportForm onSuccess={() => {
              // ReportIncident's SuccessModal used elsewhere — if you have a top-level modal,
              // you can call it here; otherwise, ReportForm triggers alert and reset.
            }} />
          </div>
        </aside>
      </div>
    </div>
  );
}
