import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase";

/**
 * Convert a location (address + city) into latitude/longitude using Nominatim API.
 *
 * @param {string} address - The full address to geocode.
 * @returns {Promise<{ lat: number, lng: number }|null>}
 */
const geocodeLocation = async (address) => {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}`
    );
    const data = await res.json();
    if (data && data.length > 0) {
      return {
        lat: parseFloat(data[0].lat),
        lng: parseFloat(data[0].lon),
      };
    }
    return null;
  } catch (error) {
    console.error("Error geocoding location:", error);
    return null;
  }
};

/**
 * Sends a disaster report to Firestore.
 *
 * @param {Object} reportData
 * @param {string} reportData.type - Disaster type (e.g., Flood, Earthquake)
 * @param {string} reportData.fullName - Full Name
 * @param {string} reportData.description - Disaster description
 * @param {string} reportData.location - Specific area/location
 * @param {string} reportData.city - City name
 * @param {string} reportData.contact - Optional contact information
 * @param {string|null} [reportData.imageUrl] - Optional uploaded image URL
 * @returns {Promise<{ success: boolean, id?: string, error?: string }>}
 */
export const sendReport = async ({
  type,
  fullName,
  description,
  location,
  city,
  contact,
  imageUrl
}) => {
  if (!type || !location || !city) {
    return { success: false, error: "Missing required fields" };
  }

  try {
    // Get latitude/longitude automatically from address
    const coords = await geocodeLocation(`${location}, ${city}`);

    const docRef = await addDoc(collection(db, "reports"), {
      type,
      fullName,
      description,
      location,
      city,
      contact: contact || null,
      imageUrl: imageUrl || null,
      lat: coords ? coords.lat : null, // store geocode if available
      lng: coords ? coords.lng : null,
      status: "Pending",
      timestamp: serverTimestamp(),
    });

    return { success: true, id: docRef.id };
  } catch (error) {
    console.error("Error adding report:", error);
    return { success: false, error: error.message };
  }
};
