import React, { useEffect, useState } from "react";
import { db } from "../firebase";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { FaPhone, FaMapMarkerAlt } from "react-icons/fa";
import "./ReportsPage.css";

export default function ReportPage() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [sortBy, setSortBy] = useState("date");

  useEffect(() => {
    async function fetchReports() {
      try {
        const q = query(collection(db, "reports"), orderBy("createdAt", "desc"));
        const querySnapshot = await getDocs(q);
        const reportData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setReports(reportData);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching reports:", err);
        setLoading(false);
      }
    }
    fetchReports();
  }, []);

  const filteredReports = reports
    .filter(
      (report) =>
        filterStatus === "all" ||
        (report.status || "").toLowerCase() === filterStatus
    )
    .filter(
      (report) =>
        report.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        report.location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        report.type?.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === "date") {
        return (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0);
      } else if (sortBy === "status") {
        return (a.status || "").localeCompare(b.status || "");
      } else if (sortBy === "type") {
        return (a.type || "").localeCompare(b.type || "");
      }
      return 0;
    });

  if (loading) {
    return <p className="text-center mt-8">Loading reports...</p>;
  }

  return (
    <div className="page-container">
      <h1 className="section-title">All Disaster Reports</h1>

      {/* Search + Filter + Sort Controls */}
      <div className="controls-container">
        <input
          type="text"
          placeholder="Search reports..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="control-input"
        />

        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="control-select"
        >
          <option value="all">All Status</option>
          <option value="resolved">Resolved</option>
          <option value="pending">Pending</option>
          <option value="in-progress">In Progress</option>
        </select>

        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="control-select"
        >
          <option value="date">Sort by Date</option>
          <option value="status">Sort by Status</option>
          <option value="type">Sort by Type</option>
        </select>
      </div>

      {/* Reports Grid */}
      {filteredReports.length === 0 ? (
        <p className="no-reports">No reports match your criteria.</p>
      ) : (
        <div className="reports-grid">
          {filteredReports.map((report) => (
            <div key={report.id} className="report-card">
              <h2 className="report-title">{report.type || "Unknown Type"}</h2>

              <p className="report-location">
                <FaMapMarkerAlt
                  style={{ marginRight: "6px", color: "#e63946" }}
                />
                {report.location || "No location provided"}
              </p>

              {report.contact && (
                <p>
                  <FaPhone style={{ marginRight: "6px", color: "#333" }} />
                  <strong>Contact:</strong> {report.contact}
                </p>
              )}

              <p>
                <strong>Status:</strong> {report.status || "N/A"}
              </p>
              <p>
                <strong>Reported by:</strong> {report.fullName || "Anonymous"}
              </p>

              <p className="report-date">
                {report.createdAt?.seconds
                  ? new Date(report.createdAt.seconds * 1000).toLocaleString()
                  : "No date available"}
              </p>

              {report.description && (
                <p className="report-description">{report.description}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
