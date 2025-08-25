import React, { useEffect, useState } from "react";
import { collection, getDocs, getFirestore } from "firebase/firestore";
import "../firebase";

function AdminPanel({ user }) {
  const [reports, setReports] = useState([]);

  useEffect(() => {
    const fetchReports = async () => {
      const db = getFirestore();
      const querySnap = await getDocs(collection(db, "reports"));
      const data = querySnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setReports(data);
    };
    fetchReports();
  }, []);

  return (
    <div style={{ padding: "1rem" }}>
      <h2>Admin Panel - Reports</h2>
      {reports.map(r => (
        <div key={r.id} style={{ border: "1px solid #ccc", marginBottom: "0.5rem", padding: "0.5rem" }}>
          <strong>{r.title || "Untitled Report"}</strong>
          <p>{r.description}</p>
          <small>{r.timestamp ? new Date(r.timestamp.seconds*1000).toLocaleString() : "No timestamp"}</small>
        </div>
      ))}
    </div>
  );
}

export default AdminPanel;
