# Award Hub — Real Outlook ↔ Website Sync Demo

This shows the **actual** product behavior: create/edit an event in an Outlook
calendar and watch it appear/update on the website (and in users' own calendars).

> Unlike the sample demo (`DEMO.md`), this needs **live Microsoft Graph
> credentials** — there is no way to talk to real Outlook without them. You have
> two ways to get those credentials:
>
> - **Path A — Self-serve (fastest):** a free **Microsoft 365 Developer tenant**
>   that you fully control (instant admin, includes Outlook/Exchange + test users).
>   Best for demoing today without waiting on Publicis IT.
> - **Path B — Publicis tenant:** wait for IT to complete the registration in
>   `docs/IT-REQUIREMENTS.md`, then plug in the values they return.
>
> The app steps are identical for both; only how you obtain the credentials differs.

---

## Path A — Self-serve with a Microsoft 365 Developer tenant

### 1. Get a developer tenant (one-time, free)
- Sign up at **https://developer.microsoft.com/microsoft-365/dev-program**.
- This gives you an admin account, an `*.onmicrosoft.com` domain, Outlook/Exchange,
  and sample users — all of which you control.

### 2. Register the app (Entra admin center → App registrations → New registration)
- Name: `Award Hub`, account type: **single tenant**.
- After creating, copy the **Directory (tenant) ID** and **Application (client) ID**.

### 3. Grant Graph permissions
- **API permissions → Add → Microsoft Graph → Application permissions →
  `Calendars.ReadWrite`**, then click **Grant admin consent** (you can, since you're
  the dev-tenant admin).
- Also add **Delegated**: `openid`, `profile`, `email`, `User.Read` (for sign-in).

### 4. Add the sign-in redirect URI
- **Authentication → Add a platform → Web →** `http://localhost:3000/api/auth/callback/azure-ad`.

### 5. Create a client secret
- **Certificates & secrets → New client secret → copy the value** (you can't see it again).

### 6. Choose the "awards" mailbox
- Pick any mailbox in your dev tenant to play the role of `awards@...` — e.g. your
  admin account, or a shared mailbox you create. Note its email address.

---

## Configure the app (both paths)

Edit the gitignored `.env` and fill in the real values, and **turn demo mode off**:

```ini
DATABASE_URL="postgresql://postgres:postgres@localhost:5433/awardhub"

AZURE_TENANT_ID="<tenant-id>"
AZURE_CLIENT_ID="<client-id>"
AZURE_CLIENT_SECRET="<client-secret-value>"

AWARDS_MAILBOX="<the-mailbox-you-chose@yourtenant.onmicrosoft.com>"

NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="<any-random-string>"
PUBLIC_BASE_URL="http://localhost:3000"
GRAPH_NOTIFICATION_CLIENT_STATE="<any-random-string>"

# IMPORTANT: remove or comment out these two lines so the app uses REAL Graph:
# DEMO_MODE="true"
# NEXT_PUBLIC_DEMO_MODE="true"
```

Clear the sample/demo events so you start clean (one-time):

```bash
/opt/homebrew/opt/postgresql@16/bin/psql \
  "postgresql://postgres:postgres@localhost:5433/awardhub" \
  -c 'DELETE FROM "Subscription"; DELETE FROM "Event"; DELETE FROM "DeltaCursor";'
```

---

## Run the demo

### Step 1 — Create an event in Outlook
In **Outlook on the web**, signed in as the awards mailbox (or with delegate
access to it), create a calendar event, e.g. **"Test Award Deadline"** on a date
in the current month.

### Step 2 — Sync it into the website
```bash
npm run sync:once
```
You should see `Sync complete. N active event(s) in the website cache.`

### Step 3 — See it on the website
```bash
npm run dev
```
Open **http://localhost:3000**, sign in with a **real** tenant user (Microsoft
login now appears — demo mode is off), and your "Test Award Deadline" event shows
on the calendar.

### Step 4 — Add it to a user's real calendar
Click the day → **"Add to my calendar."** Open that signed-in user's **own**
Outlook calendar — the event copy is really there.

### Step 5 — Edit in Outlook, watch it sync
Change the event's **date or title** in the awards Outlook calendar, then:
```bash
npm run sync:once
```
Refresh the website (and check the user's Outlook copy) — both reflect the change.

### Step 6 — Cancel in Outlook
Delete/cancel the event in the awards calendar, run `npm run sync:once` again — it
disappears from the website and from the user's calendar.

---

## Making it real-time (optional)

`npm run sync:once` is the snappiest way to drive a live demo. To remove the manual
step:

- **Polling:** run `npm run worker` in another terminal — it runs the sync every
  10 minutes automatically (and renews the Graph subscription).
- **Instant webhooks:** expose the app publicly (e.g. `ngrok http 3000`), set
  `PUBLIC_BASE_URL` to the public URL, and run the worker — Microsoft Graph will
  then push changes to `/api/graph/notifications` within seconds.

---

## Notes & gotchas

- **App permissions are tenant-wide** for `Calendars.ReadWrite (Application)` — fine
  in your own dev tenant; in the Publicis tenant IT may scope it to a pilot group
  (see `docs/IT-REQUIREMENTS.md` §6).
- The signed-in user you "Add to my calendar" as must be in the **same tenant** as
  the credentials.
- If `npm run sync:once` fails with an auth error, re-check the three `AZURE_*`
  values and that **admin consent** was granted for `Calendars.ReadWrite`.
- Local Postgres runs on **port 5433** here (an existing PostgreSQL owns 5432).
