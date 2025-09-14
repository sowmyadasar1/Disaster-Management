import React, { useState, useEffect, useRef } from "react";
import {
  getAuth,
  RecaptchaVerifier,
  signInWithPhoneNumber,
} from "firebase/auth";
import { app, db } from "../firebase";
import { collection, addDoc } from "firebase/firestore";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";

const auth = getAuth(app);

const initialForm = {
  disasterType: "",
  fullName: "",
  location: "",
  description: "",
  phone: "+91 ",
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

  // Validation flags
  const [phoneInvalid, setPhoneInvalid] = useState(false);
  const [locationInvalid, setLocationInvalid] = useState(false);
  const [fullNameInvalid, setFullNameInvalid] = useState(false);

  useEffect(() => {
    return () => {
      if (window.recaptchaVerifier?.clear) window.recaptchaVerifier.clear();
      window.recaptchaVerifier = null;
      recaptchaReady.current = false;
    };
  }, []);

  const validateLocationFormat = (value) => {
    const parts = value.split(",").map((p) => p.trim()).filter(Boolean);
    return parts.length === 3;
  };

  const handleChange = (e) => {
    setErrorMsg("");
    setInfoMsg("");
    const { name, value } = e.target;

    if (name === "phone") {
      const digits = value.replace(/[^\d]/g, "");
      const formatted = digits.startsWith("91")
        ? "+91 " + digits.slice(2, 12)
        : "+91 " + digits.slice(0, 10);
      setFormData((p) => ({ ...p, phone: formatted }));
      setPhoneInvalid(digits.length < 12);
    } else if (name === "location") {
      setFormData((p) => ({ ...p, location: value }));
      setLocationInvalid(value && !validateLocationFormat(value));
      const invalidChars = /[^a-zA-Z,\s]/.test(value);
      if (invalidChars) setErrorMsg("Location should only contain alphabets, commas, and spaces.");
    } else if (name === "fullName") {
      setFormData((p) => ({ ...p, fullName: value }));
      const invalidChars = /[^a-zA-Z\s]/.test(value);
      setFullNameInvalid(invalidChars);
    } else {
      // Description field has no validation
      setFormData((p) => ({ ...p, [name]: value }));
    }
  };

  const handleUseCurrentLocation = () => {
    const newValue = !useCurrentLocation;
    setUseCurrentLocation(newValue);

    if (!newValue) {
      setFormData((p) => ({ ...p, location: "" }));
      setLocationInvalid(false);
      return;
    }

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
          const res = await axios.get(
            "https://api.opencagedata.com/geocode/v1/json",
            {
              params: { q: `${lat},${lng}`, key: process.env.REACT_APP_OPENCAGE_KEY },
            }
          );
          if (res.data.results.length > 0) {
            const c = res.data.results[0].components;
            const area = c.suburb || c.neighbourhood || c.village || c.town || c.locality || "";
            const city = c.city || c.town || c.village || c.county || "";
            const state = c.state || "";
            const locationStr = [area, city, state].filter(Boolean).join(", ");
            setFormData((p) => ({ ...p, location: locationStr || `${lat}, ${lng}` }));
            setLocationInvalid(!validateLocationFormat(locationStr));
          } else {
            setFormData((p) => ({ ...p, location: `${lat}, ${lng}` }));
            setLocationInvalid(true);
          }
        } catch {
          setFormData((p) => ({ ...p, location: `${lat}, ${lng}` }));
          setLocationInvalid(true);
        }
      },
      () => alert("Unable to fetch location. Please type manually.")
    );
  };

  const validateBeforeOtp = () => {
    if (!formData.disasterType || !formData.location || !formData.phone || !formData.fullName) {
      setErrorMsg("Please fill all fields marked with *.");
      return false;
    }
    if (phoneInvalid || locationInvalid || fullNameInvalid) {
      setErrorMsg("Please correct invalid fields.");
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
        if (window.recaptchaVerifier?.clear) window.recaptchaVerifier.clear();
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
    setSendingOtp(true);
    try {
      const confirmation = await signInWithPhoneNumber(auth, formData.phone, window.recaptchaVerifier);
      setConfirmationResult(confirmation);
      setInfoMsg(`OTP sent to ${formData.phone}`);
    } catch {
      setErrorMsg("Failed to send OTP.");
      if (window.recaptchaVerifier?.clear) window.recaptchaVerifier.clear();
      window.recaptchaVerifier = null;
      recaptchaReady.current = false;
    } finally {
      setSendingOtp(false);
    }
  };

  const verifyOTPAndSubmit = async () => {
    setErrorMsg("");
    if (!otp || !confirmationResult) {
      setErrorMsg("Enter the OTP sent to your phone.");
      return;
    }
    setVerifyingOtp(true);
    try {
      await confirmationResult.confirm(otp);
      const { disasterType, fullName, location, description, phone } = formData;
      let { lat, lng } = coords;
      if (!lat || !lng) {
        const response = await axios.get("https://api.opencagedata.com/geocode/v1/json", {
          params: { q: location, key: process.env.REACT_APP_OPENCAGE_KEY },
        });
        if (response.data.results.length > 0) {
          lat = response.data.results[0].geometry.lat;
          lng = response.data.results[0].geometry.lng;
        }
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
      alert("Report submitted successfully!");
      if (onSuccess) onSuccess({ lat, lng });
      resetForm();
    } catch {
      setErrorMsg("OTP verification or submission failed.");
    } finally {
      setVerifyingOtp(false);
    }
  };

  const resetForm = () => {
    setFormData(initialForm);
    setCoords({ lat: null, lng: null });
    setOtpStage(false);
    setConfirmationResult(null);
    setOtp("");
    setErrorMsg("");
    setInfoMsg("");
    setUseCurrentLocation(false);
    setPhoneInvalid(false);
    setLocationInvalid(false);
    setFullNameInvalid(false);
    if (window.recaptchaVerifier?.clear) window.recaptchaVerifier.clear();
    window.recaptchaVerifier = null;
    recaptchaReady.current = false;
  };

  return (
    <div className="report-form-wrapper">
      <h2 className="mb-3"><strong><em>Submit a Disaster Report</em></strong></h2>
      <div id="recaptcha-container" />
      {!otpStage ? (
        <form className="report-form" onSubmit={(e) => e.preventDefault()}>
          {errorMsg && <div className="alert alert-danger">{errorMsg}</div>}
          {infoMsg && <div className="alert alert-info">{infoMsg}</div>}

          <div className="mb-3">
            <label className="form-label">Full Name *</label>
            <input
              className={`form-control ${fullNameInvalid ? "is-invalid" : ""}`}
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              required
            />
            {fullNameInvalid && (
              <div className="invalid-feedback">
                Full name should only contain alphabets and spaces.
              </div>
            )}
          </div>

          <div className="mb-3">
            <label className="form-label">Contact Info *</label>
            <input
              type="tel"
              name="phone"
              placeholder="+91 XXXXXXXXXX"
              className={`form-control ${phoneInvalid ? "is-invalid" : ""}`}
              value={formData.phone}
              onChange={handleChange}
              required
            />
            {phoneInvalid && (
              <div className="invalid-feedback">
                Enter a valid 10-digit number (excluding +91).
              </div>
            )}
          </div>

          <div className="mb-3">
            <label className="form-label">Disaster Type *</label>
            <select
              name="disasterType"
              className="form-select"
              value={formData.disasterType}
              onChange={handleChange}
              required
            >
              <option value="">Select</option>
              <option value="Flood">Flood</option>
              <option value="Fire">Fire</option>
              <option value="Earthquake">Earthquake</option>
              <option value="Accident">Accident</option>
              <option value="Cyclone">Cyclone</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div className="mb-3">
            <label className="form-label">Description</label>
            <textarea
              name="description"
              rows={4}
              className="form-control"
              value={formData.description}
              onChange={handleChange}
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Location (Area, City, State) *</label>
            <input
              name="location"
              className={`form-control ${locationInvalid ? "is-invalid" : ""}`}
              value={formData.location}
              onChange={handleChange}
              required
            />
            {locationInvalid && (
              <div className="invalid-feedback">
                Format should be: Area, City, State.
              </div>
            )}
          </div>

          <div className="form-check mb-3">
            <input
              type="checkbox"
              className="form-check-input"
              checked={useCurrentLocation}
              onChange={handleUseCurrentLocation}
              id="useLocation"
            />
            <label className="form-check-label" htmlFor="useLocation">
              Use My Current Location
            </label>
          </div>

          <button
            type="button"
            className="btn btn-primary"
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
          {errorMsg && <div className="alert alert-danger">{errorMsg}</div>}
          {infoMsg && <div className="alert alert-info">{infoMsg}</div>}
          <h3>Verify Your Phone</h3>

          {!confirmationResult ? (
            <button className="btn btn-primary" onClick={sendOTP} disabled={sendingOtp}>
              {sendingOtp ? "Sending..." : "Send OTP"}
            </button>
          ) : (
            <>
              <input
                type="text"
                inputMode="numeric"
                placeholder="Enter OTP"
                className="form-control my-2"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                maxLength={8}
              />
              <div className="otp-actions d-flex gap-2">
                <button className="btn btn-success" onClick={verifyOTPAndSubmit} disabled={verifyingOtp}>
                  {verifyingOtp ? "Verifying..." : "Verify & Submit"}
                </button>
                <button
                  className="btn btn-secondary"
                  onClick={() => {
                    setConfirmationResult(null);
                    setOtp("");
                    sendOTP();
                  }}
                >
                  Resend OTP
                </button>
              </div>
            </>
          )}

          <div className="mt-3">
            <button className="btn btn-outline-secondary" onClick={resetForm}>
              Back to Form
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
