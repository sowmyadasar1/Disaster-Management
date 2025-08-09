import React, { useState } from "react";
import OTPVerification from "./OTPVerification";
import "./ReportIncident.css";

const ReportIncident = () => {
  const [formData, setFormData] = useState({
    disasterType: "",
    location: "",
    description: "",
    phone: "",
    image: null
  });

  const [otpStage, setOtpStage] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (files) {
      setFormData((prev) => ({ ...prev, [name]: files[0] }));
      setImagePreview(URL.createObjectURL(files[0]));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleNext = () => {
    const phoneRegex = /^\+91\d{10}$/; // Matches +91XXXXXXXXXX format

    if (!formData.disasterType || !formData.location || !formData.phone) {
      alert("Please fill all mandatory fields.");
      return;
    }
    if (!phoneRegex.test(formData.phone)) {
      alert("Enter a valid phone number in +91XXXXXXXXXX format.");
      return;
    }

    setOtpStage(true);
  };

  return (
    <div className="report-container">
      <h2>Report an Incident</h2>
      {!otpStage ? (
        <form className="report-form" onSubmit={(e) => e.preventDefault()}>
          <label htmlFor="disasterType">
            Disaster Type *
          </label>
          <select
            id="disasterType"
            name="disasterType"
            value={formData.disasterType}
            onChange={handleChange}
            required
          >
            <option value="">Select</option>
            <option value="Flood">Flood</option>
            <option value="Fire">Fire</option>
            <option value="Earthquake">Earthquake</option>
            <option value="Accident">Accident</option>
            <option value="Other">Other</option>
          </select>

          <label htmlFor="location">
            Location (City, Area) *
          </label>
          <input
            id="location"
            type="text"
            name="location"
            value={formData.location}
            onChange={handleChange}
            required
          />

          <label htmlFor="description">
            Description
          </label>
          <textarea
            id="description"
            name="description"
            rows="4"
            value={formData.description}
            onChange={handleChange}
          />

          <label htmlFor="image">
            Image Upload (optional)
          </label>
          <input
            id="image"
            type="file"
            name="image"
            accept="image/*"
            onChange={handleChange}
          />
          {imagePreview && (
            <div className="image-preview">
              <img src={imagePreview} alt="Preview" />
            </div>
          )}

          <label htmlFor="phone">
            Phone Number *
          </label>
          <input
            id="phone"
            type="tel"
            name="phone"
            placeholder="+91xxxxxxxxxx"
            value={formData.phone}
            onChange={handleChange}
            required
          />

          <div id="recaptcha-container" />

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
        <OTPVerification formData={formData} />
      )}
    </div>
  );
};

export default ReportIncident;
