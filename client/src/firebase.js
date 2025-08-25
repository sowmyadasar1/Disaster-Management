// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Validate environment variables
if (
  !process.env.REACT_APP_FIREBASE_API_KEY ||
  !process.env.REACT_APP_FIREBASE_AUTH_DOMAIN ||
  !process.env.REACT_APP_FIREBASE_PROJECT_ID
) {
  console.warn("⚠️ Firebase environment variables are missing or incomplete.");
}

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
  measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID,
};

// Optionally name your Firebase app
const app = initializeApp(firebaseConfig, "disaster-management");

// Export initialized services
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

export { app, auth, db, storage };