# Today's Appointments — Detailed Requirements

Module path: `src/trainer/appointments/`
Parent feature: Trainer home → Section 1 (see [BRD §4.1](../../../BRD.md)).

## 1. Purpose
Show the Trainer the list of appointments scheduled for **today**, and let them act on each one (attendance, reschedule, cancel).

## 2. Data Source
- Reads from **Appointment** records (see [BRD §7 Data Model](../../../BRD.md)) where:
  - `dateTime` falls within today, AND
  - `status` ∈ {`scheduled`, `checked_in`, `no_show`, `cancelled`} (i.e., everything except `rescheduled` — the rescheduled original is replaced by its new appointment row).
- Cancelled rows stay visible with a strike-through so the trainer keeps a day-log; their action buttons are hidden because cancel is terminal.
- Sorted by `dateTime` ascending.
- Empty state: "No appointments today."

## 3. List Row
Each row displays:
- Client name + profile picture.
- Time (start time, with duration if helpful).
- Current status indicator (e.g., scheduled / checked-in / no-show).

## 4. Actions per Appointment

| Action | Effect |
|--------|--------|
| **Check-in** | Set `status = checked_in`. |
| **No Show** | Set `status = no_show`. |
| **Reschedule** | Set original `status = rescheduled` (hidden from today's list). Open a date/time picker; on confirm, create a new Appointment with the chosen `dateTime`, same client/duration, `scheduleId = null`. |
| **Cancel** | Set `status = cancelled` (hidden from today's list). Parent recurring Schedule is unaffected. |

- Check-in and No-show are mutually exclusive; the most recent action wins. The trainer may toggle between them if mistakenly tapped.
- Reschedule and Cancel are terminal for the current row. Reschedule removes the original row (the new appointment row replaces it); Cancel keeps the original row visible with strike-through and no action buttons.
- **Confirmation requirements**:
  - Check-in / No Show — single tap, no confirmation (easy to toggle if mistapped).
  - **Cancel** — confirmation dialog: "Cancel this appointment?" with **Cancel appointment** / **Keep**. Destructive action style.
  - **Reschedule** — confirmation is the explicit Save inside the picker (§4.1).

### 4.1 Reschedule Flow (detail)

**Entry**: tap **Reschedule** on a today's appointment row → opens a "Reschedule Appointment" bottom sheet (or modal route).

**Header**: read-only client name + the current `dateTime` shown as "Currently: Mon 18 May · 7:00 AM".

**Fields**:
- **New date** — Material date picker. Default = today. Constraint: **today or later** (cannot reschedule into the past).
- **New time** — Material time picker. Default = original time.
- **Duration** — not editable here; carries over from the original Appointment. (If the trainer wants a different duration, they should Cancel and add a one-off via Add Schedule.)

**Validation**:
- Combined new `dateTime` must be **strictly in the future** (`> now`).
- If the new date is today, only times later than the current time are valid.
- Save disabled until valid.

**Actions**:
- **Save** — atomic Firestore batched write:
  1. Original Appointment → `status = rescheduled`.
  2. New Appointment created: same `clientId`, `trainerId`, `durationMinutes`; new `dateTime`; `scheduleId = null`; `status = scheduled`; `billingStatus = outstanding`.
- **Cancel** — closes the sheet; original Appointment unchanged.

**Outcome**:
- Original row disappears from today's list immediately.
- If the new `dateTime` is also today, the new row appears in today's list at its sorted position.
- Success snackbar: "Rescheduled to {new dateTime}."
- Save failure: error snackbar; original Appointment unchanged; sheet stays open.

**Overlap**: rescheduling to a time when another appointment exists is permitted (see schedule spec §6 — no conflict detection in MVP).

## 5. Behavior
- All actions update the underlying Appointment immediately.
- Status changes are reflected in the row without leaving the screen.

## 6. Out of Scope (MVP)
- Viewing past or future days' appointments from this screen (only today).
- Bulk actions (e.g., check in everyone).
- Notes or comments per appointment.
- Push notifications / reminders.
