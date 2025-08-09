import React, { useEffect, useState } from "react";
import { db } from "../firebase";
import { collection, getDocs } from "firebase/firestore";
import "./ReportList.css";

const ReportList = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "disasterReports"));
        const reportData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setReports(reportData);
      } catch (error) {
        console.error("❌ Error fetching reports:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, []);

  return (
    <div className="report-list-container">
      <h2 className="list-title">Submitted Reports</h2>

      {loading ? (
        <p className="loading-text">Loading reports...</p>
      ) : reports.length === 0 ? (
        <p className="no-reports">No reports found.</p>
      ) : (
        <div className="reports-grid">
          {reports.map((report) => (
            <div className="report-card" key={report.id}>
              <h3 className="report-title">
                {report.incidentType || report.name}
              </h3>
              <p className="report-location">{report.location}</p>
              <p className="report-message">
                {report.description || report.message}
              </p>
              {report.imageUrl && (
                <img
                  src={report.imageUrl}
                  alt="Incident"
                  className="report-image"
                />
              )}
              <p className="report-contact">
                <strong>Contact:</strong> {report.contact || "N/A"}
              </p>
              <p className="report-status">
                Status:{" "}
                <span
                  className={
                    report.verified ? "status-verified" : "status-pending"
                  }
                >
                  {report.verified ? "Verified" : "Pending"}
                </span>
              </p>
              <p className="report-date">
                {report.createdAt?.toDate
                  ? report.createdAt.toDate().toLocaleString()
                  : "Unknown date"}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ReportList;
