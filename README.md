# Award Hub

Internal Publicis calendar app. Shows award events from the
`awards@publicisgroupe.com` shared mailbox and lets staff copy any event into
their own Outlook calendar, kept in sync automatically.

## Prerequisites

- Node 20.9+ (Next.js 16), PostgreSQL 14+
- An Entra ID app registration with **admin-consented application permissions**:
  - `Calendars.ReadWrite` (Application) — read awards@ + write user calendars
  - A client secret

## Azure app registration (ask IT / tenant admin)

1. Register an app in Entra ID.
2. Add application permission `Calendars.ReadWrite`, then **Grant admin consent**.
3. Add a redirect URI `https://<host>/api/auth/callback/azure-ad` for user sign-in.
4. Create a client secret; put values in `.env` (see `.env.example`).

## Local setup

```bash
cp .env.example .env   # fill in values
createdb awardhub
npx prisma migrate deploy
npm run dev             # web app on :3000
npm run worker         # background sync in a second terminal
```

For Graph webhooks in dev, expose the app publicly (e.g. `ngrok http 3000`) and
set `PUBLIC_BASE_URL` to the public URL.

> **Local DB port note:** PostgreSQL defaults to port 5432. If 5432 is already
> in use (e.g. another Postgres install), run your dev Postgres on a different
> port and point `DATABASE_URL` at it. This development machine uses **5433**
> for exactly this reason — see the gitignored `.env` / `.env.test`.

## Security

Hardening notes, and the Exchange/WAF configuration that must be applied
outside the app, are in [SECURITY.md](./SECURITY.md). Two things to know before
deploying:

- **Demo mode cannot run in production.** The app refuses to start — including
  `next build` — if `DEMO_MODE` or `NEXT_PUBLIC_DEMO_MODE` is `true` while
  `NODE_ENV=production`. Unset them in every deployed environment.
- **The Graph service principal must be scoped in Exchange.** The
  `Calendars.ReadWrite` application permission reaches every mailbox in the
  tenant until an `ApplicationAccessPolicy` narrows it.

## Tests

```bash
createdb awardhub_test
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/awardhub_test npx prisma migrate deploy
npm test               # unit + integration (tests load .env.test for the DB URL)
npm run e2e            # playwright
```

## Deployment (Azure)

- Host the Next.js app and the worker as two processes (e.g. Azure Container
  Apps: one ingress app, one background job/replica).
- Use Azure Database for PostgreSQL.
- Store secrets in Azure Key Vault; the worker needs the same env as the app.
- Ensure `PUBLIC_BASE_URL` is the app's public HTTPS URL so Graph can deliver
  notifications to `/api/graph/notifications`.

## How sync works

- The worker keeps a Graph change-notification subscription on awards@ events and
  renews it before its ~3-day expiry.
- On each notification (and every 10 minutes as a safety net), the worker runs a
  `calendarView` delta, updates the local cache, and propagates each change to
  every user who added that event (create/update/delete their copy).
- Writes use application permissions, so updates happen even when users are
  offline.
