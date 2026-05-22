import { create } from "zustand";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut as fbSignOut,
} from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db, firebaseConfigured } from "@/lib/firebase";

export type Role = "trainer" | "client";

export type AuthUser = {
  uid: string;
  email: string;
  displayName: string;
  role: Role;
};

type AuthState = {
  user: AuthUser | null;
  status: "loading" | "signedOut" | "signedIn";
  error: string | null;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
};

const NOT_CONFIGURED =
  "Firebase is not configured. Copy .env.example to .env, fill in the values from the Firebase Console, then restart the dev server.";

export const useAuth = create<AuthState>((set) => ({
  user: null,
  status: "loading",
  error: null,
  signIn: async (email, password) => {
    if (!auth) {
      set({ error: NOT_CONFIGURED });
      return;
    }
    set({ error: null });
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Sign-in failed";
      set({ error: msg });
      throw e;
    }
  },
  signOut: async () => {
    if (!auth) return;
    await fbSignOut(auth);
  },
}));

let listenerStarted = false;

export function startAuthListener(): void {
  if (listenerStarted) return;
  listenerStarted = true;

  if (!firebaseConfigured || !auth || !db) {
    useAuth.setState({ status: "signedOut", user: null, error: NOT_CONFIGURED });
    return;
  }
  const authInstance = auth;
  const dbInstance = db;

  onAuthStateChanged(authInstance, async (fbUser) => {
    if (!fbUser) {
      useAuth.setState({ status: "signedOut", user: null, error: null });
      return;
    }

    useAuth.setState({ status: "loading" });
    let role: Role = "client";
    try {
      const snap = await getDoc(doc(dbInstance, "trainers", fbUser.uid));
      if (snap.exists()) role = "trainer";
    } catch (e) {
      // eslint-disable-next-line no-console
      console.warn("[auth] trainer role lookup failed", e);
    }

    useAuth.setState({
      status: "signedIn",
      user: {
        uid: fbUser.uid,
        email: fbUser.email ?? "",
        displayName: fbUser.displayName ?? fbUser.email ?? "",
        role,
      },
    });
  });
}
