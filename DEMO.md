# Award Hub — Local Demo

This guide lets you try out the Award Hub calendar on your Mac without any
Microsoft/Azure setup. Everything runs locally.

## One-time setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Load some sample award events into the local database:

   ```bash
   npm run seed:demo
   ```

   This fills the calendar with realistic award deadlines and ceremonies
   around June 2026 (plus one in May and one in July), so you can try
   navigating between months.

   (The local database runs on Postgres at port **5433** — this is already
   configured for you in `.env`.)

## Running the demo

1. Start the app:

   ```bash
   npm run dev
   ```

2. Open [http://localhost:3000](http://localhost:3000) in your browser.

3. Click **Enter demo**. You won't need a Microsoft account or password —
   this signs you in as a demo user instantly.

## What to try

- Use the **‹** and **›** buttons to browse between months (May, June, and
  July 2026 all have sample events).
- Click on **June 12** to see the "Cannes Lions 2026 — Entry Deadline" entry.
- Click **Add to my calendar** on any event and you should see a confirmation
  message.

> **Note:** In demo mode, "Add to my calendar" is simulated — it records the
> action locally but does not create a real event in Outlook. Once IT
> completes the Microsoft Graph/Azure setup, the same button will create a
> real event in your actual Outlook calendar.

## Turning demo mode off

Demo mode is controlled by two lines in the `.env` file:

```
DEMO_MODE="true"
NEXT_PUBLIC_DEMO_MODE="true"
```

To go back to the normal Microsoft sign-in flow, remove (or comment out)
those two lines from `.env` and restart `npm run dev`.
