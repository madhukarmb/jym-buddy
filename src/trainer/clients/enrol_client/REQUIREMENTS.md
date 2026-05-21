# Enrol Client — Detailed Requirements

Module path: `src/trainer/clients/enrol_client/`
Parent module: [`src/trainer/clients/`](../REQUIREMENTS.md) — invoked from the Clients list via the **Enrol Client** action.
Parent feature: Trainer home → Sub-menu Tile 1 (see [BRD §4.2](../../../../BRD.md)).

## 1. Purpose
Allow the Trainer to create a new Client account. The created account must be immediately usable by the Client to log in and validate attendance.

## 2. Entry Point
- Trainer home screen → tap **Clients** tile → **Enrol Client** action on the Clients list.
- Navigates to the Enrol Client form screen.

## 3. Form Fields

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| Profile picture | Image | No | Tap to pick from **camera** or **gallery**. Shows placeholder avatar if not set. |
| Name | Text | Yes | Full name of the client. |
| Email | Text (email) | Yes | Used as the client's login username. Must be unique. |
| Password | Text (masked) | Yes | "Simple password" set by the trainer; shared verbally/manually with the client. |

## 4. Validation
- **Name**: non-empty, trimmed, max 80 characters.
- **Email**: non-empty, valid email format, unique across existing clients.
- **Password**: non-empty, minimum **6 characters** (matches Firebase Auth's minimum). Trainer typically shares the password verbally with the client.
- **Profile picture**: optional; if provided, accept common image formats (jpg, png) and downscale for storage.
- Inline error messages per field; **Save** button disabled until all required fields are valid.

## 5. Actions
- **Save / Enrol**: creates the client account, persists the profile, returns to the Clients list with a success confirmation (snackbar/toast). The new client appears in the list.
- **Cancel / Back**: discards input; if the form has unsaved changes, prompt for confirmation.

## 6. Behavior
- On successful save:
  - Client record is created with role = `client`.
  - Account is active and login-ready immediately.
  - Profile picture (if provided) is stored and linked to the client record.
- On failure (e.g., duplicate email, storage error):
  - Show an inline/snackbar error.
  - Form state is preserved so the trainer can correct and retry.

## 7. Out of Scope (MVP)
- Editing an enrolled client / re-enrol flow.
- Password reset or change after enrol (trainer sets it once at enrol time).
- Bulk import of clients.
- Email verification / welcome email.
- Phone number, address, emergency contact, medical info.
- Self-signup by clients (only the trainer enrols).

## 8. Data Model

Canonical model is in [BRD §7](../../../../BRD.md). Implementation specifics:
- The `Client` document lives at `clients/{uid}` in Firestore, keyed by the Firebase Auth UID (not a separate `id` field).
- Password is **not** stored on the `Client` doc — Firebase Auth owns credentials.
- Profile picture stored in Firebase Cloud Storage at `client-profiles/{uid}.jpg`; `Client.profilePicturePath` holds the storage path (null if not set).
- The enrolment write is performed by the `enrolClient` Cloud Function ([TECHNICAL §7](../../../../TECHNICAL.md)), not directly by the app.
