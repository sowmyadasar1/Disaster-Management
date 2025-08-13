// src/ReportIncident.jsx
import React, { useState, useEffect, useRef } from "react";
import { getAuth, RecaptchaVerifier, signInWithPhoneNumber } from "firebase/auth";
import { app } from "./firebase";
import { db, storage } from "./firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { ref as storageRef, uploadBytes, getDownloadURL } from "firebase/storage";
import "./ReportIncident.css";
import SuccessModal from "./SuccessModal";

// ✅ Create a single auth instance (this fixes the 'appVerificationDisabledForTesting' crash)
const auth = getAuth(app);

/**
 * ReportIncident
 * - Integrated OTP (phone) verification using Firebase v9 modular SDK
 * - Uses free reCAPTCHA v2 (invisible) via RecaptchaVerifier(auth, containerId, options)
 * - Ensures setupRecaptcha() is called before sending OTP
 * - Uploads optional image to Firebase Storage and saves report to Firestore
 *
 * Important: enable Phone sign-in in Firebase Console (Auth → Sign-in method).
 * For local testing, add Firebase test phone numbers in the console to avoid real SMS.
 */

const initialForm = {
  disasterType: "",
  location: "",
  description: "",
  phone: "",
  image: null,
};

export default function ReportIncident() {
  const [formData, setFormData] = useState(initialForm);
  const [imagePreview, setImagePreview] = useState(null);

  const [otpStage, setOtpStage] = useState(false);
  const [sendingOtp, setSendingOtp] = useState(false);
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  const [confirmationResult, setConfirmationResult] = useState(null);
  const [otp, setOtp] = useState("");
  const recaptchaReady = useRef(false);

  const [showSuccess, setShowSuccess] = useState(false);

  // Cleanup on unmount to avoid stale verifier issues
  useEffect(() => {
    return () => {
      if (window.recaptchaVerifier) {
        try {
          if (typeof window.recaptchaVerifier.clear === "function") {
            window.recaptchaVerifier.clear();
          }
        } catch (e) {
          /* ignore */
        }
        window.recaptchaVerifier = null;
      }
      recaptchaReady.current = false;
    };
  }, []);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (files && files[0]) {
      setFormData((p) => ({ ...p, [name]: files[0] }));
      setImagePreview(URL.createObjectURL(files[0]));
    } else {
      setFormData((p) => ({ ...p, [name]: value }));
    }
  };

  const validateBeforeOtp = () => {
    const phoneRegex = /^\+91\d{10}$/;
    if (!formData.disasterType || !formData.location || !formData.phone) {
      alert("Please fill all mandatory fields.");
      return false;
    }
    if (!phoneRegex.test(formData.phone)) {
      alert("Enter phone in +91XXXXXXXXXX format.");
      return false;
    }
    return true;
  };

  /**
   * setupRecaptcha
   * - Creates invisible reCAPTCHA (free v2) and attaches it to window.recaptchaVerifier
   * - Correct v9 syntax: new RecaptchaVerifier(auth, "recaptcha-container", options)
   */
  const setupRecaptcha = () => {
    if (recaptchaReady.current && window.recaptchaVerifier) return;

    // Defensive cleanup if some stale instance exists
    if (window.recaptchaVerifier) {
      try {
        if (typeof window.recaptchaVerifier.clear === "function") window.recaptchaVerifier.clear();
      } catch (e) {}
      window.recaptchaVerifier = null;
      recaptchaReady.current = false;
    }

    window.recaptchaVerifier = new RecaptchaVerifier(
      auth,
      "recaptcha-container",
      {
        size: "invisible",
        callback: (token) => {
          // reCAPTCHA solved — token available (signInWithPhoneNumber will use it)
          console.debug("reCAPTCHA solved.", token);
        },
        "expired-callback": () => {
          // verifier expired (user must re-solve)
          try {
            if (window.recaptchaVerifier && typeof window.recaptchaVerifier.clear === "function") window.recaptchaVerifier.clear();
          } catch (e) {}
          window.recaptchaVerifier = null;
          recaptchaReady.current = false;
        },
      }
    );

    recaptchaReady.current = true;
  };

  const handleNext = () => {
    if (!validateBeforeOtp()) return;
    setupRecaptcha(); // ensure verifier ready
    setOtpStage(true);
  };

  const sendOTP = async () => {
    if (!/^\+91\d{10}$/.test(formData.phone)) {
      alert("Enter phone in +91XXXXXXXXXX format.");
      return;
    }

    setSendingOtp(true);
    try {
      // Ensure verifier is ready before signInWithPhoneNumber
      if (!window.recaptchaVerifier) throw new Error("reCAPTCHA not ready");

      const appVerifier = window.recaptchaVerifier;
      const confirmation = await signInWithPhoneNumber(auth, formData.phone, appVerifier);

      setConfirmationResult(confirmation);
      alert(`OTP sent to ${formData.phone}`);
    } catch (err) {
      console.error("sendOTP error:", err);
      alert(
        "Failed to send OTP. Check console for details. " +
          "If you're developing locally, add a Firebase test phone number or ensure the Firebase project config is correct."
      );

      // Reset recaptcha so user can retry
      try {
        if (window.recaptchaVerifier && typeof window.recaptchaVerifier.clear === "function") window.recaptchaVerifier.clear();
      } catch (e) {}
      window.recaptchaVerifier = null;
      recaptchaReady.current = false;
    } finally {
      setSendingOtp(false);
    }
  };

  const verifyOTPAndSubmit = async () => {
    if (!otp || !confirmationResult) {
      alert("Enter the OTP sent to your phone.");
      return;
    }

    setVerifyingOtp(true);
    try {
      // confirm OTP
      await confirmationResult.confirm(otp);

      // If there's an image, upload it to storage and get URL
      let imageURL = null;
      if (formData.image) {
        const fileRef = storageRef(storage, `reports/${Date.now()}_${formData.image.name}`);
        const snap = await uploadBytes(fileRef, formData.image);
        imageURL = await getDownloadURL(snap.ref);
      }

      // Save report in Firestore
      await addDoc(collection(db, "disasterReports"), {
        disasterType: formData.disasterType,
        location: formData.location,
        description: formData.description || "",
        phone: formData.phone,
        imageURL,
        createdAt: serverTimestamp(),
      });

      setShowSuccess(true);
      resetForm();
    } catch (err) {
      console.error("verifyOTPAndSubmit error:", err);
      alert("OTP verification or submission failed. Try again.");
    } finally {
      setVerifyingOtp(false);
    }
  };

  const resetForm = () => {
    setFormData(initialForm);
    setImagePreview(null);
    setOtpStage(false);
    setConfirmationResult(null);
    setOtp("");
    setSendingOtp(false);
    setVerifyingOtp(false);

    if (window.recaptchaVerifier) {
      try {
        if (typeof window.recaptchaVerifier.clear === "function") window.recaptchaVerifier.clear();
      } catch (e) {}
      window.recaptchaVerifier = null;
    }
    recaptchaReady.current = false;
  };

  return (
    <div className="report-container">
      <h2>Report an Incident</h2>

      {/* Keep ONE recaptcha container always mounted so the widget isn't destroyed on UI toggles */}
      <div id="recaptcha-container" />

      {!otpStage ? (
        <form className="report-form" onSubmit={(e) => e.preventDefault()}>
          <label htmlFor="disasterType">Disaster Type *</label>
          <select id="disasterType" name="disasterType" value={formData.disasterType} onChange={handleChange} required>
            <option value="">Select</option>
            <option value="Flood">Flood</option>
            <option value="Fire">Fire</option>
            <option value="Earthquake">Earthquake</option>
            <option value="Accident">Accident</option>
            <option value="Other">Other</option>
          </select>

          <label htmlFor="location">Location (City, Area) *</label>
          <input id="location" type="text" name="location" value={formData.location} onChange={handleChange} required />

          <label htmlFor="description">Description</label>
          <textarea id="description" name="description" rows="4" value={formData.description} onChange={handleChange} />

          <label htmlFor="image">Image Upload (optional)</label>
          <input id="image" type="file" name="image" accept="image/*" onChange={handleChange} />
          {imagePreview && (
            <div className="image-preview">
              <img src={imagePreview} alt="Preview" />
            </div>
          )}

          <label htmlFor="phone">Phone Number *</label>
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

          <button
            type="button"
            className="submit-btn"
            onClick={handleNext}
            disabled={!formData.disasterType || !formData.location || !formData.phone}
          >
            Proceed to Verify
          </button>
        </form>
      ) : (
        <div className="otp-verification">
          <h3>Verify Your Phone</h3>
          <p>
            OTP will be sent to: <strong>{formData.phone}</strong>
          </p>

          {!confirmationResult ? (
            <button onClick={sendOTP} disabled={sendingOtp}>
              {sendingOtp ? "Sending..." : "Send OTP"}
            </button>
          ) : (
            <>
              <input
                type="text"
                placeholder="Enter OTP"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
              />
              <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                <button onClick={verifyOTPAndSubmit} disabled={verifyingOtp}>
                  {verifyingOtp ? "Verifying..." : "Verify OTP & Submit"}
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

          <div style={{ marginTop: 12 }}>
            <button
              onClick={() => {
                setOtpStage(false);
                setConfirmationResult(null);
                setOtp("");
              }}
            >
              Back to Form
            </button>
          </div>
        </div>
      )}

      <SuccessModal show={showSuccess} onClose={() => setShowSuccess(false)} />
    </div>
  );
}
