# Trainer Home — Detailed Requirements

Module path: `src/trainer/home/`
Parent feature: Trainer landing after sign-in. See [BRD §4](../../../BRD.md).

## 1. Purpose
The trainer's landing screen after sign-in. Surfaces today's work (the appointments list) and provides navigation to the four sub-menu tiles.

## 2. Entry Points
- After successful sign-in when the role resolves as trainer (see [auth spec §5](../../auth/REQUIREMENTS.md)).
- After cold start when an existing trainer session is restored.
- After backing out of any sub-feature (Clients, Add Schedule, Client Sessions, Settings).

## 3. Screen Layout

```
┌──────────────────────────────────────────────┐
│  Hi, {Trainer first name}                    │ ← header
│  {Today's date, e.g. "Thursday, 21 May"}     │
├──────────────────────────────────────────────┤
│  Today's Appointments                        │ ← section 1
│  ┌────────────────────────────────────────┐  │
│  │  7:00 AM  · Alice         [Check-in] … │  │
│  │  8:00 AM  · Bob           [Check-in] … │  │
│  │  9:00 AM  · Charlie       [Check-in] … │  │
│  └────────────────────────────────────────┘  │
├──────────────────────────────────────────────┤
│   ┌──────────┐   ┌──────────┐                │ ← section 2
│   │ Clients  │   │ Add      │                │   2 × 2 tile grid
│   │          │   │ Schedule │                │
│   └──────────┘   └──────────┘                │
│   ┌──────────┐   ┌──────────┐                │
│   │ Client   │   │ Settings │                │
│   │ Sessions │   │          │                │
│   └──────────┘   └──────────┘                │
└──────────────────────────────────────────────┘
```

### 3.1 Header
- Greeting: `Hi, {trainer first name}`.
- Below greeting: today's date formatted long-form, e.g. `Thursday, 21 May`.
- Trainer profile picture: **not shown** in MVP (no profile picture for trainer accounts).
- No app bar actions; logout lives inside Settings tile (BRD §4.2 Tile 4).

### 3.2 Section 1 — Today's Appointments
- Section title: **Today's Appointments**.
- Renders the full Today's Appointments list inline (no separate route — this section *is* the host for that module). Behaviour and row layout are defined in [`../appointments/REQUIREMENTS.md`](../appointments/REQUIREMENTS.md).
- The list **lives inside the home screen**; scrolling the home screen scrolls the appointments list.
- Empty state: a small placeholder card with "No appointments today."
- Live-updates via Firestore stream — status changes from actions (check-in / no-show / cancel / reschedule) reflect immediately without manual refresh.

### 3.3 Section 2 — Sub-menu Tiles
- 2-column grid of 4 tiles.
- Each tile: icon + label, square-ish, equal sizing.
- Tile labels and destinations:

| Tile | Label | Destination |
|------|-------|-------------|
| 1 | Clients | [`../clients/REQUIREMENTS.md`](../clients/REQUIREMENTS.md) |
| 2 | Add Schedule | [`../schedule/REQUIREMENTS.md`](../schedule/REQUIREMENTS.md) (opens client picker first) |
| 3 | Client Sessions | [`../client_sessions/REQUIREMENTS.md`](../client_sessions/REQUIREMENTS.md) (opens client picker first) |
| 4 | Settings | [`../settings/REQUIREMENTS.md`](../settings/REQUIREMENTS.md) |

- Tap → standard route push into the destination module.
- No badges, counts, or live data on tiles in MVP — labels only. (Counts are easy to add post-MVP.)

## 4. Behavior

### 4.1 Refresh
- **Pull-to-refresh** at the top of the screen forces a re-fetch of today's appointments.
- Day rollover: if the user keeps the app open across midnight, the section auto-refreshes to the new day's appointments (rebuild driven by date-bounded Firestore query).

### 4.2 Navigation
- Tile taps push the destination module on the navigation stack.
- The back/system-back gesture from any sub-feature returns here.
- Trainer Home is the root of the trainer navigation stack — pressing the system back gesture here exits the PWA (or does nothing on iOS Safari).

### 4.3 Loading / Error
- Initial load: skeleton placeholder for the appointments list; tiles render immediately.
- Firestore stream error: inline error card above the list with a **Retry** button.

## 5. Out of Scope (MVP)
- Calendar view / future days from the home screen.
- Tile badges, counters, or live aggregates (outstanding sessions count, total clients, etc.).
- Trainer profile picture / avatar.
- Quick actions FAB (e.g. "Add one-off" shortcut).
- Search across appointments or clients from the home screen.
- Notifications / activity feed.
