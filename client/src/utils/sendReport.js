// sendReport.js
import { db } from "../firebase";
import { collection, addDoc, Timestamp } from "firebase/firestore";

/**
 * Uploads a disaster report to Firestore
 * @param {Object} data - { name, location, incidentType, description, contact, imageUrl }
 */
export const sendReport = async ({ 
  name, 
  location, 
  incidentType, 
  description, 
  contact, 
  imageUrl 
}) => {
  try {
    const docRef = await addDoc(collection(db, "disasterReports"), {
      name,
      location,
      incidentType: incidentType || "",
      description: description || "",
      contact: contact || "",
      imageUrl: imageUrl || null,
      verified: false,
      createdAt: Timestamp.now(),
    });
    return docRef.id;
  } catch (error) {
    console.error("❌ Error uploading report:", error);
    throw new Error("Failed to submit report");
  }
};
