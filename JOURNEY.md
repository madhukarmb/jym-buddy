# User Journey — Simple Gym Buddy

End-to-end flow for Trainer and Client roles. Diagram is in **Mermaid**; paste into Lucidchart via *File → Import Diagram → Mermaid*, or view directly on GitHub / any Mermaid-aware viewer.

```mermaid
flowchart TD
    Start([App Launch]) --> Login[/"Login Screen<br/>username + password"/]
    Login -->|Trainer credentials<br/>4 seeded accounts| THome([Trainer Home])
    Login -->|Client credentials| CHome([Client Home])

    %% ===== TRAINER HOME =====
    subgraph TrainerJourney [Trainer Journey]
        direction TB

        THome --> TodaySec["Section 1:<br/>Today's Appointments"]
        THome --> T1[Tile 1: Clients]
        THome --> T2[Tile 2: Add Schedule]
        THome --> T3[Tile 3: Client Sessions]
        THome --> T4[Tile 4: Settings]

        %% Today's Appointments
        TodaySec --> ApptList["Today's appointment rows"]
        ApptList --> ActCheckin[Check-in]
        ApptList --> ActNoShow[No Show]
        ApptList --> ActResched["Reschedule<br/>(original hidden,<br/>new appointment created)"]
        ApptList --> ActCancel["Cancel<br/>(single instance only)"]

        %% Clients tile
        T1 --> ClientsList[Clients List]
        ClientsList --> EnrolBtn[Enrol Client button]
        ClientsList --> TapRow[Tap client row]
        EnrolBtn --> EnrolForm["Enrol Form:<br/>pic, name, email, password"]
        EnrolForm -->|Save| ClientsList
        TapRow --> ClientDetail["Client Detail<br/>profile + active schedules"]

        ClientDetail --> EndSched["End Schedule<br/>(endDate = today,<br/>future appts removed)"]
        ClientDetail --> AddSchedSC["Add Schedule<br/>(pre-selected client)"]
        ClientDetail --> ViewSessSC["View Sessions<br/>(pre-selected client)"]

        %% Add Schedule
        T2 --> Picker1[Client Picker]
        Picker1 --> SchedForm[Schedule Form]
        AddSchedSC --> SchedForm
        SchedForm --> Recurring["Recurring<br/>weekdays + times +<br/>optional end date"]
        SchedForm --> OneOff["One-off<br/>single date/time"]
        Recurring -->|"Save → materialise<br/>Appointments (60-day window)"| THome
        OneOff -->|"Save → 1 Appointment<br/>(scheduleId = null)"| THome

        %% Client Sessions (Billing Ledger)
        T3 --> Picker2[Client Picker]
        Picker2 --> Ledger["Billing Ledger<br/>Outstanding count + list"]
        ViewSessSC --> Ledger
        Ledger --> BackFill["Back-fill<br/>Check-in / No Show<br/>on past unmarked rows"]
        BackFill --> Ledger
        Ledger --> CloseBilling["Close Billing<br/>(select sessions, all default;<br/>amount paid required)"]
        CloseBilling -->|"Confirm → selected billed,<br/>unselected stay outstanding"| Ledger

        %% Settings
        T4 --> SettingsT["Settings<br/>name/email + Logout"]
    end

    %% ===== CLIENT HOME =====
    subgraph ClientJourney [Client Journey]
        direction TB
        CHome --> CValidate[Validate Attendance]
        CHome --> CSettings["Settings<br/>name/email + Logout"]
    end

    %% Logout returns to login
    SettingsT -->|Logout| Login
    CSettings -->|Logout| Login

    %% Styling
    classDef tile fill:#e3f2fd,stroke:#1976d2,color:#0d47a1
    classDef action fill:#fff3e0,stroke:#f57c00,color:#e65100
    classDef terminal fill:#f3e5f5,stroke:#7b1fa2,color:#4a148c
    classDef home fill:#e8f5e9,stroke:#388e3c,color:#1b5e20

    class T1,T2,T3,T4 tile
    class ActCheckin,ActNoShow,ActResched,ActCancel,EnrolBtn,EndSched,AddSchedSC,ViewSessSC,BackFill,CloseBilling action
    class Login,Start terminal
    class THome,CHome home
```

## Legend

- **Green** — Home screens (entry hubs after login).
- **Blue** — Tiles (sub-menu entry points on Trainer home).
- **Orange** — Actions the user can take.
- **Purple** — Entry/exit points (launch, login).

## Notes

- Trainer authentication uses 4 pre-seeded accounts; no trainer sign-up exists.
- Clients are created exclusively by the trainer via Clients → Enrol Client.
- Recurring schedules materialise Appointments into a rolling 60-day window; the same Appointment table feeds Today's Appointments and the Client Sessions ledger.
- Reschedule and Cancel on Today's Appointments affect a single instance — never the parent recurring Schedule.
- An entire recurring Schedule is ended from Client Detail (sets endDate = today, removes future scheduled Appointments, preserves past for billing history).
- Client Sessions is a per-client billing ledger: outstanding count = past `checked_in` + `no_show` sessions that haven't been included in a BillingClosure. Closing billing requires an amount paid. All outstanding sessions are selected by default; the trainer may unselect specific sessions to support partial payments (unselected sessions remain outstanding).
- Settings on both roles currently houses only Logout; reserved as the home for future settings.
