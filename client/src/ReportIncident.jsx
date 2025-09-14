import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import ReportForm from "./components/ReportForm";
import ReportList from "./components/ReportList";
import SuccessModal from "./SuccessModal";

export default function ReportIncident() {
  const [showSuccess, setShowSuccess] = useState(false);
  const navigate = useNavigate();

  const handleCloseModal = () => {
    setShowSuccess(false);
    // Navigate to Resource Guidance page
    navigate("/resource-guidance");
  };

  return (
    <div className="report-incident">
      <ReportForm onSuccess={() => setShowSuccess(true)} />
      <ReportList />
      <SuccessModal show={showSuccess} onClose={handleCloseModal} />
    </div>
  );
}
