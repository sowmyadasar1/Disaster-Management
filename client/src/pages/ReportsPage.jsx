import React, { useEffect, useState } from "react";
import { db } from "../firebase";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { FaPhone, FaMapMarkerAlt } from "react-icons/fa";
import "./ReportsPage.css";
import "bootstrap/dist/css/bootstrap.min.css";

export default function ReportsPage() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [sortBy, setSortBy] = useState("date");
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    inProgress: 0,
    resolved: 0,
    flagged: 0,
  });

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

        // Calculate stats
        const pending = reportData.filter((r) => r.status === "pending").length;
        const inProgress = reportData.filter((r) => r.status === "in-progress").length;
        const resolved = reportData.filter((r) => r.status === "resolved").length;
        const flagged = reportData.filter((r) => r.flagged).length;

        setStats({
          total: reportData.length,
          pending,
          inProgress,
          resolved,
          flagged,
        });

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
      (r) =>
        filterStatus === "all" ||
        (filterStatus === "flagged" ? r.flagged : (r.status || "").toLowerCase() === filterStatus)
    )
    .filter(
      (r) =>
        r.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.type?.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === "date") return (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0);
      if (sortBy === "status") return (a.status || "").localeCompare(b.status || "");
      if (sortBy === "type") return (a.type || "").localeCompare(b.type || "");
      return 0;
    });

  if (loading) return <p className="text-center mt-4">Loading reports...</p>;

  const total = stats.total || 1;
  const pendingPct = (stats.pending / total) * 100;
  const inProgressPct = (stats.inProgress / total) * 100;
  const resolvedPct = (stats.resolved / total) * 100;

  return (
    <div className="page-container">
      <h1 className="section-title mb-4">All Disaster Reports</h1>

      {/* Stats with flagged */}
      {stats.total > 0 && (
        <>
          <div className="controls-container mb-2" style={{ gap: "20px", flexWrap: "wrap" }}>
            <div><strong>Total Cases:</strong> {stats.total}</div>
            <div><strong>Flagged:</strong> {stats.flagged}</div>
          </div>

          {/* Progress Bar with labels */}
          <div className="progress mb-4" style={{ height: "30px" }}>
            {pendingPct > 0 && (
              <div
                className="progress-bar bg-danger"
                style={{ width: `${pendingPct}%` }}
                role="progressbar"
              >
                Pending ({stats.pending})
              </div>
            )}
            {inProgressPct > 0 && (
              <div
                className="progress-bar bg-warning text-dark"
                style={{ width: `${inProgressPct}%` }}
                role="progressbar"
              >
                In Progress ({stats.inProgress})
              </div>
            )}
            {resolvedPct > 0 && (
              <div
                className="progress-bar bg-success"
                style={{ width: `${resolvedPct}%` }}
                role="progressbar"
              >
                Resolved ({stats.resolved})
              </div>
            )}
          </div>
        </>
      )}

      {/* Controls */}
      <div className="controls-container mb-4">
        <input
          type="text"
          placeholder="Search reports..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="form-control w-auto"
        />
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="form-select w-auto"
        >
          <option value="all">All Status</option>
          <option value="resolved">Resolved</option>
          <option value="pending">Pending</option>
          <option value="in-progress">In Progress</option>
          <option value="flagged">Flagged</option>
        </select>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="form-select w-auto"
        >
          <option value="date">Sort by Date</option>
          <option value="status">Sort by Status</option>
          <option value="type">Sort by Type</option>
        </select>
      </div>

      {/* Reports Grid */}
      {filteredReports.length === 0 ? (
        <div className="alert alert-warning">No reports match your criteria.</div>
      ) : (
        <div className="reports-grid">
          {filteredReports.map((report) => (
            <div key={report.id} className="report-card">
              {report.flagged && <div className="flagged-banner">⚠️ Flagged for Review</div>}
              <h2 className="report-title">{report.type || "Unknown Type"}</h2>
              <p className="report-location">
                <FaMapMarkerAlt style={{ marginRight: "6px", color: "#e63946" }} />
                {report.location || "No location provided"}
              </p>
              {report.contact && (
                <p>
                  <FaPhone style={{ marginRight: "6px", color: "#333" }} />
                  <strong>Contact:</strong> {report.contact}
                </p>
              )}
              <p><strong>Status:</strong> {report.status || "N/A"}</p>
              <p><strong>Reported by:</strong> {report.fullName || "Anonymous"}</p>
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
