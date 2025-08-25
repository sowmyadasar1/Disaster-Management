import React, { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "./ResourceGuidance.css";

// Chic Leaflet marker style (no download needed)
const shelterIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

export default function ResourceGuidance({ userLocation }) {
  const [shelters, setShelters] = useState([]);
  const [nearestShelter, setNearestShelter] = useState(null);
  const [map, setMap] = useState(null);

  // Haversine formula to compute distance between two lat/lng points (in km)
  const getDistance = (lat1, lng1, lat2, lng2) => {
    const toRad = (val) => (val * Math.PI) / 180;
    const R = 6371; // Earth's radius in km
    const dLat = toRad(lat2 - lat1);
    const dLng = toRad(lng2 - lng1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(lat1)) *
        Math.cos(toRad(lat2)) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  };

  // Fetch shelters data from Firestore
  useEffect(() => {
    const fetchShelters = async () => {
      const querySnapshot = await getDocs(collection(db, "shelters"));
      const data = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setShelters(data);

      // Find nearest shelter to userLocation
      if (userLocation) {
        let closest = null;
        let minDistance = Infinity;
        data.forEach((shelter) => {
          const dist = getDistance(
            userLocation.lat,
            userLocation.lng,
            shelter.lat,
            shelter.lng
          );
          if (dist < minDistance) {
            minDistance = dist;
            closest = shelter;
          }
        });
        setNearestShelter(closest);
      }
    };
    fetchShelters();
  }, [userLocation]);

  // Initialize map and markers when data changes
  useEffect(() => {
    if (!userLocation || shelters.length === 0) return;

    // Initialize map only once
    if (!map) {
      const leafletMap = L.map("shelter-map").setView(
        [userLocation.lat, userLocation.lng],
        7
      );
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "&copy; OpenStreetMap contributors",
      }).addTo(leafletMap);
      setMap(leafletMap);
    }

    if (map) {
      // Clear existing markers before adding new
      map.eachLayer((layer) => {
        if (layer instanceof L.Marker || layer instanceof L.CircleMarker) {
          map.removeLayer(layer);
        }
      });

      // Add marker for user location
      L.marker([userLocation.lat, userLocation.lng], { icon: shelterIcon })
        .addTo(map)
        .bindPopup("You are here")
        .openPopup();

      // Add markers for shelters
      shelters.forEach((s) => {
        L.marker([s.lat, s.lng], { icon: shelterIcon })
          .addTo(map)
          .bindPopup(`<strong>${s.name}</strong><br/>${s.address}`);
      });

      // If we have nearest shelter, fit map bounds to both
      if (nearestShelter) {
        const group = new L.featureGroup([
          L.marker([userLocation.lat, userLocation.lng]),
          L.marker([nearestShelter.lat, nearestShelter.lng]),
        ]);
        map.fitBounds(group.getBounds(), { padding: [50, 50] });
      }
    }
  }, [map, shelters, userLocation, nearestShelter]);

  return (
    <div className="resource-guidance-container">
      <div className="map-section">
        <div id="shelter-map" className="shelter-map"></div>
      </div>

      <div className="info-section">
        <h2>Emergency Shelter Guidance</h2>
        {nearestShelter ? (
          <>
            <p>
              <strong>Nearest Shelter:</strong> {nearestShelter.name}
            </p>
            <p>{nearestShelter.address}</p>
            <p>
              <strong>Contact:</strong> {nearestShelter.contact || "Not available"}
            </p>
          </>
        ) : (
          <p>No nearby shelters found. Stay in a safe location.</p>
        )}

        <h3>What To Do Until Help Arrives:</h3>
        <ul>
          <li>Stay calm and move to higher ground if in flood-prone areas.</li>
          <li>Keep emergency contacts on speed dial.</li>
          <li>Avoid damaged structures and downed power lines.</li>
          <li>Keep drinking water and basic supplies ready.</li>
        </ul>

        <button
          className="contact-button"
          onClick={() => window.location.href = "tel:108"}
        >
          Contact Authorities (108)
        </button>
      </div>
    </div>
  );
}
