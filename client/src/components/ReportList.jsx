import React, { useEffect, useState } from "react";
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";
import { db } from "../firebase";

const ReportList = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Helper to format Firestore timestamps safely
  const formatDate = (timestamp) => {
    if (!timestamp) return "Unknown";
    try {
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
      return date.toLocaleString([], {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "Invalid date";
    }
  };

  useEffect(() => {
    const reportsQuery = query(
      collection(db, "reports"),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(
      reportsQuery,
      (snapshot) => {
        const fetched = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setReports(fetched);
        setLoading(false);
      },
      (err) => {
        console.error("Error fetching reports:", err);
        setError("Failed to load reports.");
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const getStatusStyle = (status) => {
    switch (status?.toLowerCase()) {
      case "resolved":
        return { background: "#d4edda", color: "#155724" };
      case "in-progress":
        return { background: "#fff3cd", color: "#856404" };
      case "pending":
      default:
        return { background: "#f8d7da", color: "#721c24" };
    }
  };

  if (loading) return <p>Loading reports...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;
  if (reports.length === 0) return <p>No disaster reports yet.</p>;

  return (
    <div className="report-list">
      <h2 style={{ marginBottom: "16px" }}>Recent Disaster Reports</h2>
      <ul style={{ listStyle: "none", padding: 0 }}>
        {reports.map((report) => (
          <li
            key={report.id}
            style={{
              marginBottom: "18px",
              padding: "18px",
              border: "1px solid #ddd",
              borderRadius: "14px",
              boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
              background: "#fff",
            }}
          >
            {/* First row: Reporter name + Status badge */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "2px",
              }}
            >
              <strong style={{ fontSize: "1.1rem", color: "#222" }}>
                {report.fullName || "Unknown Reporter"}
              </strong>
              <span
                style={{
                  padding: "4px 12px",
                  borderRadius: "12px",
                  fontSize: "0.85rem",
                  fontWeight: "500",
                  ...getStatusStyle(report.status),
                }}
              >
                {report.status || "Pending"}
              </span>
            </div>

            {/* Second row: Submission time */}
            <p style={{ margin: "4px 0", fontSize: "0.8rem", color: "#777" }}>
              Submitted at: {formatDate(report.createdAt)}
            </p>

            {/* Third row: Location */}
            <p style={{ margin: "4px 0", color: "#555", fontSize: "0.9rem" }}>
              <span style={{ marginRight: "4px" }}>📍</span>
              {report.location || "Unknown Location"}
            </p>

            {/* Fourth row: Contact */}
            <p style={{ margin: "4px 0", fontSize: "0.9rem", color: "#444" }}>
              <span style={{ marginRight: "4px" }}>📞</span>
              {report.contact || "No contact info"}
            </p>

            {/* Fifth row: Type — description */}
            <p style={{ margin: "4px 0", fontSize: "0.95rem", color: "#333" }}>
              <strong>{report.type || "Unknown Disaster"}</strong>
              {" — "}
              {report.description || "No description provided"}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ReportList;
