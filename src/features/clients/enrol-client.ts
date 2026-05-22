import { doc, setDoc, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";

// TODO: Per TECHNICAL.md §7, this should call the `enrolClient` Cloud Function
// (Admin SDK creates the auth user + writes the doc + uploads the picture).
// Until that function is deployed, we use the public Identity Toolkit signUp
// endpoint to create the auth user and write the Firestore doc as the
// trainer. The trainer's app must NEVER hold admin credentials; this approach
// stays within the public client SDK surface.

const SIGNUP_ENDPOINT = "https://identitytoolkit.googleapis.com/v1/accounts:signUp";

type Params = {
  name: string;
  email: string;
  password: string;
};

function humanize(code: string): string {
  if (code.startsWith("WEAK_PASSWORD")) return "Password is too weak (min 6 characters).";
  switch (code) {
    case "EMAIL_EXISTS":
      return "An account with this email already exists.";
    case "INVALID_EMAIL":
      return "Email is invalid.";
    case "TOO_MANY_ATTEMPTS_TRY_LATER":
      return "Too many attempts. Please try again later.";
    default:
      return code;
  }
}

async function createAuthUser(email: string, password: string): Promise<string> {
  const apiKey = process.env.EXPO_PUBLIC_FIREBASE_API_KEY;
  if (!apiKey) throw new Error("Firebase not configured");

  const res = await fetch(`${SIGNUP_ENDPOINT}?key=${apiKey}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password, returnSecureToken: false }),
  });

  if (!res.ok) {
    const body = (await res.json().catch(() => ({}))) as {
      error?: { message?: string };
    };
    const code = body.error?.message ?? `HTTP ${res.status}`;
    throw new Error(humanize(code));
  }

  const body = (await res.json()) as { localId: string };
  return body.localId;
}

export async function enrolClient({ name, email, password }: Params): Promise<string> {
  if (!db) throw new Error("Firebase not configured");
  const trimmedName = name.trim();
  const trimmedEmail = email.trim();

  const uid = await createAuthUser(trimmedEmail, password);

  await setDoc(doc(db, "clients", uid), {
    name: trimmedName,
    email: trimmedEmail,
    createdAt: Timestamp.now(),
  });

  return uid;
}
