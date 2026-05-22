# Technical Requirements — Simple Gym Buddy

Companion to [BRD.md](BRD.md) and [JOURNEY.md](JOURNEY.md). Captures the implementation-level decisions for the MVP.

## 1. Platform & Framework
- **React Native + Expo (SDK 56)** — single TypeScript codebase, three install targets: **Web**, **iOS**, **Android**.
- **Expo Router** (file-based routing under `src/app/`) for navigation across all platforms.
- **React Native Web** powers the web target so the same components render in the browser. The web build (`expo export --platform web`) ships static HTML/JS/CSS that is installable as a PWA.
- Module organisation mirrors the feature tree in [`docs/modules/`](docs/modules) (one folder per feature: `trainer/clients`, `trainer/schedule`, `trainer/appointments`, `trainer/client_sessions`, `trainer/settings`, `client/attendance`, `client/settings`, `auth`). In code these live under `src/app/<route>` for screens and `src/features/<feature>` for shared logic.
- Supported runtimes:
  - **iOS** 15.1+ (Expo SDK 56 minimum).
  - **Android** 7.0+ (API 24, Expo SDK 56 minimum).
  - **Web**: latest Chrome, Safari, Firefox, Edge; mobile installability via "Add to Home Screen" (iOS Safari) and the browser install prompt (Android Chrome / desktop Chromium).
- PWA assets for the web target: `public/manifest.webmanifest` (name, icons, `display: standalone`, theme color) and a service worker generated at build time for offline shell + caching.

## 2. Backend — Firebase
All server-side concerns live in Firebase. No custom backend.

| Service | Purpose |
|---------|---------|
| Firebase Hosting | Serves the built static web bundle (HTML/JS/assets + service worker) |
| Firebase Auth | Email/password sign-in for trainers and clients |
| Cloud Firestore | Persistence for Clients, Schedules, Appointments, BillingClosures |
| Cloud Storage | Client profile pictures |
| Cloud Functions | Client account creation + scheduled Appointment materialisation |
| Crashlytics | Crash reporting (via `@react-native-firebase/crashlytics` on native; Sentry web SDK on browser) |
| Analytics | Basic usage telemetry |

### 2.1 SDK choice
- **Native (iOS / Android)**: `@react-native-firebase/*` modules — native SDK bindings, full feature parity.
- **Web**: the modular JS SDK (`firebase/app`, `firebase/auth`, `firebase/firestore`, `firebase/storage`, `firebase/functions`).
- A thin platform-resolving wrapper (`src/lib/firebase.ts` + `src/lib/firebase.native.ts` + `src/lib/firebase.web.ts`) exposes a single API to feature code so screens don't branch on `Platform.OS`.

### 2.2 Why Firestore (not Realtime DB)
The data model needs range queries by `dateTime`, filters by `status` and `billingStatus`, and per-client scoped reads. Firestore's structured documents, composite indexes, and built-in offline cache fit this shape directly. Realtime DB would force denormalisation and client-side filtering.

## 3. Environments
- **Two Firebase projects**: `simple-gym-buddy-dev` and `simple-gym-buddy-prod`.
- Each project hosts its own web site → default URLs `simple-gym-buddy-dev.web.app` and `simple-gym-buddy.web.app` (custom domain optional later).
- Firebase config (apiKey, projectId, etc.) injected via Expo's `extra` field in `app.config.ts`, switched by `APP_ENV=dev|prod` at build time. One build per environment per platform, deployed independently.
- **EAS Build profiles**: `development`, `preview` (internal QA), `production` for native binaries; `eas.json` keeps profiles per-environment.

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
- **Offline persistence**:
  - Native: enabled by default in `@react-native-firebase/firestore`.
  - Web: enabled via `persistentLocalCache({ tabManager: persistentSingleTabManager() })` from the modular SDK. Caveat: only one tab per browser holds the cache.
- **Writes**: any multi-doc change (Close Billing, Reschedule, End Schedule) goes through a Firestore batched write or transaction so partial failures cannot corrupt state.

## 5. Authentication
- **Firebase Auth — Email/Password** provider only.
- **Trainer accounts**: 4 accounts pre-seeded via a one-off admin script (out-of-band, not via the app). Each gets a `trainers/{uid}` doc.
- **Client accounts**: created by the trainer via the Enrol Client flow.
  - The app calls a Cloud Function `enrolClient({name, email, password, profilePic})`.
  - The function uses the Admin SDK to create the auth user, writes `clients/{uid}`, and uploads the profile picture.
  - The trainer's app never holds admin credentials.
- **Role resolution**: on sign-in, check whether the UID has a `trainers/` doc → Trainer Home; else assume client → Client Home.
- **Session**: managed by Firebase Auth SDK (persistent on all three platforms); persists until Logout.

## 6. Security Rules (intent)
Deny by default. Specific allowances:

- **Trainers** (UID has a `trainers/{uid}` doc):
  - Read/write `clients`, `schedules`, `appointments`, `billingClosures` where `trainerId == request.auth.uid`.
- **Clients**:
  - Read their own `clients/{uid}` doc.
  - Read `appointments` where `clientId == request.auth.uid`.
  - Update `appointments` only as part of attendance validation (single allowed status transition; details in [`docs/modules/client/attendance`](docs/modules/client/attendance)).
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
- **Zustand** for app-local UI state (auth user, current route context, ephemeral form state).
- **TanStack Query (React Query)** for Firestore read/write orchestration: caching, retry, optimistic updates, background refetch. Pairs cleanly with both the web SDK and `@react-native-firebase` via thin query/mutation wrappers.
- No Redux. No Context-based global state beyond what `QueryClientProvider` and the Expo Router root layout require.

## 9. Device APIs / Permissions
- **Profile picture upload**: `expo-image-picker` (camera + library) on native, falling back to `<input type="file" accept="image/*" capture="user">` on web. The same component selects the right surface via `Platform.OS`.
- **Image display**: `expo-image` (handles caching across web + native).

No geolocation, microphone, contacts, or notifications used in MVP.

## 10. Observability
- **Crashlytics** (native) + **Sentry** (web) for crash reporting. Shared `reportError(error, context)` helper in `src/lib/observability.ts`.
- **Analytics** — basic events only: `sign_in`, `enrol_client`, `appointment_action` (with action type), `close_billing`. No PII in parameters. Native via `@react-native-firebase/analytics`; web via `firebase/analytics`.

## 11. Testing
- **Unit tests** with **Jest** + `jest-expo`: business logic — status transitions, billing aggregation, schedule materialisation rules.
- **Component tests** with `@testing-library/react-native`: critical screens — Today's Appointments, Close Billing, Enrol form.
- **Firebase Local Emulator Suite** for offline development and integration tests of Auth, Firestore, Storage, and Functions.
- **Type checking**: `tsc --noEmit` in CI; strict mode is on (`tsconfig.json` extends `expo/tsconfig.base` with `strict: true`).
- **Manual smoke pass** on a real iOS device, a real Android device, and installed-PWA Safari/Chrome before promoting a `dev` build to `prod`.

## 12. Distribution

### 12.1 Web — Firebase Hosting (PWA)
- Build: `npx expo export --platform web` produces `dist/` with static HTML/JS/CSS + service worker.
- Deploy: `firebase deploy --only hosting` against the relevant project (`dev` or `prod`).
- Install: Android Chrome shows an automatic install prompt; iOS Safari uses Share → "Add to Home Screen" (a one-time in-app banner guides first-time iOS users).
- Updates: deploy a new build; service worker fetches the new bundle on next launch.

### 12.2 iOS — EAS Build → TestFlight → App Store
- Build: `eas build --platform ios --profile production` produces a signed `.ipa` (managed credentials via EAS).
- Distribute: `eas submit --platform ios` uploads to App Store Connect; TestFlight for internal QA, App Store for release.
- Updates: most JS-only changes ship via **EAS Update** (over-the-air, no review). Native changes require a new store build.

### 12.3 Android — EAS Build → Internal Testing → Play Store
- Build: `eas build --platform android --profile production` produces a signed `.aab`.
- Distribute: `eas submit --platform android` uploads to the Play Console; Internal Testing track for QA, Production for release.
- Updates: same EAS Update channel as iOS for JS-only changes.

### 12.4 Release channels
- `dev` channel → preview builds, points at `simple-gym-buddy-dev`.
- `production` channel → store builds, points at `simple-gym-buddy-prod`.
- Channel is wired through `eas.json` env vars and consumed in `app.config.ts`.

## 13. Out of Scope (MVP)
- Push notifications (FCM/APNs and web push deferred).
- Deep links beyond what Expo Router provides by default.
- Localization (English only).
- SSO / social auth providers.
- Multi-trainer-per-client.
- Pricing-tier modelling / per-session rates.
