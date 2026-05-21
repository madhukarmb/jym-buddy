# Settings (Client) — Detailed Requirements

Module path: `src/client/settings/`
Parent feature: Client home → Settings entry (see [BRD §5](../../../BRD.md)).

## 1. Purpose
Show basic account info and provide the **Logout** action.

## 2. Entry Point
- Client home → tap **Settings** entry.

## 3. Content
- Logged-in client's name and email (read-only).
- **Logout** button.

## 4. Logout Behavior
- Tap **Logout** → confirmation dialog ("Log out?").
- On confirm:
  - Clear the authenticated session.
  - Navigate back to the login screen.
- On cancel: stay on the Settings screen.

## 5. Out of Scope (MVP)
- Editing the client's profile (name, email, password, picture).
- Theme, notification, or language preferences.
- Account deletion.
