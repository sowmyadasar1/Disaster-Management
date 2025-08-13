import React from "react";
import "./SuccessModal.css";

const SuccessModal = ({ show, onClose }) => {
  if (!show) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-container">
        <h2>Incident Reported!</h2>
        <p>Your report has been successfully submitted. We’ll review it soon.</p>
        <button onClick={onClose} className="close-btn">OK</button>
      </div>
    </div>
  );
};

export default SuccessModal;