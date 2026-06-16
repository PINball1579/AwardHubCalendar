# Award Hub — IT / Identity Team Requirements

**Prepared for:** Publicis IT / Identity & Access Management team
**Application:** Award Hub — an internal web app that shows award-show events from
the shared **awards@publicisgroupe.com** mailbox calendar and lets staff add those
events to their own Outlook calendar, kept automatically in sync.
**Date:** 2026-06-16

---

## 1. What the application does (1-minute summary)

- Staff sign in with their Publicis Microsoft 365 account.
- The app displays a calendar of award events sourced from the
  **awards@publicisgroupe.com** shared mailbox.
- When a staff member clicks **"Add to my calendar,"** the app creates a copy of
  that event in **their own** Outlook calendar.
- A background service watches the awards@ calendar; when the awards team edits or
  cancels an event, the app automatically updates or removes the copy in every
  staff member's calendar.

To do this without each user being online, the app uses **application
permissions** (a service identity) granted by admin consent — this is the main ask
below.

---

## 2. The ask (checklist for IT)

- [ ] **Register an application** in Entra ID (Azure AD), single tenant (Publicis).
- [ ] **Grant the Microsoft Graph application permission `Calendars.ReadWrite`**
      and **provide admin consent** (see §4).
- [ ] **Allow the delegated sign-in scopes** `openid`, `profile`, `email`
      (and `User.Read`) for user login (see §4).
- [ ] **Add the sign-in redirect URI** for the app's hosted URL (see §5).
- [ ] **Issue a client secret** (or certificate) for the app (see §5).
- [ ] **(Recommended) Scope the app** to a security group with an Exchange
      Application Access Policy for the pilot (see §6).
- [ ] **Confirm networking**: the app needs a public HTTPS endpoint reachable by
      Microsoft Graph for change notifications (see §7).
- [ ] **Provision file storage** (object storage + CDN) for attachments/downloads
      shown in the gallery (see §8a).
- [ ] **Return to the project team**: Directory (tenant) ID, Application (client)
      ID, and the client secret value (see §9).

---

## 3. Entra ID application registration

| Setting | Value |
|---|---|
| Application name | `Award Hub` |
| Supported account types | Single tenant — *Accounts in this organizational directory only (Publicis)* |
| Platform | Web |
| Redirect URI | `https://<award-hub-host>/api/auth/callback/azure-ad` (see §5) |
| Implicit/hybrid flows | Not required (standard authorization code flow) |

> `<award-hub-host>` is the final hosted hostname (e.g. an Azure App Service /
> Container Apps URL or an internal DNS name). For local testing during evaluation
> it would be `http://localhost:3000`.

> **Which directory:** the app **must** be registered in the **same Entra tenant
> that contains the mailbox** `mln-awardsgroupe@publicisgroupe.net` — i.e. the
> directory where `publicisgroupe.net` is a verified domain (shown as
> **"Publicis Groupe"** in our testing). Publicis spans multiple domains/tenants,
> so please confirm the Directory (tenant) ID matches the one that owns this
> mailbox; an app registered in any other directory cannot see it.

---

## 4. Microsoft Graph API permissions

The app uses **two** kinds of access:

### 4a. Application permission (service identity — REQUIRES ADMIN CONSENT)

| Permission | Type | Admin consent | Why it is needed |
|---|---|---|---|
| `Calendars.ReadWrite` | **Application** | **Required** | Read the awards@ shared mailbox calendar, subscribe to its change notifications, and create/update/delete event copies in staff members' calendars on their behalf (including while they are offline). |

This single application permission covers both reading the shared mailbox and
writing to user calendars. The app authenticates as itself (client-credentials
flow) — it does **not** need to be a delegate or member of the awards@ mailbox.

### 4b. Delegated permissions (user sign-in)

| Permission | Type | Admin consent | Why it is needed |
|---|---|---|---|
| `openid`, `profile`, `email` | Delegated | Per tenant policy | Sign staff in and read their identity (object id + work email) to know whose calendar to write to. |
| `User.Read` | Delegated | Usually user-consentable | Basic profile read for the signed-in user. |

> Note: the app does **not** read or write calendars using the user's delegated
> token — sign-in only identifies the person. All calendar reads/writes use the
> application permission in §4a.

### 4c. Confirmed source-mailbox identity

The shared mailbox is present in the Publicis tenant. Its **canonical identity**
(verified via Microsoft Graph) is:

| Attribute | Value |
|---|---|
| Display name | `AWARDSGROUPE_PUB_TH` |
| SMTP / mail alias | `awards@publicisgroupe.com` |
| **userPrincipalName (use this)** | **`mln-awardsgroupe@publicisgroupe.net`** |
| Object id | `f106ba3f-f1d5-4631-8f03-18745642634e` |

> Graph addresses mailboxes by **UPN or object id**, not by the SMTP alias —
> `GET /users/awards@publicisgroupe.com` returns 404. The app must be configured
> with `AWARDS_MAILBOX = mln-awardsgroupe@publicisgroupe.net` (or the object id).

### 4d. Smaller alternative for an early READ-ONLY pilot

If granting the tenant-wide **application** permission needs more review time, a
**read-only demo** of the awards@ → website direction can run with **delegated**
permissions instead:

- App registration with **delegated** `Calendars.Read.Shared` (often
  **user-consentable**, no tenant-wide admin consent), **and**
- The pilot user's account granted **Full Access** to the
  `mln-awardsgroupe@publicisgroupe.net` mailbox in Exchange (Outlook calendar
  *folder* sharing alone is **not** sufficient for Graph access — confirmed: a
  user with Outlook delegate access still gets `403 ErrorAccessDenied` from Graph
  without mailbox Full Access).

This read-only pilot cannot do the "add to my calendar" write-back or offline
auto-sync — those still require the application permission in §4a — but it lets
stakeholders see the real awards@ calendar on the website with a much smaller
grant.

---

## 5. Authentication configuration

- **Redirect URI (sign-in):** `https://<award-hub-host>/api/auth/callback/azure-ad`
- **Client secret:** Please issue a client secret (a certificate is also fine and
  preferred if policy requires). Note the **expiry date** so we can schedule
  rotation; the app reads the secret from a secure store (Azure Key Vault) and it
  is never committed to source code.
- **Token / sign-in:** standard OpenID Connect authorization code flow.

---

## 6. Security scoping (recommended)

`Calendars.ReadWrite` as an **application** permission is, by default,
**tenant-wide** — the service identity can read/write calendars in any mailbox.
To limit exposure, especially during the pilot, we recommend restricting the app:

- Create a **mail-enabled security group** containing only the mailboxes the app
  should touch (the **awards@publicisgroupe.com** mailbox **plus the pilot users**
  who will test "Add to my calendar").
- Apply an **Exchange Online Application Access Policy** binding the app
  registration to that group:
  ```powershell
  New-ApplicationAccessPolicy -AppId <application-client-id> `
    -PolicyScopeGroupId <award-hub-pilot-group> `
    -AccessRight RestrictAccess `
    -Description "Restrict Award Hub to awards mailbox + pilot users"
  ```
- **For full rollout:** every staff member who uses "Add to my calendar" must be
  in scope. Either expand the group to all staff, or remove the access policy for
  tenant-wide use — this is a decision for IT/security. We are happy to start
  pilot-scoped and review before broadening.

---

## 7. Networking requirements

- **Inbound (required for real-time sync):** Microsoft Graph must be able to reach
  a public **HTTPS** endpoint on the app at:
  ```
  https://<award-hub-host>/api/graph/notifications
  ```
  This receives Graph change notifications when awards@ events change. It needs a
  valid public TLS certificate and must be reachable from Microsoft's Graph
  notification service. (If a public inbound endpoint is not possible, the app
  still works via a periodic poll as a fallback, but real-time updates would be
  delayed by up to ~10 minutes.)
- **Outbound (required):** the app/host must be allowed to call:
  - `https://login.microsoftonline.com` (token acquisition)
  - `https://graph.microsoft.com` (calendar reads/writes, subscriptions)

---

## 8. Hosting & data handling (informational)

- **Recommended hosting:** Azure (App Service or Container Apps) running two
  processes — the web app and a small background worker — plus **Azure Database
  for PostgreSQL** and **Azure Key Vault** for the client secret.
- **Data stored:** award event details copied from the awards@ calendar, a mapping
  of which staff member (Entra object id + work email) added which event, and any
  **uploaded/curated files** shown in the gallery (see §8a).
- **Data NOT stored:** no passwords, no mailbox message content, no calendar data
  beyond the awards@ events and the app's own event copies.

---

## 8a. File storage & attachments (gallery / downloads)

The website serves **downloadable files** — a gallery **plus per-award "Entry Kit"
PDFs** (Award Info → *Download Entry Kit*) and similar assets/briefs. These files
are **placed directly into storage by the development team** — there is **no
end-user or admin upload feature in the app**. They need object storage in addition
to the PostgreSQL database:

- **Provision:** an **Azure Blob Storage** account/container (or equivalent object
  store), optionally fronted by a **CDN** for fast delivery, with **write access
  for the development/deployment team** to place the files.
- **Access model:** files are served via the app — either a **private container
  with short-lived signed URLs (SAS)**, or a **read-only public/CDN container** if
  the Entry Kits are non-sensitive material. Either is fine; we'll follow your
  preference.
- **No upload-security review needed from this app:** because only the dev team
  places trusted files (no untrusted user/admin uploads), **AV scanning and
  upload-DLP controls are not triggered** by this feature. Baseline storage
  security still applies.
- **Retention:** advise any retention/deletion policy the stored files must follow.

---

## 8b. Governance gates (typical for an internal Publicis app)

Not blockers for development, but usually required before go-live — please confirm
which apply and their lead times:

- **Security review / penetration test** of the app.
- **Data privacy / GDPR assessment** (the app stores staff identifiers + files).
- **Accessibility (WCAG)** review.
- **DNS record + TLS certificate** for the app's public hostname (also used by the
  Graph webhook endpoint in §7).
- An **access-control security group** defining who may use the app and who are
  **admins**.

---

## 9. What IT returns to the project team

Once registration and consent are complete, please provide:

1. **Directory (tenant) ID**
2. **Application (client) ID**
3. **Client secret value** (shared securely) **and its expiry date**
4. Confirmation that **admin consent for `Calendars.ReadWrite` (Application)** has
   been granted.
5. (If applied) confirmation of the **Application Access Policy** and the pilot
   group used.

These are loaded into the app's configuration (`AZURE_TENANT_ID`,
`AZURE_CLIENT_ID`, `AZURE_CLIENT_SECRET`) via the secure secret store.

---

## 10. Open questions for IT

1. Are you comfortable granting `Calendars.ReadWrite` (Application) with admin
   consent, scoped to a pilot group first (per §6)?
2. Can the app's `/api/graph/notifications` endpoint be exposed as a public HTTPS
   endpoint (per §7)? If not, we will use the polling fallback.
3. Any standard for client **secret vs. certificate** and rotation period we
   should follow?
4. Preferred hosting location / subscription for the Azure resources?
