import React, { useState } from "react";
import { sendReport } from "../utils/sendReport";
import { uploadImage } from "../utils/uploadImage";
import "./ReportForm.css";

const ReportForm = ({ formData: initialData }) => {
  const [formData, setFormData] = useState({
    name: initialData?.name || "",
    contact: initialData?.phone || "",
    location: initialData?.location || "",
    description: initialData?.description || "",
    incidentType: initialData?.disasterType || "",
    imageFile: initialData?.image || null,
    verified: true // OTP passed
  });

  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState({ type: "", message: "" });

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: files ? files[0] : value,
    }));
  };

  const resetForm = () => {
    setFormData({
      name: "",
      contact: "",
      location: "",
      description: "",
      incidentType: "",
      imageFile: null,
      verified: true
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setFeedback({ type: "", message: "" });

    try {
      let imageUrl = null;
      if (formData.imageFile) {
        const uploadResult = await uploadImage(formData.imageFile);
        if (!uploadResult.success) {
          throw new Error(uploadResult.error || "Image upload failed");
        }
        imageUrl = uploadResult.url;
      }

      await sendReport({
        name: formData.name.trim(),
        contact: formData.contact,
        location: formData.location.trim(),
        description: formData.description.trim(),
        incidentType: formData.incidentType,
        imageUrl,
        verified: formData.verified,
        createdAt: new Date()
      });

      setFeedback({ type: "success", message: "✅ Report submitted successfully!" });
      resetForm();
    } catch (error) {
      console.error("❌ Report submission error:", error);
      setFeedback({
        type: "error",
        message: error.message || "Something went wrong while submitting the report.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="report-form" onSubmit={handleSubmit}>
      <h2>Submit a Disaster Report</h2>

      <input
        type="text"
        name="name"
        placeholder="Your Name"
        value={formData.name}
        onChange={handleChange}
        required
      />

      <input
        type="text"
        name="contact"
        placeholder="Contact Number"
        value={formData.contact}
        disabled
      />

      <select
        name="incidentType"
        value={formData.incidentType}
        onChange={handleChange}
        required
      >
        <option value="">Select Disaster Type</option>
        <option value="Flood">Flood</option>
        <option value="Fire">Fire</option>
        <option value="Earthquake">Earthquake</option>
        <option value="Accident">Accident</option>
        <option value="Other">Other</option>
      </select>

      <input
        type="text"
        name="location"
        placeholder="Location"
        value={formData.location}
        onChange={handleChange}
        required
      />

      <textarea
        name="description"
        placeholder="Describe the situation"
        rows="4"
        value={formData.description}
        onChange={handleChange}
        required
      />

      <input
        type="file"
        name="imageFile"
        accept="image/*"
        onChange={handleChange}
      />

      <button type="submit" disabled={loading}>
        {loading ? "Submitting..." : "Submit Report"}
      </button>

      {feedback.message && (
        <div className={`message-box ${feedback.type === "error" ? "error" : "success"}`}>
          {feedback.message}
        </div>
      )}
    </form>
  );
};

export default ReportForm;
