import { initializeApp, getApps, getApp, type FirebaseOptions } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";

const config: FirebaseOptions = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
};

export const firebaseConfigured = Boolean(config.apiKey && config.projectId);

let _auth: Auth | null = null;
let _db: Firestore | null = null;

if (firebaseConfigured) {
  const app = getApps().length ? getApp() : initializeApp(config);
  _auth = getAuth(app);
  _db = getFirestore(app);
} else if (typeof window !== "undefined") {
  // eslint-disable-next-line no-console
  console.warn(
    "[firebase] Missing EXPO_PUBLIC_FIREBASE_* env vars. Copy .env.example to .env, fill in the values from the Firebase Console, and restart the dev server.",
  );
}

export const auth = _auth;
export const db = _db;
