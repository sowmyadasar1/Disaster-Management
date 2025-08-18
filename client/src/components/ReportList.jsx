// src/components/ReportList.js
import React, { useEffect, useState } from "react";
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";
import { db } from "../firebase";

/**
 * Displays disaster reports in real time.
 */
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

  if (loading) return <p>Loading reports...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;
  if (reports.length === 0) return <p>No disaster reports yet.</p>;

  return (
    <div className="report-list">
      <h2>Recent Disaster Reports</h2>
      <ul>
        {reports.map((report) => (
          <li key={report.id}>
            <strong>{report.type}</strong> — {report.location}, {report.city}
            <br />
            Status: {report.status || "Pending"}
            {report.imageUrl && (
              <div>
                <img
                  src={report.imageUrl}
                  alt={`${report.type} evidence`}
                  style={{ width: "150px", marginTop: "4px" }}
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
