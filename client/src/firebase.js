// firebase.js
import { initializeApp } from "firebase/app";
import { 
  getAuth, 
  RecaptchaVerifier, 
  signInWithPhoneNumber 
} from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
  measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID,
};

console.log("Firebase API Key:", process.env.REACT_APP_FIREBASE_API_KEY);

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Services
const auth = getAuth(app);         // For login/signup (optional)
const db = getFirestore(app);      // For Firestore (messages, users, etc.)
const storage = getStorage(app);   // For image/video uploads

// Export everything needed for OTP
export { auth, db, storage, RecaptchaVerifier, signInWithPhoneNumber };