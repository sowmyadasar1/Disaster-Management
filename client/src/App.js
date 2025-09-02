import React from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import ReportForm from "./components/ReportForm";
import ReportList from "./components/ReportList";
import ReportsPage from "./pages/ReportsPage";
import LiveMap from "./components/LiveMap";
import AdminLogin from "./components/AdminLogin";
import ResourceGuidance from "./pages/ResourceGuidance";
import AnalyticsDashboard from "./components/AnalyticsDashboard";
import "./App.css";
import "leaflet/dist/leaflet.css";

export default function App() {
  const [showAdminLogin, setShowAdminLogin] = React.useState(false);
  const [refreshKey, setRefreshKey] = React.useState(0);

  return (
    <Router>
      <div className="app-container">
        {/* ===== Header Section ===== */}
        <header className="header-section">
          <div className="header-left">
            <h1 className="app-title">Disaster Response System</h1>
          </div>
          <nav className="header-right">
            <ul className="nav-items">
              <li><Link to="/">Home</Link></li>
              <li>
                <button 
                  onClick={() => setShowAdminLogin(!showAdminLogin)} 
                  className="nav-button"
                >
                  Admin
                </button>
              </li>
              <li><Link to="/reports">Reports</Link></li>
              <li><Link to="/resource-guidance">Resource Guidance</Link></li>
            </ul>
          </nav>
        </header>

        {showAdminLogin && <AdminLogin />}

        <hr className="section-divider" />

        <Routes>
          {/* Home Dashboard Route */}
          <Route 
            path="/" 
            element={
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
            } 
          />

          {/* Reports Page Route */}
          <Route path="/reports" element={<ReportsPage />} />
          <Route path="/resource-guidance" element={<ResourceGuidance />} />
        </Routes>
      </div>
    </Router>
  );
}
