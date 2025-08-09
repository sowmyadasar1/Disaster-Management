// src/utils/uploadImage.js

import { storage } from "../firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { v4 as uuidv4 } from "uuid";

/**
 * Uploads an image to Firebase Storage and returns its download URL.
 *
 * @param {File} file - The image file to upload.
 * @returns {Promise<{ success: boolean, url: string | null, error?: string }>}
 */
export const uploadImage = async (file) => {
  if (!file) {
    return { success: false, url: null, error: "No file provided" };
  }

  // Optional: Restrict file size (example: 5MB limit)
  const MAX_SIZE_MB = 5;
  if (file.size > MAX_SIZE_MB * 1024 * 1024) {
    return { success: false, url: null, error: `File exceeds ${MAX_SIZE_MB}MB limit` };
  }

  // Create unique storage path
  const imageRef = ref(storage, `reportImages/${uuidv4()}_${file.name}`);

  try {
    // Upload the file
    const snapshot = await uploadBytes(imageRef, file);

    // Retrieve the file's download URL
    const downloadURL = await getDownloadURL(snapshot.ref);

    return { success: true, url: downloadURL };
  } catch (error) {
    console.error("❌ Error uploading image:", error);
    return { success: false, url: null, error: error.message };
  }
};
