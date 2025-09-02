import React, { useState, useEffect, useRef } from "react";
import { getAuth, RecaptchaVerifier, signInWithPhoneNumber } from "firebase/auth";
import { app, db } from "../firebase";
import { collection, addDoc } from "firebase/firestore";
import axios from "axios";

const auth = getAuth(app);

const initialForm = {
  disasterType: "",
  fullName: "",
  location: "",  // merged area + city + state
  description: "",
  phone: "+91 ",  // always start with +91
};

export default function ReportForm({ onSuccess }) {
  const [formData, setFormData] = useState(initialForm);
  const [otpStage, setOtpStage] = useState(false);
  const [sendingOtp, setSendingOtp] = useState(false);
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  const [confirmationResult, setConfirmationResult] = useState(null);
  const [otp, setOtp] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [infoMsg, setInfoMsg] = useState("");
  const [coords, setCoords] = useState({ lat: null, lng: null });
  const [useCurrentLocation, setUseCurrentLocation] = useState(false);

  const recaptchaReady = useRef(false);

  useEffect(() => {
    return () => {
      if (window.recaptchaVerifier && typeof window.recaptchaVerifier.clear === "function") {
        window.recaptchaVerifier.clear();
      }
      window.recaptchaVerifier = null;
      recaptchaReady.current = false;
    };
  }, []);

  const handleChange = (e) => {
    setErrorMsg("");
    setInfoMsg("");
    const { name, value } = e.target;
    setFormData((p) => ({ ...p, [name]: value }));
  };

  const handleUseCurrentLocation = () => {
    const newValue = !useCurrentLocation;
    setUseCurrentLocation(newValue);

    if (!newValue) {
      // if toggled off → clear location so manual entry works again
      setFormData((p) => ({ ...p, location: "" }));
      return;
    }

    // if toggled on → fetch location
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser.");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        setCoords({ lat, lng });

        try {
          const res = await axios.get("https://api.opencagedata.com/geocode/v1/json", {
            params: { q: `${lat},${lng}`, key: process.env.REACT_APP_OPENCAGE_KEY },
          });
          if (res.data.results.length > 0) {
            const formatted = res.data.results[0].formatted;
            setFormData((p) => ({ ...p, location: formatted }));
          } else {
            setFormData((p) => ({ ...p, location: `${lat}, ${lng}` }));
          }
        } catch (err) {
          console.warn("Reverse geocoding failed:", err);
          setFormData((p) => ({ ...p, location: `${lat}, ${lng}` }));
        }
      },
      (err) => {
        console.error("Geolocation error:", err);
        alert("Unable to fetch location. Please type manually.");
      }
    );
  };

  const validateBeforeOtp = () => {
    const phoneRegex = /^\+91\s\d{10}$/;
    if (!formData.disasterType || !formData.location || !formData.phone || !formData.fullName) {
      setErrorMsg("Please fill all fields marked with *.");
      return false;
    }
    if (!phoneRegex.test(formData.phone)) {
      setErrorMsg("Enter phone in +91 XXXXXXXXXX format.");
      return false;
    }
    return true;
  };

  const setupRecaptcha = () => {
    if (recaptchaReady.current && window.recaptchaVerifier) return;

    window.recaptchaVerifier = new RecaptchaVerifier(auth, "recaptcha-container", {
      size: "invisible",
      callback: () => {},
      "expired-callback": () => {
        try { if (window.recaptchaVerifier.clear) window.recaptchaVerifier.clear(); } catch {}
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
    setErrorMsg(""); setInfoMsg("");
    if (!/^\+91\s\d{10}$/.test(formData.phone)) {
      setErrorMsg("Enter phone in +91XXXXXXXXXX format."); return;
    }
    setSendingOtp(true);
    try {
      const confirmation = await signInWithPhoneNumber(auth, formData.phone, window.recaptchaVerifier);
      setConfirmationResult(confirmation);
      setInfoMsg(`OTP sent to ${formData.phone}`);
      alert(`OTP sent to ${formData.phone}`);
    } catch (err) {
      console.error("sendOTP error:", err);
      setErrorMsg("Failed to send OTP. Check Firebase setup or use test numbers.");
      if (window.recaptchaVerifier?.clear) window.recaptchaVerifier.clear();
      window.recaptchaVerifier = null;
      recaptchaReady.current = false;
    } finally { setSendingOtp(false); }
  };

  const verifyOTPAndSubmit = async () => {
    setErrorMsg(""); setInfoMsg("");
    if (!otp || !confirmationResult) { setErrorMsg("Enter the OTP sent to your phone."); return; }
    setVerifyingOtp(true);

    try {
      await confirmationResult.confirm(otp);

      const { disasterType, fullName, location, description, phone } = formData;

      let lat = coords.lat, lng = coords.lng;
      if (!lat || !lng) {
        try {
          const response = await axios.get("https://api.opencagedata.com/geocode/v1/json", {
            params: { q: location, key: process.env.REACT_APP_OPENCAGE_KEY },
          });
          if (response.data.results.length > 0) {
            lat = response.data.results[0].geometry.lat;
            lng = response.data.results[0].geometry.lng;
          }
        } catch (err) { console.warn("Geocoding failed:", err); }
      }

      await addDoc(collection(db, "reports"), {
        type: disasterType,
        fullName,
        location,
        description,
        contact: phone,
        status: "pending",
        lat,
        lng,
        createdAt: new Date(),
      });

      alert("Report submitted successfully! It is now marked as Pending.");

      if (onSuccess) onSuccess({ lat, lng });
      resetForm();
    } catch (err) {
      console.error("verifyOTPAndSubmit error:", err);
      setErrorMsg("OTP verification or submission failed. Try again.");
      alert("OTP verification or submission failed. Try again.");
    } finally { setVerifyingOtp(false); }
  };

  const resetForm = () => {
    setFormData(initialForm);
    setCoords({ lat: null, lng: null });
    setOtpStage(false);
    setConfirmationResult(null);
    setOtp("");
    setErrorMsg(""); setInfoMsg("");
    setUseCurrentLocation(false);
    if (window.recaptchaVerifier?.clear) window.recaptchaVerifier.clear();
    window.recaptchaVerifier = null;
    recaptchaReady.current = false;
  };

  return (
    <div className="report-form-wrapper">
      <h2><strong><em>Submit a Disaster Report</em></strong></h2>
      <div id="recaptcha-container" />
      {!otpStage ? (
        <form className="report-form" onSubmit={(e) => e.preventDefault()}>
          {errorMsg && <div className="alert error">{errorMsg}</div>}
          {infoMsg && <div className="alert info">{infoMsg}</div>}

          <label>Full Name *</label>
          <input name="fullName" value={formData.fullName} onChange={handleChange} required />

          <label>Contact Info *</label>
          <input
            type="tel"
            name="phone"
            placeholder="+91 XXXXXXXXXX"
            value={formData.phone}
            onChange={(e) => {
              const digits = e.target.value.replace(/[^\d]/g, "");
              setFormData((p) => ({ 
                ...p, 
                phone: digits.startsWith("91")
              ? "+91 " + digits.slice(2, 12)
              : "+91 " + digits.slice(0, 10)
             }));
            }}
            required
          />

          <label>Disaster Type *</label>
          <select name="disasterType" value={formData.disasterType} onChange={handleChange} required>
            <option value="">Select</option>
            <option value="Flood">Flood</option>
            <option value="Fire">Fire</option>
            <option value="Earthquake">Earthquake</option>
            <option value="Accident">Accident</option>
            <option value="Cyclone">Cyclone</option>
            <option value="Other">Other</option>
          </select>

          <label>Description</label>
          <textarea name="description" rows={4} value={formData.description} onChange={handleChange} />

          <label>Location (Area, City, State) *</label>
          <input name="location" value={formData.location} onChange={handleChange} required />

          {/* Radio for current location */}
          <div style={{ display: "flex", alignItems: "center", gap: "5px" }} onClick={handleUseCurrentLocation}>
            <input
              type="radio"
              checked={useCurrentLocation}
              onChange={handleUseCurrentLocation}
            />
            <label onClick={handleUseCurrentLocation} style={{ cursor: "pointer" }}>
              Use My Current Location
            </label>
          </div>

          <button
            type="button"
            className="submit-btn"
            onClick={handleNext}
            disabled={!formData.disasterType || !formData.location || !formData.phone || !formData.fullName}
          >
            Proceed to Verify
          </button>
        </form>
      ) : (
        <div className="otp-stage">
          {errorMsg && <div className="alert error">{errorMsg}</div>}
          {infoMsg && <div className="alert info">{infoMsg}</div>}
          <h3>Verify Your Phone</h3>

          {!confirmationResult ? (
            <button onClick={sendOTP} disabled={sendingOtp}>{sendingOtp ? "Sending..." : "Send OTP"}</button>
          ) : (
            <>
              <input
                type="text"
                inputMode="numeric"
                placeholder="Enter OTP"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                maxLength={8}
              />
              <div className="otp-actions">
                <button onClick={verifyOTPAndSubmit} disabled={verifyingOtp}>
                  {verifyingOtp ? "Verifying..." : "Verify & Submit"}
                </button>
                <button onClick={() => { setConfirmationResult(null); setOtp(""); sendOTP(); }}>
                  Resend OTP
                </button>
              </div>
            </>
          )}

          <div className="back-btn">
            <button onClick={resetForm}>Back to Form</button>
          </div>
        </div>
      )}
    </div>
  );
}
