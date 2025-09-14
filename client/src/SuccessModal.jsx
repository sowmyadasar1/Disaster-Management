import React from "react";
import ResourceGuidance from "./pages/ResourceGuidance";
import "./App.css";

export default function SuccessModal({ show, onClose, userLocation }) {
  if (!show) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-container">
        <div className="modal-header">
          <h2>Incident Reported Successfully</h2>
          <button className="modal-close" onClick={onClose}>
            ✖
          </button>
        </div>

        <p className="modal-message">
          Your report has been submitted. Here are nearby shelters and guidance while you wait for help.
        </p>

        <div className="modal-guidance-wrapper">
          <ResourceGuidance userLocation={userLocation} />
        </div>
      </div>
    </div>
  );
}
