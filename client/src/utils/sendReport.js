import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase";

/**
 * Sends a disaster report to Firestore.
 *
 * @param {Object} reportData
 * @param {string} reportData.type - Disaster type (e.g., Flood, Earthquake)
 * @param {string} reportData.location - Specific area/location
 * @param {string} reportData.city - City name
 * @param {string} reportData.contact - Optional contact information
 * @param {string|null} [reportData.imageUrl] - Optional uploaded image URL
 * @returns {Promise<{ success: boolean, id?: string, error?: string }>}
 */
export const sendReport = async ({ type, location, city, contact, imageUrl }) => {
  // Basic validation
  if (!type || !location || !city) {
    return { success: false, error: "Missing required fields" };
  }

  try {
    // Add a new report to Firestore with default "Pending" status
    const docRef = await addDoc(collection(db, "reports"), {
      type,
      location,
      city,
      contact: contact || null,
      imageUrl: imageUrl || null,
      status: "Pending",           // default workflow status
      timestamp: serverTimestamp() // consistent server time
    });

    return { success: true, id: docRef.id };
  } catch (error) {
    console.error("Error adding report:", error);
    return { success: false, error: error.message };
  }
};
