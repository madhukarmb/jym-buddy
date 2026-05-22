// One-off: creates a sample client + 3 appointments for today.
// Run with:
//   node --env-file=.env scripts/seed-sample-data.mjs <trainer-email> <trainer-password>
// or via the npm script:
//   npm run seed:sample -- <trainer-email> <trainer-password>

import { initializeApp } from "firebase/app";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import {
  addDoc,
  collection,
  doc,
  getFirestore,
  setDoc,
  Timestamp,
} from "firebase/firestore";

const [, , email, password] = process.argv;

if (!email || !password) {
  console.error(
    "Usage: node --env-file=.env scripts/seed-sample-data.mjs <trainer-email> <trainer-password>",
  );
  process.exit(1);
}

const app = initializeApp({
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
});
const auth = getAuth(app);
const db = getFirestore(app);

const cred = await signInWithEmailAndPassword(auth, email, password);
const trainerUid = cred.user.uid;
console.log("Signed in as trainer:", trainerUid);

const clientRef = doc(collection(db, "clients"));
await setDoc(clientRef, {
  name: "Alice Sample",
  email: "alice.sample@example.com",
  createdAt: Timestamp.now(),
});
console.log("Created sample client:", clientRef.id);

const hours = [9, 11, 16];
for (const h of hours) {
  const when = new Date();
  when.setHours(h, 0, 0, 0);
  const ref = await addDoc(collection(db, "appointments"), {
    clientId: clientRef.id,
    trainerId: trainerUid,
    scheduleId: null,
    dateTime: Timestamp.fromDate(when),
    durationMinutes: 60,
    status: "scheduled",
    billingStatus: "outstanding",
    createdAt: Timestamp.now(),
  });
  console.log("Created appointment:", ref.id, when.toString());
}

process.exit(0);
