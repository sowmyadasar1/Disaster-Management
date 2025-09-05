import React from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import ReportForm from "./components/ReportForm";
import ReportList from "./components/ReportList";
import ReportsPage from "./pages/ReportsPage";
import LiveMap from "./components/LiveMap";
import ResourceGuidance from "./pages/ResourceGuidance";
import AnalyticsDashboard from "./components/AnalyticsDashboard";
import AdminLogin from "./components/AdminLogin";
import AdminDashboard from "./components/AdminDashboard";
import ProtectedAdminRoute from "./components/ProtectedAdminRoute"; // ✅ new
import "./App.css";
import "leaflet/dist/leaflet.css";

export default function App() {
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
              <li><Link to="/admin">Admin</Link></li>
              <li><Link to="/reports">Reports</Link></li>
              <li><Link to="/resource-guidance">Resource Guidance</Link></li>
            </ul>
          </nav>
        </header>

        <hr className="section-divider" />

        <Routes>
          {/* Home Dashboard */}
          <Route 
            path="/" 
            element={
              <div className="grid-container">
                <div className="grid-item">
                  <ReportForm onSuccess={() => setRefreshKey(p => p + 1)} />
                </div>
                <div className="grid-item">
                  <AnalyticsDashboard refreshKey={refreshKey} />
                </div>
                <div className="grid-item">
                  <LiveMap />
                </div>
                <div className="grid-item">
                  <ReportList limit={3} />
                </div>
              </div>
            } 
          />

          {/* Reports Page */}
          <Route path="/reports" element={<ReportsPage />} />

          {/* Resource Guidance */}
          <Route path="/resource-guidance" element={<ResourceGuidance />} />

          {/* Admin Login Page */}
          <Route path="/admin" element={<AdminLogin />} />

          {/* Admin Dashboard (protected) */}
          <Route
            path="/admin-dashboard"
            element={
              <ProtectedAdminRoute>
                <AdminDashboard />
              </ProtectedAdminRoute>
            }
          />
        </Routes>
      </div>
    </Router>
  );
}
