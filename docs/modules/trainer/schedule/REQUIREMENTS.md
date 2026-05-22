# Add Schedule — Detailed Requirements

Module path: `src/trainer/schedule/`
Parent feature: Trainer home → Sub-menu Tile 2 (see [BRD §4.2](../../../BRD.md)).

## 1. Purpose
Allow the Trainer to define when a client will train. Supports both **recurring schedules** (weekly pattern) and **one-off appointments** (single date/time). Creating either populates the Appointments list that feeds Today's Appointments.

## 2. Entry Points
Two ways to reach this flow:
1. **From Trainer home → Add Schedule tile** → opens a client picker, then continues to the form.
2. **From Client Detail → "Add Schedule for this client" shortcut** → client is **pre-selected**; picker is skipped.

## 3. Flow

### 3.1 Select Client
- When entered via the tile: picker shows the enrolled clients list; trainer taps one to select.
- When entered via Client Detail: this step is skipped (client already chosen).
- Required before proceeding.

### 3.2 Choose Type
- **Recurring schedule** (default), or
- **One-off appointment**.

### 3.3 Screen Structure
- Full-screen form (route push, not a modal).
- **App bar**: title "Add Schedule" + Cancel/Back action.
- **Client header** (read-only): profile picture + client name. Not editable here — trainer must back out to re-pick.
- **Type toggle**: segmented control `Recurring | One-off`. Defaults to Recurring. Switching toggles the body content; in-progress input on one tab is discarded when the user switches with a confirmation prompt.
- **Body**: type-specific fields (see §4.3 and §5.3).
- **Footer**: sticky primary **Save** button, full-width.

## 4. Recurring Schedule

### 4.1 Inputs
| Field | Required | Notes |
|-------|----------|-------|
| Weekday(s) | Yes | One or more weekdays (Mon–Sun). |
| Start time | Yes | Per-slot; trainer can add multiple slots with different times. |
| Duration | Yes | Defaults to **60 minutes**, editable per slot. |
| Start date | Yes | Defaults to today. |
| End date | No | If omitted → **indefinite recurrence**. |

### 4.2 Behavior
- On save, Appointment records are **materialised** for each occurrence in the upcoming window.
  - Recommended window: rolling **60 days** ahead.
  - For indefinite schedules, a background fill keeps the 60-day window populated as time advances.
- If an end date is set, materialisation stops at that date.
- Implementation: save writes the `Schedule` document; a new `onScheduleCreated` Firestore trigger materialises the initial 60-day Appointment batch (add this trigger to TECHNICAL.md §7). The scheduled `materialiseAppointments` Function then keeps the window topped up.

### 4.3 Form Mechanics

**Slots list (main body)**
- Each row shows: weekday (full name) · start time · duration. Example: `Monday · 7:00 AM · 60 min`.
- Tap a row → opens the slot editor (below) in edit mode.
- Each row has a small `×` to remove that slot (no confirmation needed — easy to re-add).
- Rows are sorted: weekday (Mon → Sun), then start time ascending.
- Below the list: `+ Add slot` button → opens the slot editor in create mode.
- Empty state copy: "Add at least one slot to define the weekly pattern."

**Slot editor (bottom sheet)**
- Fields:
  - **Weekday** — single-select chip group `[Mon · Tue · Wed · Thu · Fri · Sat · Sun]`.
  - **Start time** — tap to open Material time picker. Default for a new slot: **7:00 AM**. 12-hour display.
  - **Duration** — chip group `[30 · 45 · 60 · 90 min]`. Default **60**.
- Primary button: **Add** (create) / **Save** (edit). Secondary: **Cancel** closes without persisting.
- Sheet closes on confirm; the new/edited slot appears in the list, re-sorted.
- Trainer can add multiple slots in succession without leaving the form.

**Schedule range**
- **Start date** — defaults to **today**. Tap to open Material date picker. Past dates not selectable.
- **End date** — `Set end date` switch, off by default (indefinite). When on, a date picker appears below; default value = start date + 4 weeks. Cannot be earlier than start date.

## 5. One-off Appointment

### 5.1 Inputs
| Field | Required | Notes |
|-------|----------|-------|
| Date | Yes | Specific calendar date. |
| Start time | Yes | |
| Duration | Yes | Defaults to **60 minutes**, editable. |

### 5.2 Behavior
- On save, a single Appointment is created with `scheduleId = null`.

### 5.3 Form Mechanics
- Simple stacked form — no slot list, no recurrence.
- Fields:
  - **Date** — tap to open Material date picker. Default **today**. **Past dates are allowed** so the trainer can back-date a session that has already happened (the back-dated appointment can then be marked via the Client Sessions back-fill flow).
  - **Start time** — Material time picker. Default **7:00 AM**.
  - **Duration** — chip group `[30 · 45 · 60 · 90 min]`. Default **60**.

## 6. Validation
- Client must be selected.
- Recurring: at least one slot required (each slot = weekday + start time + duration, all required). Start date required and must be ≥ today. End date, if set, must be ≥ start date.
- One-off: date + time + duration all required. Date can be in the past, present, or future.
- Save button is disabled until all required fields are valid.
- Overlapping appointments (e.g., two clients booked into the same hour) are **permitted in MVP** — no conflict detection. Trainer is expected to keep slots clean manually.

## 7. Actions

### 7.1 Create
- **Save**: writes the `Schedule` (or one-off Appointment). For recurring, the `onScheduleCreated` trigger materialises the initial 60-day Appointment batch. On success: success snackbar + navigate back to the previous screen (Trainer Home or Client Detail, depending on entry point).
- **Cancel / Back**: discards input; prompts "Discard changes?" if any field has been touched.
- While the save is in flight: Save button shows a spinner; form is disabled; double-submit prevented.
- On save failure: error snackbar; form contents preserved.

### 7.2 End Schedule
- Applies to an existing recurring Schedule.
- Effect:
  - Sets the Schedule's `endDate` to **today**.
  - Deletes all **future** Appointments tied to this Schedule (i.e., `dateTime > now` and `status = scheduled`).
  - **Past Appointments are retained** (preserves attendance history).
  - Appointments with status `checked_in`, `no_show`, `cancelled`, or `rescheduled` are never deleted.
- Confirmation prompt required before applying.
- Entry point: **Client Detail → Active Schedules section → End action per schedule row** (see [`../clients/client_detail/REQUIREMENTS.md §3.2`](../clients/client_detail/REQUIREMENTS.md)).

## 8. Out of Scope (MVP)
- Editing an existing recurring schedule's slots, weekdays, or duration (use End + create new instead).
- Conflict detection between schedules (overlapping times).
- Time-zone handling beyond the device default.
- Bulk schedule creation across multiple clients.
