import React, { useState } from "react";
import { getAuth, RecaptchaVerifier, signInWithPhoneNumber } from "firebase/auth";
import { app } from "./firebase"; // your initialized firebase app

const auth = getAuth(app); // ✅ FIX: create auth instance

export default function TestOTP() {
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [confirmationResult, setConfirmationResult] = useState(null);

  const setupRecaptcha = () => {
    if (!window.recaptchaVerifier) {
      window.recaptchaVerifier = new RecaptchaVerifier(
        auth,
        "recaptcha-container",
        { size: "invisible" }
      );
    }
  };

  const sendOTP = async () => {
    setupRecaptcha();
    try {
      const confirmation = await signInWithPhoneNumber(
        auth,
        phone,
        window.recaptchaVerifier
      );
      setConfirmationResult(confirmation);
      alert("OTP sent!");
    } catch (error) {
      console.error("Error sending OTP", error);
    }
  };

  const verifyOTP = async () => {
    if (!confirmationResult) {
      alert("Please request OTP first");
      return;
    }
    try {
      await confirmationResult.confirm(otp);
      alert("Phone number verified!");
    } catch (error) {
      console.error("Error verifying OTP", error);
    }
  };

  return (
    <div style={{ padding: "1rem" }}>
      <input
        type="tel"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        placeholder="+91..."
      />
      <button onClick={sendOTP}>Send OTP</button>
      <div id="recaptcha-container"></div>

      <br /><br />
      <input
        type="text"
        value={otp}
        onChange={(e) => setOtp(e.target.value)}
        placeholder="Enter OTP"
      />
      <button onClick={verifyOTP}>Verify OTP</button>
    </div>
  );
}
