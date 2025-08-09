// src/components/ReportForm.jsx
import React, { useState } from "react";
import { sendReport } from "../utils/sendReport";
import { uploadImage } from "../utils/uploadImage";
import "./ReportForm.css";

/**
 * Disaster Report Form Component
 * Handles report creation with optional image upload
 */
const ReportForm = () => {
  const [formData, setFormData] = useState({
    name: "",
    location: "",
    message: "",
    imageFile: null,
  });
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState({ type: "", message: "" });

  // Handle input changes
  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: files ? files[0] : value,
    }));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setFeedback({ type: "", message: "" });

    try {
      let imageUrl = null;

      // Upload image if provided
      if (formData.imageFile) {
        const uploadResult = await uploadImage(formData.imageFile);
        if (!uploadResult.success) {
          throw new Error(uploadResult.error || "Image upload failed");
        }
        imageUrl = uploadResult.url;
      }

      // Send report to Firestore
      await sendReport({
        name: formData.name.trim(),
        location: formData.location.trim(),
        message: formData.message.trim(),
        imageUrl,
      });

      setFeedback({ type: "success", message: "✅ Report submitted successfully!" });

      // Reset form
      setFormData({ name: "", location: "", message: "", imageFile: null });
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
        name="location"
        placeholder="Location"
        value={formData.location}
        onChange={handleChange}
        required
      />

      <textarea
        name="message"
        placeholder="Describe the situation"
        rows="4"
        value={formData.message}
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
        <div
          className={`message-box ${
            feedback.type === "error" ? "error" : "success"
          }`}
        >
          {feedback.message}
        </div>
      )}
    </form>
  );
};

export default ReportForm;
