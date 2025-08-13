// src/App.js
import React from "react";
import ReportIncident from "./ReportIncident"; // This is the merged form + OTP flow
import ReportList from "./components/ReportList";
//import TestOTP from "./TestOTP";


function App() {
  return (
    <main className="app-container">
      <section className="report-section">
        <h1 className="app-title">Disaster Management System</h1>
        <p className="app-subtitle">
          Report a disaster and help authorities respond quickly.
        </p>

        {/* Single component handles form + OTP */}
        <ReportIncident />

        <hr className="section-divider" />
        <ReportList />
      </section>
    </main>
  );
  //return <TestOTP />;
}

export default App;
