# Client Detail — Detailed Requirements

Module path: `src/trainer/clients/client_detail/`
Parent module: [`src/trainer/clients/`](../REQUIREMENTS.md) — opened by tapping a client row in the Clients list.

## 1. Purpose
A per-client landing page that gives the Trainer quick access to that client's schedules and sessions, plus the ability to end an active recurring schedule.

## 2. Entry Point
- Clients list → tap a client row.

## 3. Sections

### 3.1 Profile
- Profile picture (or placeholder).
- Name.
- Email (the client's login username).
- Read-only in MVP (no edit).

### 3.2 Active Schedules
- Lists the client's currently active recurring Schedules (those with `endDate` null or in the future).
- One-off appointments are NOT shown here (they live as Appointments only).
- Each row shows the schedule's slots (weekday + start time + duration) and start/end dates.
- Per-row action: **End Schedule** (see [`../../schedule/REQUIREMENTS.md §7.2`](../../schedule/REQUIREMENTS.md)).
  - Confirmation prompt before applying.
  - On confirm: sets `endDate = today` and deletes future scheduled Appointments tied to that Schedule.
- Empty state: "No active schedules for this client."

### 3.3 Shortcuts
- **Add Schedule for this client** → opens the Add Schedule flow with this client **pre-selected** (skips the picker).
- **View Sessions for this client** → opens the Client Sessions view with this client **pre-selected** (skips the picker).

## 4. Behavior
- After ending a schedule, the row disappears from the Active Schedules list.
- Shortcuts return to Client Detail (not trainer home) after completing their flow.

## 5. Out of Scope (MVP)
- Editing the client's profile (name, email, password, picture).
- Deleting the client.
- Showing ended/past schedules.
- Showing upcoming appointments here (use Today's Appointments or Client Sessions).
