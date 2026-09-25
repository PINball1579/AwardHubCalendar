# Security notes

What the application enforces itself, and what must be configured around it.
Written against the August 2026 penetration test.

## Fixed in the application

| Finding | Fix |
| --- | --- |
| Vulnerable, unsupported Next.js | Next 16.3.3, NextAuth 4.24.15, React 19, Prisma 7.10.0, PostCSS 8.5.26. `npm audit` reports 0 vulnerabilities for prod and dev. |
| Passwordless production auth bypass | `src/lib/demoMode.ts` aborts startup — including `next build` — if `DEMO_MODE` or `NEXT_PUBLIC_DEMO_MODE` is `true` while `NODE_ENV=production`. The demo provider and fake Graph gateway are additionally gated behind `isDemoMode()`, which always returns `false` in production. |
| Webhook validation and abuse controls | `src/lib/api/notifications.ts` schema-validates the body, caps it at 100 items / 64 KB, compares `clientState` in constant time, and checks `subscriptionId`, `tenantId` and `resource` against the subscription we created. The route rate-limits, rejects oversized bodies with 413, and persists accepted deliveries before returning 202. |
| Missing security headers | `next.config.mjs` sets CSP, HSTS, `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`, COOP/CORP, and disables `X-Powered-By`. |
| Internal error disclosure | `src/app/api/subscriptions/route.ts` returns `"Event not found"`, `"Too many requests"` or a generic `"Internal server error"`. Graph and Prisma details are logged server-side only. |
| Unrestricted site access | `ACCESS_GROUP_ID` gates sign-in on membership of the same security group that scopes Graph (`decideAccess()` in `src/lib/auth.ts`). Fails closed. |
| Non-idempotent calendar creation | `src/lib/api/addToCalendar.ts` claims the `(userId, sourceEventId)` unique row *before* calling Graph, so only one request can create the Outlook event. Losers return the existing copy or get `409`. |

## Must be configured outside the application

### 1. Scope the service principal with a mail-enabled security group (highest priority)

**Decision (2026-08-27):** one mail-enabled security group contains the awards
mailbox **plus every employee authorised to use "Add to my calendar"**. Rolled
out to pilot users first, then widened. The same group also authorises access to
the site itself.

`Calendars.ReadWrite` as an **application** permission otherwise reaches *every*
mailbox in the tenant, and the code cannot narrow that — a stolen credential
reaches all mailboxes regardless of what the app does.

Scoping to `awards@` alone is not an option: `createUserEvent` writes to
`/users/{userId}/events`, i.e. each staff member's own calendar
(`src/lib/graph/realGateway.ts:52`). A group holding only the awards mailbox
would block every write-back.

```powershell
New-DistributionGroup -Name "AwardHub-Scope" -Type Security `
  -Members "awards@publicisgroupe.com","pilot.one@publicisgroupe.com","pilot.two@publicisgroupe.com"

New-ApplicationAccessPolicy `
  -AppId <AZURE_CLIENT_ID> `
  -PolicyScopeGroupId "AwardHub-Scope@publicisgroupe.com" `
  -AccessRight RestrictAccess `
  -Description "Award Hub may access the awards mailbox and authorised users only"
```

Verify both directions before and after each expansion — a pilot user must be
`Granted`, a non-member `Denied`:

```powershell
Test-ApplicationAccessPolicy -Identity awards@publicisgroupe.com   -AppId <AZURE_CLIENT_ID>
Test-ApplicationAccessPolicy -Identity pilot.one@publicisgroupe.com -AppId <AZURE_CLIENT_ID>
Test-ApplicationAccessPolicy -Identity not.a.user@publicisgroupe.com -AppId <AZURE_CLIENT_ID>
```

Policy changes take up to ~30 minutes to propagate in Exchange Online. Adding
someone to the group is the single step that grants both mailbox write-back and
site access.

#### Using the same group to authorise site access

Set `ACCESS_GROUP_ID` to the group's **object id**. `decideAccess()` in
`src/lib/auth.ts` then rejects sign-in from anyone outside it
(`tests/lib/security/accessGroup.test.ts`).

This requires the **groups optional claim** on the app registration, or nobody
can sign in — the check fails closed by design:

> App registration → Token configuration → Add groups claim → **Groups assigned
> to the application** (not "All groups", which risks a token-size overage) →
> tick **ID**.

Then assign the group to the enterprise application. Belt and braces: also set
Enterprise application → Properties → **Assignment required = Yes**, so Entra
itself turns away non-members before the app is ever reached.

Leaving `ACCESS_GROUP_ID` unset preserves the old behaviour — any tenant user who
can sign in is allowed. Server logs say precisely why a sign-in was refused
(`not-a-member`, `claim-missing`, `claim-overage`).

### 2. Prefer credentials that aren't a shared secret

Set `GRAPH_CREDENTIAL` (see `.env.example`):

- `managed-identity` — no secret material exists. Preferred when hosting on
  Azure Container Apps / App Service.
- `certificate` — private key stays in the key store; set `GRAPH_CLIENT_CERTIFICATE_PATH`.
- `secret` — fallback. Store in Key Vault and rotate on a schedule.

User sign-in still uses `AZURE_CLIENT_SECRET`; that is a delegated OAuth flow
and is unrelated to the tenant-wide application permission.

### 3. Put a WAF / gateway rate limit in front of `/api/graph/notifications`

`src/lib/api/rateLimit.ts` is **in-process**: it protects one instance and its
counters are not shared between replicas. It is a backstop, not a substitute for
an edge control. Configure Azure Front Door / Application Gateway WAF to
rate-limit the webhook path and, if possible, allow only Microsoft Graph's
published notification IP ranges.

### 4. Rotate `GRAPH_NOTIFICATION_CLIENT_STATE`

It is the shared secret that authenticates webhook deliveries. Keep it in Key
Vault and rotate it whenever the Graph subscription is recreated.

## Accepted residual risk: `script-src 'unsafe-inline'`

**Decision (2026-08-27):** static rendering is kept for launch and the
`'unsafe-inline'` script source is accepted as residual risk. Revisit
post-launch.

**What is mitigated.** The policy pins scripts, styles, images, fonts and
connections to this origin, blocks plugins (`object-src 'none'`), forbids
framing (`frame-ancestors 'none'`), and locks `base-uri` and `form-action`. An
attacker cannot load script from an external origin, exfiltrate to an arbitrary
endpoint, reframe the site, or repoint form submissions.

**What is not.** `'unsafe-inline'` means CSP will not stop an injected inline
`<script>`. CSP is the second line of defence here; the first is that the app
renders no user-supplied HTML and uses React's default escaping throughout.

**Why it is not simply fixed.** The pages are statically prerendered, so their
HTML is produced at build time and cannot carry a per-request nonce. Nonce-based
CSP requires dynamic rendering — verified experimentally: with nonce +
`'strict-dynamic'` against static pages, every chunk was blocked and the app did
not hydrate.

**Revisit when** any of these becomes true:

- the app starts rendering user-supplied or third-party content;
- it is exposed beyond the internal tenant;
- a dependency with a client-side XSS advisory ships;
- the next penetration test, whichever comes first.

**How to close it, when you do.** Add to each page route:

```ts
// src/app/{page,calendar/page,gallery/page,awards-info/page}.tsx
export const dynamic = "force-dynamic";
```

Then issue a nonce from `middleware.ts` and set the CSP header on **both** the
forwarded request (Next reads the nonce from there to stamp its own script tags
— setting it only on the response is the trap; the chunks get blocked) and the
response, with `script-src 'self' 'nonce-…' 'strict-dynamic'`. The cost is
static prerendering and CDN cacheability.

## Verifying

```bash
npm audit --omit=dev          # expect: 0 vulnerabilities
npm test                      # expect: all green, incl. tests/lib/security/**
DEMO_MODE=true NODE_ENV=production npm run build   # expect: refuses to start

# headers
curl -sI https://<host>/ | grep -iE 'content-security|strict-transport|x-frame|nosniff'

# webhook rejects junk without leaking anything
curl -s -o /dev/null -w '%{http_code}\n' -X POST https://<host>/api/graph/notifications \
  -H 'Content-Type: application/json' -d 'null'      # expect: 202, empty body
```
