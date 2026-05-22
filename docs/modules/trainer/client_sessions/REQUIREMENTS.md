# Client Sessions — Detailed Requirements

Module path: `src/trainer/client_sessions/`
Parent feature: Trainer home → Sub-menu Tile 3 (see [BRD §4.2](../../../BRD.md)).

## 1. Purpose
Per-client **billing ledger**. Lets the trainer see how many sessions a client owes for, back-fill any missed attendance marks, and close out billing when the client pays.

## 2. Entry Points
1. **Trainer home → Client Sessions tile** → opens a client picker, then continues to the ledger.
2. **Client Detail → "View Sessions for this client" shortcut** → client pre-selected; picker skipped.

## 3. Screen Layout

### 3.1 Header
- Client name and profile picture.
- **Outstanding sessions counter** — large, prominent. Count = past Appointments for this client with `billingStatus = outstanding` AND `status` ∈ {`checked_in`, `no_show`}.

### 3.2 Session List
- Lists past Appointments for this client since the most recent billing closure (or all-time if none).
- Excludes:
  - Future Appointments (not yet billable).
  - `cancelled` and `rescheduled` (original) Appointments.
  - Appointments with `billingStatus = billed` (already closed out).
- Each row shows: date, time, attendance status.
- Sorted: most recent first.
- Empty state: "No outstanding sessions."

### 3.3 Per-row Behavior

| Row status | Display | Actions |
|------------|---------|---------|
| `checked_in` | Marked attended; counts toward total | Tap to toggle to `no_show` (only while `outstanding`) |
| `no_show` | Marked no-show; counts toward total | Tap to toggle to `checked_in` (only while `outstanding`) |
| `scheduled` (past, unmarked) | Highlighted as needing action; does NOT yet count | **Check-in** / **No Show** buttons to back-fill |

Once an Appointment has been included in a Billing Closure (`billingStatus = billed`), its attendance status is **frozen** — no toggle, no back-fill.

### 3.4 Close Billing
- Button visible only when **outstanding > 0**.
- Tapping opens a Close Billing screen:
  - Lists all currently-outstanding sessions (date + time + attendance status).
  - Each row has a **checkbox**; **all rows are selected by default**.
  - Trainer can **unselect** rows to exclude them from this closure (used when the client is making a partial payment — unselected sessions remain outstanding for a future closure).
  - Live summary updates as the selection changes: *"Closing X of N sessions for [Client Name]."*
  - Input field: **Amount paid** — required, **whole rupees (INR ₹)**, positive integer. Numeric keyboard; ₹ prefix shown in the field; no decimal entry.
  - **Confirm** / **Cancel**.
- Validation:
  - At least one session must be selected to enable Confirm.
  - Amount paid must be > 0.
- On confirm:
  - Create a `BillingClosure` record: `{ clientId, trainerId, closedAt = now, sessionCount = X, amountPaid }` where X = number of selected sessions.
  - The **selected** Appointments → `billingStatus = billed`, `billingClosureId = <new closure id>`. Their attendance status is frozen.
  - **Unselected** Appointments remain `outstanding` and continue to count on the ledger.
  - Counter updates to reflect remaining outstanding sessions (if any).
  - Success snackbar.

## 4. Validation
- **Amount paid**: required, positive integer (whole rupees, INR ₹). No upper bound enforced. No decimals.
- Close Billing button disabled if outstanding count is 0.

## 5. Behavior Notes
- The counter and list update live as the trainer back-fills attendance.
- Closing billing is **atomic** — either all outstanding sessions are billed and the closure record is created, or none are.

## 6. Out of Scope (MVP)
- History of past billing closures (only outstanding view in MVP).
- Editing or voiding a past billing closure.
- Per-session pricing or rate calculation (trainer enters a single total amount).
- Exporting/sharing receipts.
- Adjusting attendance status on already-billed sessions.
