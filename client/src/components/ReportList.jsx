import React, { useEffect, useState } from "react";
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";
import { db } from "../firebase";

const ReportList = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const reportsQuery = query(
      collection(db, "reports"),
      orderBy("timestamp", "desc")
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
      <h2>Recent Disaster Reports</h2>
      <ul style={{ listStyle: "none", padding: 0 }}>
        {reports.map((report) => (
          <li
            key={report.id}
            style={{
              marginBottom: "16px",
              padding: "16px",
              border: "1px solid #ddd",
              borderRadius: "12px",
              boxShadow: "0 2px 6px rgba(0,0,0,0.05)"
            }}
          >
            {/* First line: Name left, Status badge right */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <strong style={{ fontSize: "1.1rem" }}>
                {report.fullName || "Unknown Reporter"}
              </strong>
              <span
                style={{
                  padding: "4px 10px",
                  borderRadius: "12px",
                  fontSize: "0.85rem",
                  fontWeight: "500",
                  ...getStatusStyle(report.status)
                }}
              >
                {report.status || "Pending"}
              </span>
            </div>

            {/* Second line: location with icon */}
            <p style={{ margin: "6px 0", color: "#555", fontSize: "0.9rem" }}>
              <span style={{ marginRight: "4px" }}>📍</span>
              {report.location || "Unknown Location"}
            </p>

            {/* Third line: type — description */}
            <p style={{ margin: "4px 0", fontSize: "0.95rem" }}>
              <strong>{report.type || "Unknown Disaster"}</strong>
              {" — "}
              {report.description || "No description"}
            </p>

            {/* Optional image */}
            {report.imageUrl && (
              <div>
                <img
                  src={report.imageUrl}
                  alt={`${report.type || "Disaster"} evidence`}
                  style={{ width: "150px", marginTop: "6px", borderRadius: "6px" }}
                />
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ReportList;
