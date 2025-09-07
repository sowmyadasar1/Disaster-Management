import React, { useEffect, useState } from "react";
import { db } from "../firebase";
import {
  collection,
  getDocs,
  query,
  orderBy,
  updateDoc,
  doc,
  deleteDoc,
} from "firebase/firestore";
import { FaFlag, FaTrash, FaEdit, FaCheck, FaSpinner } from "react-icons/fa";
import "../pages/ReportsPage.css"; // reuse styling

export default function AdminDashboard() {
  const [reports, setReports] = useState([]);
  const [selectedReports, setSelectedReports] = useState([]);
  const [loading, setLoading] = useState(true);

  // Quick analytics
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    inProgress: 0,
    resolved: 0,
    flagged: 0,
  });

  // Filter & Sort states
  const [statusFilter, setStatusFilter] = useState("all"); // all | pending | in-progress | resolved | flagged
  const [sortBy, setSortBy] = useState("createdAt"); // createdAt | reporter

  useEffect(() => {
    async function fetchReports() {
      try {
        const q = query(
          collection(db, "reports"),
          orderBy("createdAt", "desc")
        );
        const querySnapshot = await getDocs(q);
        const reportData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setReports(reportData);

        // Compute stats
        const pending = reportData.filter((r) => r.status === "pending").length;
        const inProgress = reportData.filter(
          (r) => r.status === "in-progress"
        ).length;
        const resolved = reportData.filter(
          (r) => r.status === "resolved"
        ).length;
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

  // === Actions ===
  const handleDelete = async (id) => {
    await deleteDoc(doc(db, "reports", id));
    setReports(reports.filter((r) => r.id !== id));
  };

  const bulkDelete = async () => {
    await Promise.all(
      selectedReports.map((id) => deleteDoc(doc(db, "reports", id)))
    );
    setReports(reports.filter((r) => !selectedReports.includes(r.id)));
    setSelectedReports([]);
  };

  const toggleFlag = async (id, current) => {
    const ref = doc(db, "reports", id);
    await updateDoc(ref, { flagged: !current });
    setReports(
      reports.map((r) => (r.id === id ? { ...r, flagged: !current } : r))
    );
  };

  const updateStatus = async (id, newStatus) => {
    const ref = doc(db, "reports", id);
    await updateDoc(ref, { status: newStatus });
    setReports(
      reports.map((r) => (r.id === id ? { ...r, status: newStatus } : r))
    );
  };

  // === Filtering & Sorting ===
  const filteredReports = reports
    .filter((r) => {
      if (statusFilter === "all") return true;
      if (statusFilter === "flagged") return r.flagged;
      return r.status === statusFilter;
    })
    .sort((a, b) => {
      if (sortBy === "reporter") {
        return (a.fullName || "").localeCompare(b.fullName || "");
      }
      if (sortBy === "createdAt") {
        return (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0);
      }
      return 0;
    });

  if (loading)
    return <p className="text-center mt-8">Loading admin dashboard...</p>;

  return (
    <div className="page-container">
      <h1 className="section-title">Admin Dashboard</h1>

      {/* Quick Stats */}
      <div
        className="controls-container"
        style={{ justifyContent: "space-around" }}
      >
        <div>
          <strong>Total:</strong> {stats.total}
        </div>
        <div>
          <strong>Pending:</strong> {stats.pending}
        </div>
        <div>
          <strong>In Progress:</strong> {stats.inProgress}
        </div>
        <div>
          <strong>Resolved:</strong> {stats.resolved}
        </div>
        <div>
          <strong>Flagged:</strong> {stats.flagged}
        </div>
      </div>

      {/* Filters & Sort */}
      <div
        className="controls-container"
        style={{ marginTop: "15px", gap: "20px" }}
      >
        <div>
          <label>
            <strong>Filter by status:</strong>{" "}
          </label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All</option>
            <option value="pending">Pending</option>
            <option value="in-progress">In Progress</option>
            <option value="resolved">Resolved</option>
            <option value="flagged">Flagged</option>
          </select>
        </div>
        <div>
          <label>
            <strong>Sort by:</strong>{" "}
          </label>
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
            <option value="createdAt">Date</option>
            <option value="reporter">Reporter</option>
          </select>
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedReports.length > 0 && (
        <div className="controls-container">
          <button onClick={bulkDelete} className="control-button">
            🗑️ Delete Selected
          </button>
        </div>
      )}

      {/* Reports */}
      <div className="reports-grid">
        {filteredReports.map((report) => (
          <div key={report.id} className="report-card">
            <input
              type="checkbox"
              checked={selectedReports.includes(report.id)}
              onChange={(e) => {
                if (e.target.checked) {
                  setSelectedReports([...selectedReports, report.id]);
                } else {
                  setSelectedReports(
                    selectedReports.filter((id) => id !== report.id)
                  );
                }
              }}
            />

            <h2 className="report-title">{report.type}</h2>
            <p>
              <strong>Status:</strong>{" "}
              <span
                style={{
                  color:
                    report.status === "resolved"
                      ? "green"
                      : report.status === "in-progress"
                      ? "goldenrod"
                      : report.status === "pending"
                      ? "red"
                      : "black",
                  fontWeight: "600",
                }}
              >
                {report.status}
              </span>
            </p>
            <p>
              <strong>Location:</strong> {report.location}
            </p>
            <p>
              <strong>Reporter:</strong> {report.fullName}
            </p>
            {report.description && (
              <p>
                <strong>Description:</strong> {report.description}
              </p>
            )}
            {report.contact && (
              <p>
                <strong>Contact:</strong> {report.contact}
              </p>
            )}
            {report.createdAt && (
              <p>
                <strong>Date:</strong>{" "}
                {new Date(report.createdAt.seconds * 1000).toLocaleString()}
              </p>
            )}

            {/* Admin Controls */}
            <div
              className="controls-container"
              style={{ marginTop: "10px", gap: "10px" }}
            >
              <button
                onClick={() => toggleFlag(report.id, report.flagged)}
                className="control-button"
              >
                <FaFlag color={report.flagged ? "red" : "grey"} />{" "}
                {report.flagged ? "Unflag" : "Flag"}
              </button>
              <button
                onClick={() => updateStatus(report.id, "in-progress")}
                className="control-button"
              >
                <FaSpinner /> Mark In Progress
              </button>
              <button
                onClick={() => updateStatus(report.id, "resolved")}
                className="control-button"
              >
                <FaCheck /> Mark Resolved
              </button>
              <button
                onClick={() => alert("Edit feature coming soon")}
                className="control-button"
              >
                <FaEdit /> Edit
              </button>
              <button
                onClick={() => handleDelete(report.id)}
                className="control-button"
              >
                <FaTrash /> Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
