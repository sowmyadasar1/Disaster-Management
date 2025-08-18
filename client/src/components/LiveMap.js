import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import axios from "axios";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase"; // make sure your firebase.js exports db

import "leaflet/dist/leaflet.css";

// Define marker colors
const pendingIcon = new L.Icon({
  iconUrl: "https://maps.gstatic.com/mapfiles/ms2/micons/red-dot.png",
  iconSize: [32, 32],
});
const resolvedIcon = new L.Icon({
  iconUrl: "https://maps.gstatic.com/mapfiles/ms2/micons/green-dot.png",
  iconSize: [32, 32],
});
const otherIcon = new L.Icon({
  iconUrl: "https://maps.gstatic.com/mapfiles/ms2/micons/blue-dot.png",
  iconSize: [32, 32],
});

export default function LiveMap() {
  const [reports, setReports] = useState([]);

  const fetchReports = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "reports"));
      const reportData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      // Convert each report's location into lat/lng using OpenCage
      const geocodedReports = await Promise.all(
        reportData.map(async (report) => {
          try {
            const response = await axios.get(
              "https://api.opencagedata.com/geocode/v1/json",
              {
                params: {
                  q: report.location, // the text location in Firebase
                  key: process.env.REACT_APP_OPENCAGE_KEY, // store your OpenCage key in .env
                },
              }
            );

            const { results } = response.data;
            if (results.length > 0) {
              const { lat, lng } = results[0].geometry;
              return { ...report, lat, lng };
            }
            return null;
          } catch (err) {
            console.error("Geocoding failed for:", report.location, err);
            return null;
          }
        })
      );

      setReports(geocodedReports.filter(Boolean));
    } catch (err) {
      console.error("Error fetching reports:", err);
    }
  };

  useEffect(() => {
    fetchReports();
    const interval = setInterval(fetchReports, 10000); // auto-refresh every 10s
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{ height: "100vh", width: "100%" }}>
      <MapContainer center={[20.5937, 78.9629]} zoom={5} style={{ height: "100%", width: "100%" }}>
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://osm.org">OpenStreetMap</a> contributors'
        />
        {reports.map((report) => (
          <Marker
            key={report.id}
            position={[report.lat, report.lng]}
            icon={
              report.status === "pending"
                ? pendingIcon
                : report.status === "resolved"
                ? resolvedIcon
                : otherIcon
            }
          >
            <Popup>
              <b>Type:</b> {report.type || "Unknown"} <br />
              <b>Status:</b> {report.status || "N/A"} <br />
              <b>Location:</b> {report.location}
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
