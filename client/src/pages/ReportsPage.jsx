import React, { useEffect, useState } from "react";
import { db } from "../firebase"; // adjust path if needed
import { collection, getDocs, query, orderBy } from "firebase/firestore";

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
        const reportData = querySnapshot.docs.map(doc => ({
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

  // Apply filtering, searching, and sorting
  const filteredReports = reports
    .filter(report =>
      filterStatus === "all" || (report.status || "").toLowerCase() === filterStatus
    )
    .filter(report =>
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
    <div className="max-w-5xl mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">All Disaster Reports</h1>

      {/* Search + Filter + Sort Controls */}
      <div className="flex flex-wrap gap-3 mb-6">
        <input
          type="text"
          placeholder="Search reports..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="border p-2 rounded flex-1 min-w-[200px]"
        />

        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="border p-2 rounded"
        >
          <option value="all">All Status</option>
          <option value="resolved">Resolved</option>
          <option value="pending">Pending</option>
          <option value="in-progress">In Progress</option>
        </select>

        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="border p-2 rounded"
        >
          <option value="date">Sort by Date</option>
          <option value="status">Sort by Status</option>
          <option value="type">Sort by Type</option>
        </select>
      </div>

      {/* Reports Grid */}
      {filteredReports.length === 0 ? (
        <p>No reports match your criteria.</p>
      ) : (
        <div className="grid gap-4">
          {filteredReports.map((report) => (
            <div
              key={report.id}
              className="border p-4 rounded shadow hover:shadow-md transition"
            >
              <h2 className="text-xl font-semibold">{report.type || "Unknown Type"}</h2>
              <p className="text-gray-600">{report.location || "No location provided"}</p>
              <p className="mt-2"><strong>Status:</strong> {report.status || "N/A"}</p>
              <p><strong>Reported by:</strong> {report.fullName || "Anonymous"}</p>
              <p className="mt-1 text-sm text-gray-500">
                {report.createdAt?.seconds
                  ? new Date(report.createdAt.seconds * 1000).toLocaleString()
                  : "No date available"}
              </p>
              {report.description && (
                <p className="mt-2">{report.description}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
