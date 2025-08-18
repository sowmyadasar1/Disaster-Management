import React, { useState } from "react";
import ReportForm from "./components/ReportForm";
import ReportList from "./components/ReportList";
import SuccessModal from "./SuccessModal";

export default function ReportIncident() {
  const [showSuccess, setShowSuccess] = useState(false);

  return (
    <div className="report-incident">
      <ReportForm onSuccess={() => setShowSuccess(true)} />
      <ReportList />
      <SuccessModal show={showSuccess} onClose={() => setShowSuccess(false)} />
    </div>
  );
}
