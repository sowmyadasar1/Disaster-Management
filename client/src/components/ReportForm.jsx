// src/components/ReportForm.jsx
import React, { useState, useEffect, useRef } from "react";
import { getAuth, RecaptchaVerifier, signInWithPhoneNumber } from "firebase/auth";
import { app } from "../firebase";
import { uploadImage } from "../utils/uploadImage";
import { sendReport } from "../utils/sendReport";

const auth = getAuth(app);

const initialForm = {
  disasterType: "",
  fullName: "",
  location: "",
  description: "",
  phone: "",
  image: null,
};

export default function ReportForm({ onSuccess }) {
  const [formData, setFormData] = useState(initialForm);
  const [imagePreview, setImagePreview] = useState(null);

  const [otpStage, setOtpStage] = useState(false);
  const [sendingOtp, setSendingOtp] = useState(false);
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  const [confirmationResult, setConfirmationResult] = useState(null);
  const [otp, setOtp] = useState("");

  const [errorMsg, setErrorMsg] = useState("");
  const [infoMsg, setInfoMsg] = useState("");

  const recaptchaReady = useRef(false);
  const previewUrlRef = useRef(null);

  // cleanup on unmount
  useEffect(() => {
    return () => {
      if (window.recaptchaVerifier) {
        try {
          if (typeof window.recaptchaVerifier.clear === "function") {
            window.recaptchaVerifier.clear();
          }
        } catch {}
        window.recaptchaVerifier = null;
      }
      recaptchaReady.current = false;

      if (previewUrlRef.current) {
        URL.revokeObjectURL(previewUrlRef.current);
        previewUrlRef.current = null;
      }
    };
  }, []);

  const handleChange = (e) => {
    setErrorMsg("");
    setInfoMsg("");
    const { name, value, files } = e.target;

    if (files && files[0]) {
      const file = files[0];
      setFormData((p) => ({ ...p, [name]: file }));

      if (previewUrlRef.current) {
        URL.revokeObjectURL(previewUrlRef.current);
        previewUrlRef.current = null;
      }
      const nextUrl = URL.createObjectURL(file);
      previewUrlRef.current = nextUrl;
      setImagePreview(nextUrl);
    } else {
      setFormData((p) => ({ ...p, [name]: value }));
    }
  };

  const validateBeforeOtp = () => {
    const phoneRegex = /^\+91\d{10}$/;
    if (!formData.disasterType || !formData.location || !formData.phone || !formData.fullName) {
      setErrorMsg("Please fill all fields marked with *.");
      return false;
    }
    if (!phoneRegex.test(formData.phone)) {
      setErrorMsg("Enter phone in +91XXXXXXXXXX format.");
      return false;
    }
    return true;
  };

  const setupRecaptcha = () => {
    if (recaptchaReady.current && window.recaptchaVerifier) return;

    // clear stale instance (defensive)
    if (window.recaptchaVerifier) {
      try {
        if (typeof window.recaptchaVerifier.clear === "function") window.recaptchaVerifier.clear();
      } catch {}
      window.recaptchaVerifier = null;
      recaptchaReady.current = false;
    }

    window.recaptchaVerifier = new RecaptchaVerifier(auth, "recaptcha-container", {
      size: "invisible",
      callback: () => {},
      "expired-callback": () => {
        try {
          if (window.recaptchaVerifier && typeof window.recaptchaVerifier.clear === "function") {
            window.recaptchaVerifier.clear();
          }
        } catch {}
        window.recaptchaVerifier = null;
        recaptchaReady.current = false;
      },
    });

    recaptchaReady.current = true;
  };

  const handleNext = () => {
    if (!validateBeforeOtp()) return;
    setupRecaptcha();
    setOtpStage(true);
  };

  const sendOTP = async () => {
    setErrorMsg("");
    setInfoMsg("");

    if (!/^\+91\d{10}$/.test(formData.phone)) {
      setErrorMsg("Enter phone in +91XXXXXXXXXX format.");
      return;
    }

    setSendingOtp(true);
    try {
      if (!window.recaptchaVerifier) throw new Error("reCAPTCHA not ready");
      const confirmation = await signInWithPhoneNumber(auth, formData.phone, window.recaptchaVerifier);
      setConfirmationResult(confirmation);
      setInfoMsg(`OTP sent to ${formData.phone}`);
      alert(`OTP sent to ${formData.phone}`); // user-visible alert
    } catch (err) {
      console.error("sendOTP error:", err);
      setErrorMsg("Failed to send OTP. Check Firebase setup or use test numbers.");
      alert("Failed to send OTP. Check Firebase setup or use test numbers.");
      try {
        if (window.recaptchaVerifier && typeof window.recaptchaVerifier.clear === "function") {
          window.recaptchaVerifier.clear();
        }
      } catch {}
      window.recaptchaVerifier = null;
      recaptchaReady.current = false;
    } finally {
      setSendingOtp(false);
    }
  };

  const verifyOTPAndSubmit = async () => {
    setErrorMsg("");
    setInfoMsg("");

    if (!otp || !confirmationResult) {
      setErrorMsg("Enter the OTP sent to your phone.");
      return;
    }

    setVerifyingOtp(true);
    try {
      // verify OTP with Firebase confirmation result
      await confirmationResult.confirm(otp);

      // Map fields to sendReport schema
      const type = formData.disasterType?.trim();
      const location = formData.location?.trim();

      // derive city from "Area, City" if provided
      let city = "Unknown";
      if (location && location.includes(",")) {
        const last = location.split(",").pop();
        if (last && last.trim()) city = last.trim();
      }

      const contact = formData.phone?.trim();

      // upload image (optional)
      let imageUrl = null;
      if (formData.image) {
        const uploadResult = await uploadImage(formData.image);
        if (uploadResult.success) {
          imageUrl = uploadResult.url;
        } else {
          console.warn("Image upload failed:", uploadResult.error);
          // do not block submission if image upload fails
        }
      }

      // call sendReport util
      const result = await sendReport({ type, location, city, contact, imageUrl });
      if (result.success) {
        alert("Report submitted successfully! It is now marked as Pending.");
        if (onSuccess) onSuccess();
        resetForm();
      } else {
        alert(`Failed to submit report: ${result.error || "unknown error"}`);
      }
    } catch (err) {
      console.error("verifyOTPAndSubmit error:", err);
      setErrorMsg("OTP verification or submission failed. Try again.");
      alert("OTP verification or submission failed. Try again.");
    } finally {
      setVerifyingOtp(false);
    }
  };

  const resetForm = () => {
    setFormData(initialForm);
    setOtpStage(false);
    setConfirmationResult(null);
    setOtp("");
    setErrorMsg("");
    setInfoMsg("");

    if (previewUrlRef.current) {
      URL.revokeObjectURL(previewUrlRef.current);
      previewUrlRef.current = null;
    }
    setImagePreview(null);

    setSendingOtp(false);
    setVerifyingOtp(false);

    if (window.recaptchaVerifier) {
      try {
        if (typeof window.recaptchaVerifier.clear === "function") window.recaptchaVerifier.clear();
      } catch {}
      window.recaptchaVerifier = null;
    }
    recaptchaReady.current = false;
  };

  return (
    <div className="report-form-wrapper">
      <h2><strong><em>Submit a Disaster Report</em></strong></h2>

      {/* keep recaptcha container mounted */}
      <div id="recaptcha-container" />

      {!otpStage ? (
        <form className="report-form" onSubmit={(e) => e.preventDefault()}>
          {errorMsg && <div className="alert error">{errorMsg}</div>}
          {infoMsg && <div className="alert info">{infoMsg}</div>}

          <label htmlFor="fullName">Full Name *</label>
          <input id="fullName" name="fullName" value={formData.fullName} onChange={handleChange} required />

          <label htmlFor="phone">Contact Info (Phone) *</label>
          <input
            id="phone"
            type="tel"
            name="phone"
            placeholder="+91XXXXXXXXXX"
            value={formData.phone}
            onChange={(e) => {
              const v = e.target.value.replace(/[^\d+]/g, "");
              setFormData((p) => ({ ...p, phone: v.startsWith("+") ? v : v.replace(/^\+*/, "+") }));
            }}
            required
          />

          <label htmlFor="disasterType">Disaster Type *</label>
          <select id="disasterType" name="disasterType" value={formData.disasterType} onChange={handleChange} required>
            <option value="">Select</option>
            <option value="Flood">Flood</option>
            <option value="Fire">Fire</option>
            <option value="Earthquake">Earthquake</option>
            <option value="Accident">Accident</option>
            <option value="Cyclone">Cyclone</option>
            <option value="Other">Other</option>
          </select>

          <label htmlFor="description">Description</label>
          <textarea id="description" name="description" rows="4" value={formData.description} onChange={handleChange} />

          <label htmlFor="location">Location (Area, City) *</label>
          <input id="location" name="location" value={formData.location} onChange={handleChange} required />

          <label htmlFor="image">Upload Image (optional)</label>
          <input id="image" type="file" name="image" accept="image/*" onChange={handleChange} />
          {imagePreview && (
            <div className="preview">
              <img src={imagePreview} alt="Preview" style={{ maxWidth: "100%", marginTop: 10, borderRadius: 8 }} />
            </div>
          )}

          <button
            type="button"
            className="submit-btn"
            onClick={handleNext}
            disabled={
              !formData.disasterType ||
              !formData.location ||
              !formData.phone ||
              !formData.fullName
            }
          >
            Proceed to Verify
          </button>
        </form>
      ) : (
        <div className="otp-stage">
          {errorMsg && <div className="alert error">{errorMsg}</div>}
          {infoMsg && <div className="alert info">{infoMsg}</div>}

          <h3>Verify Your Phone</h3>
          <p>OTP will be sent to: <strong>{formData.phone}</strong></p>

          {!confirmationResult ? (
            <button onClick={sendOTP} disabled={sendingOtp}>
              {sendingOtp ? "Sending..." : "Send OTP"}
            </button>
          ) : (
            <>
              <input
                type="text"
                inputMode="numeric"
                placeholder="Enter OTP"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                maxLength={8}
                aria-label="Enter one-time password"
              />
              <div className="otp-actions">
                <button onClick={verifyOTPAndSubmit} disabled={verifyingOtp}>
                  {verifyingOtp ? "Verifying..." : "Verify & Submit"}
                </button>
                <button
                  onClick={() => {
                    setConfirmationResult(null);
                    setOtp("");
                    sendOTP(); // resend
                  }}
                >
                  Resend OTP
                </button>
              </div>
            </>
          )}

          <div className="back-btn">
            <button
              onClick={() => {
                setOtpStage(false);
                setConfirmationResult(null);
                setOtp("");
                setErrorMsg("");
                setInfoMsg("");
              }}
            >
              Back to Form
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
