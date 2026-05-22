# Clients — Detailed Requirements

Module path: `src/trainer/clients/`
Parent feature: Trainer home → Sub-menu Tile 1 (see [BRD §4.2](../../../BRD.md)).

## 1. Purpose
Provide the Trainer with a single place to **see all enrolled clients** and to **enrol new clients**. This module is the entry point for all client-management flows.

## 2. Entry Point
- Trainer home screen → tap **Clients** tile.
- Navigates to the Clients list screen.

## 3. Clients List Screen

### 3.1 Content
- Displays all enrolled clients in a scrollable list.
- Each row shows:
  - Profile picture (or placeholder avatar if none).
  - Client name.
  - Client email.
- Empty state: when no clients are enrolled, show a message ("No clients yet") and prominently surface the **Enrol Client** action.

### 3.2 Actions
- **Enrol Client** button (e.g., floating action button or top-right action) → opens the Enrol Client flow.
  - See [enrol_client/REQUIREMENTS.md](./enrol_client/REQUIREMENTS.md) for full enrolment details.
- **Tap a client row** → opens the Client Detail screen.
  - See [client_detail/REQUIREMENTS.md](./client_detail/REQUIREMENTS.md) for full details.

### 3.3 Ordering
- Default sort: by name, ascending.

## 4. Behavior
- After a successful enrol, the trainer is returned to the Clients list and the new client appears in the list immediately.

## 5. Out of Scope (MVP)
- Search / filter on the clients list.
- Client detail view, editing, or deletion.
- Sorting options beyond the default.
- Pagination (assume client counts are small for MVP).

## 6. Sub-modules
- [`enrol_client/`](./enrol_client/) — form to create a new client account.
- [`client_detail/`](./client_detail/) — per-client landing screen with active schedules and shortcuts to Add Schedule / View Sessions.
