# Reliable auth emails — Brevo SMTP in Supabase

Supabase sends the **confirm-signup** and **reset-password** emails (E1-B / E1-C,
epic #82). Its built-in sender is rate-limited (~2–3/hour) and marked
"testing only" — fine for a quick try, not for a pilot. Point Supabase at
**Brevo SMTP** for reliable delivery.

> Note: this is a **separate credential** from the Brevo **API key** the app
> already uses for reminder emails (`src/lib/brevo.ts`). SMTP needs its own key.

## 1. Brevo — get SMTP credentials

Brevo dashboard → **SMTP & API → SMTP** tab. You'll see:

- **SMTP server:** `smtp-relay.brevo.com`
- **Port:** `587`
- **Login:** your Brevo account email (shown on that page)
- **Password:** click **Generate a new SMTP key** → copy it (shown once)

## 2. Brevo — authenticate a sender

Brevo won't deliver from an unverified sender.

- **For quick testing:** Brevo → **Senders → Senders** → add and verify a single
  sender email (e.g. your own address). You can send from that address
  immediately after clicking the verification link.
- **For the pilot (recommended):** authenticate a **domain** you control
  (Brevo → **Senders → Domains → Authenticate**). Brevo gives you DNS records to
  add at your registrar:
  - **SPF** — add `include:spf.brevo.com` to the domain's SPF TXT record
  - **DKIM** — the `brevo._domainkey` TXT record Brevo shows
  - **DMARC** (recommended) — a `_dmarc` TXT record
  - a one-off Brevo verification TXT record
  You can't do domain auth on the `*.vercel.app` host (you don't own its DNS),
  so production wants a real sending domain.

## 3. Supabase — enable Custom SMTP

Supabase dashboard → **Authentication → Emails → SMTP Settings** →
enable **Custom SMTP**:

| Field | Value |
|---|---|
| Sender email | the **verified** Brevo sender (step 2) |
| Sender name | `Teasoo SET` |
| Host | `smtp-relay.brevo.com` |
| Port | `587` |
| Username | your Brevo account email (SMTP login) |
| Password | the **SMTP key** from step 1 |
| Minimum interval | `60` (seconds; adjust as needed) |

Save. Then **Authentication → Rate Limits** → raise **"Rate limit for sending
emails"** above the built-in default (e.g. 30–100/hour) — with the built-in
default left in place, custom SMTP is still throttled.

## 4. Confirm-email toggle (decide the sign-up UX)

Supabase → **Authentication → Providers → Email → Confirm email**:

- **Off** — new accounts sign in immediately (simplest for the pilot). No
  confirmation email is sent; reset emails still send.
- **On** — new users must click a confirmation link before signing in.

The app (#82) handles both. Turn it **on** before real launch once SMTP is live.

## 5. Redirect URLs (already done for #23)

Reset links route through `/auth/callback?next=/account/update-password`. The
`/auth/callback` origins are already on Supabase's **Redirect URLs** allow-list
from the Entra work, so no change is needed.

## 6. Test

1. Supabase → **Authentication → Emails** → **Send test email** (quickest check
   the SMTP settings are valid).
2. In the app: **Forgot password?** → enter your email → the reset email should
   arrive within seconds → link sets a new password and signs you in.
3. If nothing arrives: check **Brevo → Transactional → Logs** for the attempt,
   and confirm the Supabase **Sender email** exactly matches a verified Brevo
   sender.

## Optional — match the house voice

Supabase's default auth email templates (Authentication → Emails → Templates)
are generic. You can rewrite them in the plain-English, one-clear-action GDS
style used for the app's own emails (`src/lib/emails.ts`) — subject leads with
the key fact, one obvious button, no jargon.
