# Auth — Detailed Requirements

Module path: `src/auth/`
Parent feature: app entry. See [BRD §3](../../BRD.md), [TECHNICAL.md §5](../../TECHNICAL.md).

## 1. Purpose
Authenticate users against Firebase Auth, resolve their role (trainer vs. client), and route them to the correct home screen. Single login surface for both roles.

## 2. Entry Points
- **App cold start with no active session** → Login screen.
- **Logout from Settings** (either role) → Login screen.

## 3. App-launch Flow

```
App start
  ├─ Splash (Firebase init)
  ├─ currentUser == null?
  │     ├─ Yes → Login Screen
  │     └─ No  → role resolution (§5) → Trainer Home or Client Home
```

The splash is brief — it exists only to cover Firebase initialisation and the role lookup. No branding animation required for MVP.

## 4. Login Screen

### 4.1 Layout
- App name / logo at top.
- **Email** input — keyboard type `emailAddress`, autocorrect off, autofill enabled.
- **Password** input — obscured, with show/hide toggle.
- **Sign In** button — primary, full width.
- Error-message area below the form for sign-in failures.

No "Sign Up" link, no "Forgot Password" link in MVP (see §8).

### 4.2 Field Validation (client-side, inline)
| Field | Rule | Error |
|-------|------|-------|
| Email | Non-empty, contains `@` and `.` | "Enter a valid email." |
| Password | Non-empty | "Enter your password." |

Validation runs on field blur and on submit. Sign-In button enabled only when both fields are non-empty.

### 4.3 Submit Behavior
1. Tap **Sign In** → button shows a spinner; both fields disabled.
2. Call `FirebaseAuth.instance.signInWithEmailAndPassword(email, password)`.
3. On success → resolve role (§5) → navigate to home.
4. On failure → re-enable form, show error (§4.4), keep the email value populated.
5. Double-submit prevented while the spinner is visible.

### 4.4 Error Cases
| Cause | Message shown |
|-------|---------------|
| `wrong-password` or `user-not-found` (merged for security) | "Incorrect email or password." |
| `user-disabled` | "This account has been disabled. Contact your trainer." |
| `too-many-requests` | "Too many attempts. Try again in a few minutes." |
| `network-request-failed` | "No internet connection. Try again." |
| Any other Firebase error | "Something went wrong. Try again." |
| Authenticated but role lookup fails permanently (§5) | Sign out + "Your account is not set up correctly. Contact your trainer." |

## 5. Role Resolution
After a successful sign-in (or on cold start with an existing session) the app determines which home to load:

```
Read trainers/{uid}
  ├─ Exists → Trainer Home
  └─ Missing
     Read clients/{uid}
       ├─ Exists → Client Home
       └─ Missing → orphan-account error (§4.4)
```

- Both reads execute once per session and the result is cached for the lifetime of the session.
- A network failure during this lookup is treated as a transient error — the user sees a "Try again." retry rather than the orphan-account error.

## 6. Session Persistence
- Firebase Auth persists the session locally (IndexedDB in the PWA) by default; users stay signed in across app restarts and browser restarts.
- No "Remember me" checkbox — persistence is implicit.
- **Logout** (from Settings) calls `FirebaseAuth.instance.signOut()`, clears the cached role, and routes back to the Login screen.

## 7. Behavior Notes
- Neither role can self-register from the app. Trainer accounts are seeded out-of-band (TECHNICAL §5); client accounts are created exclusively by a trainer via Enrol Client.
- For password resets in MVP: trainer-forgot → ops resets via Firebase Console; client-forgot → the trainer can delete and re-enrol the client with a new password. Both paths are deliberately out of the app for now.
- Email is the username (BRD §3). No separate username field.

## 8. Out of Scope (MVP)
- Forgot-password / password-reset flow.
- Sign-up for either role.
- SSO / social auth (Google, Apple).
- Biometric unlock (Face ID / fingerprint).
- Multi-factor authentication.
- Account-switching within a single browser profile.
