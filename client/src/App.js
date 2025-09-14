import React from "react";
import { BrowserRouter as Router, Routes, Route, NavLink } from "react-router-dom";
import ReportForm from "./components/ReportForm";
import ReportList from "./components/ReportList";
import ReportsPage from "./pages/ReportsPage";
import LiveMap from "./components/LiveMap";
import ResourceGuidance from "./pages/ResourceGuidance";
import AnalyticsDashboard from "./components/AnalyticsDashboard";
import AdminLogin from "./components/AdminLogin";
import AdminDashboard from "./components/AdminDashboard";
import ProtectedAdminRoute from "./components/ProtectedAdminRoute";
import "./App.css";
import "leaflet/dist/leaflet.css";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";

export default function App() {
  const [refreshKey, setRefreshKey] = React.useState(0);

  return (
    <Router>
      <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
        <div className="container-fluid">
          <NavLink className="navbar-brand" to="/">Disaster Response System</NavLink>
          <button
            className="navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#navbarNav"
            aria-controls="navbarNav"
            aria-expanded="false"
            aria-label="Toggle navigation"
          >
            <span className="navbar-toggler-icon"></span>
          </button>

          <div className="collapse navbar-collapse justify-content-end" id="navbarNav">
            <ul className="navbar-nav nav-underline">
              <li className="nav-item">
                <NavLink className="nav-link" to="/">Home</NavLink>
              </li>
              <li className="nav-item">
                <NavLink className="nav-link" to="/admin">Admin</NavLink>
              </li>
              <li className="nav-item">
                <NavLink className="nav-link" to="/reports">Reports</NavLink>
              </li>
              <li className="nav-item">
                <NavLink className="nav-link" to="/resource-guidance">Resource Guidance</NavLink>
              </li>
            </ul>
          </div>
        </div>
      </nav>

      <Routes>
        <Route
          path="/"
          element={
            <div className="main-content">
              <div className="grid-container">
                <div className="grid-item">
                  <ReportForm onSuccess={() => setRefreshKey((p) => p + 1)} />
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
            </div>
          }
        />
        <Route path="/reports" element={<ReportsPage />} />
        <Route path="/resource-guidance" element={<ResourceGuidance />} />
        <Route path="/admin" element={<AdminLogin />} />
        <Route
          path="/admin-dashboard"
          element={
            <ProtectedAdminRoute>
              <AdminDashboard />
            </ProtectedAdminRoute>
          }
        />
      </Routes>
    </Router>
  );
}
