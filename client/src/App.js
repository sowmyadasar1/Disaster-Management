// src/App.js
import React, { useState } from "react";
import ReportForm from "./components/ReportForm";
import ReportList from "./components/ReportList";
import OtpVerification from "./OTPVerification";

function App() {
  const [isVerified, setIsVerified] = useState(false);
  const [contactNumber, setContactNumber] = useState("");
  const [loading, setLoading] = useState(false);

  const handleVerification = (number) => {
    setLoading(true);
    // Simulate a short transition delay for UX smoothness
    setTimeout(() => {
      setIsVerified(true);
      setContactNumber(number);
      setLoading(false);
    }, 500);
  };

  return (
    <main className="app-container">
      {!isVerified ? (
        <section className="otp-section">
          <h1 className="app-title">Disaster Management System</h1>
          <p className="app-subtitle">
            Please verify your contact number to submit or view disaster reports.
          </p>
          <OtpVerification onVerified={handleVerification} />
        </section>
      ) : loading ? (
        <div className="loading-screen">
          <div className="spinner"></div>
          <p>Loading reports...</p>
        </div>
      ) : (
        <section className="report-section">
          <h1 className="app-title">Report a Disaster</h1>
          <ReportForm contact={contactNumber} />
          <hr className="section-divider" />
          <ReportList />
        </section>
      )}
    </main>
  );
}

export default App;
