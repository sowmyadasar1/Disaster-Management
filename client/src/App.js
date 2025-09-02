import React from "react";
import ReportForm from "./components/ReportForm";
import ReportList from "./components/ReportList";
import LiveMap from "./components/LiveMap";
import AdminLogin from "./components/AdminLogin";
import AnalyticsDashboard from "./components/AnalyticsDashboard";
import "./App.css";
import "leaflet/dist/leaflet.css";

export default function App() {
  const [showAdminLogin, setShowAdminLogin] = React.useState(false);
  const [refreshKey, setRefreshKey] = React.useState(0);

  return (
    <div className="app-container">
      {/* ===== Header Section ===== */}
      <header className="header-section">
        <div className="header-left">
          <h1 className="app-title">Disaster Response System</h1>
        </div>
        <nav className="header-right">
          <ul className="nav-items">
            <li><a href="/">Home</a></li>
            <li>
              <button 
                onClick={() => setShowAdminLogin(!showAdminLogin)} 
                className="nav-button"
              >
                Admin
              </button>
            </li>
            <li><a href="/reports">Reports</a></li>
            <li><a href="/guidance">Resource Guidance</a></li>
          </ul>
        </nav>
      </header>

      {showAdminLogin && <AdminLogin />}

      <hr className="section-divider" />

      {/* ===== Main 2x2 Grid Section ===== */}
      <div className="grid-container">
        {/* Top-left: Report Form */}
        <div className="grid-item">
          <ReportForm onSuccess={() => setRefreshKey(p => p + 1)} />
        </div>

        {/* Top-right: Analytics */}
        <div className="grid-item">
          <AnalyticsDashboard refreshKey={refreshKey} />
        </div>

        {/* Bottom-left: Live Map */}
        <div className="grid-item">
          <LiveMap />
        </div>

        {/* Bottom-right: Recent Reports */}
        <div className="grid-item">
          <ReportList limit={3} />
        </div>
      </div>
    </div>
  );
}
