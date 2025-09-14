import React, { useEffect, useState } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
  useMap,
} from "react-leaflet";
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";
import { db } from "../firebase";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "./LiveMap.css";

// Marker creator with custom color
const createMarkerIcon = (color) =>
  L.divIcon({
    className: "custom-marker",
    html: `<div style="
      background:${color};
      width:18px;
      height:18px;
      border-radius:50%;
      border:2px solid white;
      box-shadow:0 0 6px rgba(0,0,0,0.25);
    "></div>`,
    iconSize: [18, 18],
    iconAnchor: [9, 9],
    popupAnchor: [0, -9],
  });

function RecenterMap({ routeCoords, userLocation, shelter }) {
  const map = useMap();
  useEffect(() => {
    if (routeCoords.length > 0 && userLocation && shelter) {
      const bounds = L.latLngBounds([
        [userLocation[0], userLocation[1]],
        ...routeCoords,
        [parseFloat(shelter.lat), parseFloat(shelter.lng)],
      ]);
      map.fitBounds(bounds, { padding: [80, 80] });
    }
  }, [routeCoords, userLocation, shelter, map]);
  return null;
}

function ResetMap({ showLiveMap }) {
  const map = useMap();
  useEffect(() => {
    if (showLiveMap) {
      map.setView([20.5937, 78.9629], 5);
    }
  }, [showLiveMap, map]);
  return null;
}

export default function LiveMap() {
  const [reports, setReports] = useState([]);
  const [shelters, setShelters] = useState([]);
  const [userLocation, setUserLocation] = useState(null);
  const [showShelters, setShowShelters] = useState(false);
  const [nearestShelter, setNearestShelter] = useState(null);
  const [routeCoords, setRouteCoords] = useState([]);

  useEffect(() => {
    const q = query(collection(db, "reports"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setReports(data);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (showShelters) {
      const q = collection(db, "shelters");
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          lat: parseFloat(doc.data().lat),
          lng: parseFloat(doc.data().lng),
        }));
        setShelters(data);
      });
      return () => unsubscribe();
    }
  }, [showShelters]);

  const getStatusColor = (status) => {
    switch (status) {
      case "pending": return "#e63946";
      case "in-progress": return "#ffb703";
      case "resolved": return "#20cb7b";
      default: return "#6c757d";
    }
  };

  const findNearestShelter = (lat, lng, sheltersList) => {
    if (!sheltersList.length) return null;
    let nearest = null;
    let minDist = Infinity;
    sheltersList.forEach((s) => {
      if (s.lat && s.lng) {
        const d = Math.sqrt(Math.pow(s.lat - lat, 2) + Math.pow(s.lng - lng, 2));
        if (d < minDist) {
          minDist = d;
          nearest = s;
        }
      }
    });
    return nearest;
  };

  const fetchRoute = async (start, end) => {
    try {
      const url = `https://router.project-osrm.org/route/v1/driving/${start[1]},${start[0]};${end[1]},${end[0]}?geometries=geojson`;
      const res = await fetch(url);
      const data = await res.json();
      if (data.routes?.length > 0) {
        const coords = data.routes[0].geometry.coordinates.map((c) => [c[1], c[0]]);
        setRouteCoords(coords);
      }
    } catch (err) {
      console.error("Error fetching route:", err);
      setRouteCoords([]);
    }
  };

  const handleToggleMap = () => {
    if (!showShelters) {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            setUserLocation([pos.coords.latitude, pos.coords.longitude]);
            setShowShelters(true);
          },
          (err) => {
            alert("Unable to fetch location. Please enable GPS.");
            console.error(err);
          }
        );
      } else alert("Geolocation not supported");
    } else {
      setShowShelters(false);
      setNearestShelter(null);
      setRouteCoords([]);
    }
  };

  useEffect(() => {
    if (userLocation && shelters.length > 0) {
      const nearest = findNearestShelter(userLocation[0], userLocation[1], shelters);
      setNearestShelter(nearest);
      if (nearest) fetchRoute(userLocation, [nearest.lat, nearest.lng]);
    }
  }, [userLocation, shelters]);

  return (
    <div className="live-map-container">
      <div className="live-map-header d-flex justify-content-between align-items-center mb-3">
        <h2 className="live-map-title">
          {showShelters ? "Find Nearest Locations" : "Live Incident Map"}
        </h2>
        <div>
          {!showShelters ? (
            <button
              type="button"
              className="btn btn-outline-primary"
              onClick={handleToggleMap}
            >
              Find Nearest Locations
            </button>
          ) : (
            <button
              type="button"
              className="btn btn-outline-secondary"
              onClick={handleToggleMap}
            >
              Back to Live Map
            </button>
          )}
        </div>
      </div>

      <div className="live-map-wrapper">
        <MapContainer
          center={[20.5937, 78.9629]}
          zoom={5}
          scrollWheelZoom
          className="leaflet-container"
        >
          <TileLayer
            attribution="&copy; OpenStreetMap contributors"
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {!showShelters && <ResetMap showLiveMap={!showShelters} />}

          {!showShelters &&
            reports.map(
              (r) =>
                r.lat &&
                r.lng && (
                  <Marker
                    key={r.id}
                    position={[r.lat, r.lng]}
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
                )
            )}

          {showShelters && (
            <>
              {userLocation && (
                <Marker position={userLocation} icon={createMarkerIcon("black")}>
                  <Popup><strong>Your Location</strong></Popup>
                </Marker>
              )}
              {nearestShelter && (
                <Marker
                  position={[nearestShelter.lat, nearestShelter.lng]}
                  icon={createMarkerIcon("blue")}
                >
                  <Popup>
                    <div>
                      <strong>{nearestShelter.name}</strong>
                      {nearestShelter.address && <div>{nearestShelter.address}</div>}
                      <div>{nearestShelter.city}, {nearestShelter.state}</div>
                      <div>Capacity: {nearestShelter.capacity}</div>
                      <div>Contact: {nearestShelter.contact}</div>
                      <div>Type: {nearestShelter.type}</div>
                    </div>
                  </Popup>
                </Marker>
              )}
              {routeCoords.length > 0 && (
                <>
                  <Polyline positions={routeCoords} color="blue" weight={5} opacity={0.8} />
                  <RecenterMap
                    routeCoords={routeCoords}
                    userLocation={userLocation}
                    shelter={nearestShelter}
                  />
                </>
              )}
            </>
          )}
        </MapContainer>
      </div>
    </div>
  );
}
