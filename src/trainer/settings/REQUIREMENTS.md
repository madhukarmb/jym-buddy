# Settings (Trainer) — Detailed Requirements

Module path: `src/trainer/settings/`
Parent feature: Trainer home → Sub-menu Tile 4 (see [BRD §4.2](../../../BRD.md)).

## 1. Purpose
Show basic account info and provide the **Logout** action. Placeholder home for future settings.

## 2. Entry Point
- Trainer home → tap **Settings** tile.

## 3. Content
- Logged-in trainer's name and email (read-only).
- **Logout** button.

## 4. Logout Behavior
- Tap **Logout** → confirmation dialog ("Log out?").
- On confirm:
  - Clear the authenticated session.
  - Navigate back to the login screen.
- On cancel: stay on the Settings screen.

## 5. Out of Scope (MVP)
- Editing the trainer's profile (name, email, password, picture).
- Theme, notification, or language preferences.
- Account deletion.
