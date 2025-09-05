import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";
import { db } from "../firebase";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "./LiveMap.css";

// Simple solid color markers
const createMarkerIcon = (color) =>
  L.divIcon({
    className: "custom-marker",
    html: `<div style="
      background:${color};
      width:18px;
      height:18px;
      border-radius:50%;
      border:2px solid white;
      box-shadow:0 0 6px rgba(0,0,0,0.3);
    "></div>`,
    iconSize: [18, 18],
    iconAnchor: [9, 9],
    popupAnchor: [0, -9],
  });

export default function LiveMap() {
  const [reports, setReports] = useState([]);

  useEffect(() => {
    const q = query(collection(db, "reports"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setReports(data);
    });
    return () => unsubscribe();
  }, []);

  // Get color based on status
  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "red";
      case "in-progress":
        return "yellow";
      case "resolved":
        return "green";
      default:
        return "grey";
    }
  };

  return (
    <div className="live-map-container">
      <h2 className="live-map-title">Live Incident Map</h2>
      <div className="live-map-wrapper">
        <MapContainer
          center={[20.5937, 78.9629]}
          zoom={5}
          scrollWheelZoom
          className="leaflet-container"
        >
          <TileLayer
            attribution='&copy; OpenStreetMap contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {reports.map((r) =>
            r.lat && r.lng ? (
              <Marker
                key={r.id}
                position={[parseFloat(r.lat), parseFloat(r.lng)]}
                icon={createMarkerIcon(getStatusColor(r.status))}
              >
                <Popup>
                  <div>
                    <strong>{r.type}</strong>
                    <br />
                    <em>Status: {r.status}</em>
                  </div>
                </Popup>
              </Marker>
            ) : null
          )}
        </MapContainer>
      </div>
    </div>
  );
}
