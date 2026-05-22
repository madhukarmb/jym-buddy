# Business Requirements Document — Simple Gym Buddy

## 1. Overview
A cross-platform app for a personal gym trainer to manage client attendance. Built with **React Native + Expo** so a single codebase ships installable apps on **iOS**, **Android**, and the **web** (installable PWA). MVP scope is limited to attendance tracking and the supporting flows required for it; further features will follow.

## 2. Users
| Role | Purpose |
|------|---------|
| Trainer | Manages clients, schedules sessions, and records attendance. |
| Client | Logs in to validate their own attendance. |

## 3. Authentication
- Single login screen for both roles.
- Credentials: **username + password**.
- Role is determined from the account (Trainer or Client) and routes the user to the appropriate home screen.
- **Trainer accounts**: 4 trainer accounts are pre-seeded into the app. No trainer sign-up flow in MVP.
- **Client accounts**: created exclusively by a trainer via the Clients → Enrol Client flow.

## 4. Trainer Experience

### 4.1 Home Screen — Section 1: Today's Appointments
- Displays the list of today's scheduled sessions with the corresponding client.
- The list is sourced from **Appointment** records dated for today (see §7 Data Model).
- Each appointment exposes the following actions:
  - **Check-in** — mark client as present.
  - **No Show** — mark client as absent.
  - **Reschedule** — move the appointment to a different date/time. Original appointment is hidden (status `rescheduled`); a new appointment is created at the new time.
  - **Cancel** — cancel this single appointment (status `cancelled`). Does NOT affect the parent recurring schedule.

### 4.2 Home Screen — Section 2: Sub-menu Tiles

**Tile 1 — Clients**
- Shows the list of all enrolled clients.
- Provides an action to **Enrol a new client** from within this flow.
- Enrolment captures: profile picture, name, email, and a simple password set by the trainer.
- Enrolment creates a client account usable for login.
- Tapping a client row opens the **Client Detail** screen: profile, active schedules (with End action), shortcuts to Add Schedule and View Sessions for that client.

**Tile 2 — Add Schedule**
- Entry via this tile opens a client picker first. Can also be reached from Client Detail (client pre-selected).
- Scheduler interface to pick weekdays and times.
- Default session length: **1 hour** (editable).
- Recurrence: **indefinite by default**, with an **optional end date**.
- Also supports adding a **one-off appointment** (single date/time, not tied to a recurring schedule).
- Creating a schedule materialises individual Appointment records for the upcoming window; "Today's Appointments" reads from these.
- An active recurring schedule can be **ended** from Client Detail (sets end date to today, removes future scheduled appointments, keeps past for history).

**Tile 3 — Client Sessions** (per-client billing ledger)
- Entry via this tile opens a client picker first. Can also be reached from Client Detail (client pre-selected).
- Shows an **outstanding sessions counter** = count of past appointments with status `checked_in` or `no_show` that have not yet been included in a billing closure.
- Shows the list of past appointments for this client (back to the last billing closure):
  - `checked_in` / `no_show` rows display the marked status and count toward the outstanding total.
  - Past `scheduled` rows (trainer forgot to mark) show **Check-in** / **No Show** actions for back-filling. They do not count toward the total until marked.
  - `cancelled` and `rescheduled` (original) rows are excluded.
- **Close Billing** action (visible when outstanding > 0):
  - Opens a selection screen listing all outstanding sessions; **all selected by default**.
  - Trainer can **unselect** sessions to support partial payments (unselected sessions stay outstanding).
  - Trainer enters the **amount paid** in **INR (₹), whole rupees** (required integer, > 0).
  - On confirm: the **selected** sessions are stamped with a new `BillingClosure` and switch to `billed`; unselected sessions remain outstanding. Counter updates accordingly.
  - Once billed, a session's attendance status is frozen (no further toggle).
- Past billing closures are NOT shown in MVP (outstanding view only).

**Tile 4 — Settings**
- Shows the logged-in trainer's name/email.
- Provides the **Logout** action (with confirmation).
- Reserved as the home for future settings; only logout in MVP.

## 5. Client Experience
- Log in with username and password.
- Validate / confirm their own attendance for a session.
- Home screen also includes a **Settings** entry showing the client's name/email and the **Logout** action.

## 6. Out of Scope (MVP)
Workouts, payments, progress tracking, notifications, analytics, and any feature not explicitly listed above.

## 7. Data Model (core entities)

```
Client {
  id (= Firebase Auth UID), name, email (unique, = login username),
  profilePicturePath?, createdAt
}
// Note: passwords are owned by Firebase Auth, not stored on the Client doc.

Schedule {
  id, clientId, trainerId,
  slots: [ { weekday, startTime, durationMinutes (default 60) } ],
  startDate, endDate? (null = indefinite),
  createdAt
}

Appointment {
  id, clientId, trainerId,
  scheduleId?  (null for one-offs and reschedule-generated instances),
  dateTime, durationMinutes,
  status: scheduled | checked_in | no_show | cancelled | rescheduled,
  billingStatus: outstanding | billed,
  billingClosureId?  (set when billed),
  createdAt
}

BillingClosure {
  id, clientId, trainerId,
  closedAt, sessionCount, amountPaid
}
```

**Rules:**
- Creating a Schedule materialises Appointments for the upcoming window (recommended: rolling 60 days). A background fill keeps the window populated for indefinite schedules.
- Reschedule: original Appointment → status `rescheduled`; new Appointment created with the new dateTime and `scheduleId = null`.
- Cancel: Appointment → status `cancelled`. Parent Schedule unaffected.
- One-off appointments: Appointment row with `scheduleId = null`.
- New Appointments default to `billingStatus = outstanding`.
- Only Appointments with `status` ∈ {`checked_in`, `no_show`} count toward the outstanding billing total.
- Close Billing: all `outstanding` Appointments for that client → `billed`, linked to the new BillingClosure. Their attendance `status` is thereafter frozen.
