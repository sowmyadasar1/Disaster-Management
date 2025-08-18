import React from "react";
import "./LiveMap.css";

function LiveMap() {
  return (
    <div className="live-map-container">
      <h2 className="live-map-title">Live Map</h2>
      <div className="live-map-wrapper">
        {/* Static map placeholder (replace with real map if needed) */}
        <div className="map-placeholder">
          <p>Map will be displayed here</p>
        </div>
      </div>
    </div>
  );
}

export default LiveMap;
