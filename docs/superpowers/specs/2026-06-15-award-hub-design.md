# Award Hub — Design Spec

**Date:** 2026-06-15
**Status:** Approved (brainstorming complete)

## Overview

An internal Publicis web app that displays a calendar of award events sourced
from the **awards@publicisgroupe.com** shared mailbox. Staff sign in with their
Publicis Microsoft 365 account, browse the calendar, and click **"Add to my
calendar"** on any event. The event is copied into their personal Outlook
calendar and kept automatically in sync: if the awards@ team edits or deletes a
source event, every user's copy is updated or removed silently.

## Decisions (from brainstorming)

| Topic | Decision |
|-------|----------|
| Users | Internal Publicis staff only, all inside the Publicis M365 / Entra ID tenant |
| Event source | **Outlook only, one-way.** awards@ owns events; the website never writes back to the shared mailbox |
| Sync approach | **Approach A** — copy real events into each user's calendar via Microsoft Graph; a background watcher keeps them synced |
| Auth model | App-level (application) Graph permissions via admin consent. User sign-in only identifies the person; calendar writes use the app identity, so no per-user tokens are stored |
| Change handling | **Fully synced** — edits propagate to all copies; deletes/cancellations remove all copies. Silent (no extra notifications) |
| Tech stack | Next.js + TypeScript, Microsoft Graph SDK, PostgreSQL, hosted on Azure |

## Architecture

```
awards@ Outlook calendar (source of truth)
        │  Graph change notifications (webhook) + calendarView delta (safety net)
        ▼
┌──────────────────────────────────────────────┐
│  Award Hub (Azure)                            │
│  Next.js app ── API routes ── PostgreSQL      │
│       │                          │            │
│  Background worker ◄── event cache + sub map  │
│   • renews Graph webhook subscriptions        │
│   • processes change notifications            │
│   • reconciles via delta query (safety net)   │
│   • writes/updates/deletes user calendar copies│
└──────────────────────────────────────────────┘
        │ Graph API (application permissions)
        ▼
Each user's personal Outlook calendar
```

**Auth:** "Sign in with Microsoft" (Entra ID), restricted to the Publicis tenant.
Sign-in identifies the user (object id + email). All calendar reads/writes use
**application permissions** (`Calendars.ReadWrite`) granted by admin consent, so
the worker can act while users are offline.

## Data model (PostgreSQL)

- **events** — cache of awards@ source events: `source_event_id`, `title`,
  `start`, `end`, `is_all_day`, `location`, `description`, `last_modified`,
  `status` (active/cancelled).
- **subscriptions** — user↔event mapping: `user_id` (Entra object id),
  `user_email`, `source_event_id`, `copied_event_id` (id in the user's calendar),
  `state` (synced/failed), timestamps.
- **graph_subscriptions** — active Graph webhook subscription id + expiry.
- **sync_log** — audit trail of pushes/updates/deletes.

## Key flows

1. **Read sync (awards@ → Hub):** Graph notification → worker runs `calendarView`
   delta → upserts `events`. A scheduled delta reconciliation runs periodically as
   a safety net for missed notifications.
2. **Add to my calendar:** User click → create a copy in their Outlook calendar →
   store `copied_event_id` in `subscriptions`.
3. **Propagate edit:** Source change → update every copy for that `source_event_id`.
4. **Propagate delete/cancel:** Source removed → delete every copy, mark
   subscriptions removed.

## Error handling & resilience

- Graph calendar webhook subscriptions expire (~3 days max) → worker renews on a
  schedule before expiry.
- Missed-notification safety net via periodic delta reconciliation.
- Graph throttling (429) → retry with backoff; per-user write failures recorded in
  `subscriptions.state=failed` and retried, never blocking other users.
- Idempotent writes keyed on `(user_id, source_event_id)` so retries don't create
  duplicates.

## Testing

- **Unit:** Graph↔local mappers, sync decision logic.
- **Integration:** API routes + DB with a mocked Graph client.
- **E2E:** sign in → see calendar → add event → simulate source edit/delete →
  assert copy updated/removed.
- Target 80%+ coverage on sync logic.

## Out of scope (v1, YAGNI)

- Categories/filtering, search, website-side event creation, external users,
  per-user notifications/emails.
