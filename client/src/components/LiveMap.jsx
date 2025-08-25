import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";
import { db } from "../firebase";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "./LiveMap.css"; // <-- Make sure this path matches your project

// Clean gradient marker using DivIcon (self-contained)
const createMarkerIcon = (color) =>
  L.divIcon({
    className: "custom-marker",
    html: `<div style="
      background: radial-gradient(circle at 30% 30%, ${color}, #333);
      width: 18px;
      height: 18px;
      display:block;
      border-radius: 50%;
      border: 1px solid white;
      box-shadow: 0 2px 6px rgba(0,0,0,0.3);
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
                icon={createMarkerIcon(
                  r.status === "pending" ? "#ef4444" : "#10b981"
                )}
              >
                <Popup>
                  <div>
                    <strong>{r.type}</strong>
                    {r.description && <div>{r.description}</div>}
                    <div>
                      {r.area}, {r.city}, {r.state}
                    </div>
                    <em>
                      Status:{" "}
                      <span
                        style={{
                          color:
                            r.status === "pending" ? "#dc2626" : "#16a34a",
                        }}
                      >
                        {r.status}
                      </span>
                    </em>
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
