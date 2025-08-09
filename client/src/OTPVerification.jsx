import React, { useState } from "react";
import { RecaptchaVerifier, signInWithPhoneNumber } from "firebase/auth";
import { auth, db } from "./firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import SuccessModal from "./SuccessModal"; // Import the modal
import "./OTPVerification.css";

const OTPVerification = ({ formData, resetForm }) => {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otp, setOtp] = useState("");
  const [confirmationResult, setConfirmationResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false); // Modal state

  const setupRecaptcha = () => {
    if (!window.recaptchaVerifier) {
      window.recaptchaVerifier = new RecaptchaVerifier(auth, "recaptcha-container", {
        size: "invisible",
        callback: (response) => {
          console.log("Recaptcha solved");
        },
      });
    }
  };

  const sendOTP = async () => {
    if (!phoneNumber) return alert("Enter phone number");
    setLoading(true);
    setupRecaptcha();
    try {
      const confirmation = await signInWithPhoneNumber(auth, phoneNumber, window.recaptchaVerifier);
      setConfirmationResult(confirmation);
      alert("OTP sent to your phone");
    } catch (error) {
      console.error("Error sending OTP:", error);
      alert("Failed to send OTP. Try again.");
    }
    setLoading(false);
  };

  const verifyOTP = async () => {
    if (!otp || !confirmationResult) return alert("Enter OTP");
    setLoading(true);
    try {
      await confirmationResult.confirm(otp);

      // Save report to Firestore
      await addDoc(collection(db, "disasterReports"), {
        ...formData,
        phoneNumber,
        createdAt: serverTimestamp(),
      });

      // Show success modal instead of alert
      setShowSuccess(true);
    } catch (error) {
      console.error("Error verifying OTP:", error);
      alert("Invalid OTP. Please try again.");
    }
    setLoading(false);
  };

  return (
    <div className="otp-verification">
      <h2>Verify Your Phone</h2>
      <input
        type="text"
        placeholder="Enter phone number (+91...)"
        value={phoneNumber}
        onChange={(e) => setPhoneNumber(e.target.value)}
      />
      <button onClick={sendOTP} disabled={loading}>
        {loading ? "Sending..." : "Send OTP"}
      </button>

      {confirmationResult && (
        <>
          <input
            type="text"
            placeholder="Enter OTP"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
          />
          <button onClick={verifyOTP} disabled={loading}>
            {loading ? "Verifying..." : "Verify OTP & Submit"}
          </button>
        </>
      )}

      <div id="recaptcha-container"></div>

      {/* Success Modal */}
      <SuccessModal
        show={showSuccess}
        onClose={() => {
          setShowSuccess(false);
          resetForm(); // Reset the form data after submission
          window.location.reload();
        }}
      />
    </div>
  );
};

export default OTPVerification;
