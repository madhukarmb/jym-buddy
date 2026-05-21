# Technical Requirements — Simple Gym Buddy

Companion to [BRD.md](BRD.md) and [JOURNEY.md](JOURNEY.md). Captures the implementation-level decisions for the MVP.

## 1. Platform & Framework
- **Flutter** (single codebase). Build target: **Web** only — shipped as an installable **PWA** to avoid App Store / Play Store overhead. iOS and Android users install it from the browser via "Add to Home Screen" / "Install app".
- Supported browsers: **iOS Safari 16.4+**, **Android Chrome (current)**, and modern desktop Chrome / Safari / Firefox.
- App source layout: standard Flutter `lib/`. Module organisation mirrors the existing `src/` requirements tree (one folder per feature: `trainer/clients`, `trainer/schedule`, `trainer/appointments`, `trainer/client_sessions`, `trainer/settings`, `client/attendance`, `client/settings`, `auth`).
- PWA assets: `web/manifest.json` (name, icons, `display: standalone`, theme color) and the Flutter-generated service worker for offline shell + caching.

## 2. Backend — Firebase
All server-side concerns live in Firebase. No custom backend.

| Service | Purpose |
|---------|---------|
| Firebase Hosting | Serves the built PWA bundle (HTML/JS/assets + service worker) |
| Firebase Auth | Email/password sign-in for trainers and clients |
| Cloud Firestore | Persistence for Clients, Schedules, Appointments, BillingClosures |
| Cloud Storage | Client profile pictures |
| Cloud Functions | Client account creation + scheduled Appointment materialisation |
| Crashlytics | Crash reporting (web SDK) |
| Analytics | Basic usage telemetry |

### 2.1 Why Firestore (not Realtime DB)
The data model needs range queries by `dateTime`, filters by `status` and `billingStatus`, and per-client scoped reads. Firestore's structured documents, composite indexes, and built-in offline cache fit this shape directly. Realtime DB would force denormalisation and client-side filtering.

## 3. Environments
- **Two Firebase projects**: `simple-gym-buddy-dev` and `simple-gym-buddy-prod`.
- Each project hosts its own PWA site → default URLs `simple-gym-buddy-dev.web.app` and `simple-gym-buddy.web.app` (custom domain optional later).
- Firebase web config (apiKey, projectId, etc.) injected at build time via `--dart-define` flags or per-environment config files; one build per environment, deployed independently.

## 4. Data Layer

### 4.1 Firestore Collections
Mirror BRD §7:
- `trainers/{uid}` — display name, email (one doc per seeded trainer).
- `clients/{uid}` — Client doc keyed by the Firebase Auth UID.
- `schedules/{scheduleId}`
- `appointments/{appointmentId}` — heaviest collection.
- `billingClosures/{closureId}`

### 4.2 Required Composite Indexes
| Collection | Index | Used by |
|------------|-------|---------|
| `appointments` | `trainerId ASC, dateTime ASC` | Today's Appointments |
| `appointments` | `clientId ASC, billingStatus ASC, dateTime DESC` | Billing ledger |
| `appointments` | `scheduleId ASC, dateTime ASC` | End Schedule cleanup |

### 4.3 Conventions
- **IDs**: Firestore-generated document IDs (no client-side generation).
- **Timestamps**: store all `dateTime` and `createdAt` as Firestore `Timestamp` (UTC). UI renders in device local time. MVP assumes a single timezone per trainer.
- **Offline persistence**: enabled via Firestore web SDK `enableIndexedDbPersistence()`. Trainer can mark attendance with flaky signal; sync resolves on reconnect. Caveat: web persistence is single-tab — only one tab per browser can hold the cache.
- **Writes**: any multi-doc change (Close Billing, Reschedule, End Schedule) goes through a Firestore batched write or transaction so partial failures cannot corrupt state.

## 5. Authentication
- **Firebase Auth — Email/Password** provider only.
- **Trainer accounts**: 4 accounts pre-seeded via a one-off admin script (out-of-band, not via the app). Each gets a `trainers/{uid}` doc.
- **Client accounts**: created by the trainer via the Enrol Client flow.
  - The app calls a Cloud Function `enrolClient({name, email, password, profilePic})`.
  - The function uses the Admin SDK to create the auth user, writes `clients/{uid}`, and uploads the profile picture.
  - The trainer's app never holds admin credentials.
- **Role resolution**: on sign-in, check whether the UID has a `trainers/` doc → Trainer Home; else assume client → Client Home.
- **Session**: managed by Firebase Auth SDK; persists until Logout.

## 6. Security Rules (intent)
Deny by default. Specific allowances:

- **Trainers** (UID has a `trainers/{uid}` doc):
  - Read/write `clients`, `schedules`, `appointments`, `billingClosures` where `trainerId == request.auth.uid`.
- **Clients**:
  - Read their own `clients/{uid}` doc.
  - Read `appointments` where `clientId == request.auth.uid`.
  - Update `appointments` only as part of attendance validation (single allowed status transition; details in `src/client/attendance`).
- **Storage**:
  - Profile picture read: authenticated user whose UID matches the path.
  - Profile picture write: only via Cloud Function (admin).

Rules to be authored and tested in `firestore.rules` / `storage.rules`; emulator tests required before deploy.

## 7. Cloud Functions
| Function | Type | Purpose |
|----------|------|---------|
| `enrolClient` | Callable | Creates the auth user, writes `clients/{uid}` doc, stores profile picture. Caller must be a trainer. |
| `onScheduleCreated` | Firestore trigger (on `schedules` create) | Materialises the initial 60-day Appointment batch for the new Schedule. Idempotent. |
| `materialiseAppointments` | Scheduled (daily) | For each active recurring `Schedule`, tops up the rolling 60-day Appointment window. Idempotent. |
| `onScheduleEnded` | Firestore trigger (on `schedules` update) | When `endDate` is set, deletes future `appointments` where `scheduleId` matches and `status = scheduled`. |

## 8. State Management
- **Riverpod** — locked. Testable, compile-safe, current community default for new Flutter projects. No `BuildContext` dependency for state access.
- Use `flutter_riverpod` package with code generation (`riverpod_generator`) for boilerplate-free providers.

## 9. Browser APIs / Permissions
PWA uses standard browser inputs — no native-style permission prompts.
- **Profile picture upload**: `<input type="file" accept="image/*" capture="user">` — opens the camera or photo picker on mobile, file picker on desktop. No explicit permission flow needed.

No geolocation, microphone, contacts, or notifications used in MVP.

## 10. Observability
- **Crashlytics** — crash reporting (Flutter integration).
- **Analytics** — basic events only: `sign_in`, `enrol_client`, `appointment_action` (with action type), `close_billing`. No PII in parameters.

## 11. Testing
- **Unit tests**: business logic — status transitions, billing aggregation, schedule materialisation rules.
- **Widget tests**: critical screens — Today's Appointments, Close Billing, Enrol form.
- **Firebase Local Emulator Suite** for offline development and integration tests of Auth, Firestore, Storage, and Functions.
- **Manual smoke pass** in real iOS Safari and Android Chrome (installed as PWA) before promoting a `dev` build to `prod`.

## 12. Distribution — PWA via Firebase Hosting
- Build: `flutter build web --release` (CanvasKit renderer for visual fidelity; HTML renderer if bundle size becomes a concern).
- Deploy: `firebase deploy --only hosting` against the relevant project (`dev` or `prod`).
- Install:
  - **Android Chrome** — automatic install prompt; or browser menu → "Install app".
  - **iOS Safari** — Share sheet → "Add to Home Screen". iOS does not auto-prompt; a small in-app banner for first-time iOS users guides them through it.
- Updates: deploy a new build; the service worker fetches the new bundle on next launch. No store review, no version pinning, no certificate expiry.
- No App Store / Play Store accounts, fees, signing certificates, or device-UDID lists required.
- CI/CD not required for MVP; manual `firebase deploy` is acceptable.

## 13. Out of Scope (MVP)
- Push notifications (web push possible later on iOS 16.4+ / Android, deferred).
- Deep links / dynamic links.
- Localization (English only).
- Native iOS / Android builds (web PWA only — no App Store / Play Store distribution).
- SSO / social auth providers.
- Multi-trainer-per-client.
- Pricing-tier modelling / per-session rates.
