import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// VITE_* variables are preferred. The fallback keeps the deployed Vercel build
// connected to the same Firebase project even when Vercel environment variables
// were not configured. Firebase web config values are client-side identifiers;
// access to the data is protected by Authentication + Firestore Security Rules.
const config = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyBv8rRsiFHtGxo0DHZ8U-uE5dPebq_QzT4",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "ledgr-19317.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "ledgr-19317",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "ledgr-19317.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "667232672247",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:667232672247:web:4f1a93f2605332bf55b6f2",
};

const configured = Boolean(
  config.apiKey &&
    config.authDomain &&
    config.projectId &&
    config.messagingSenderId &&
    config.appId,
);

const app = configured ? initializeApp(config) : null;

export const auth = app ? getAuth(app) : null;
export const db = app ? getFirestore(app) : null;
export const firebaseConfigured = configured;
