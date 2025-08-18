import React from "react";

const SuccessModal = ({ show, onClose }) => {
  if (!show) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-container">
        <h2>Incident Reported!</h2>
        <p>Your report has been successfully submitted and is now marked as Pending.</p>
        <button onClick={onClose} className="close-btn">
          OK
        </button>
      </div>
    </div>
  );
};

export default SuccessModal;
