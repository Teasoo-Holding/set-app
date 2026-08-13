# Sign in with Microsoft (Entra ID) — setup

The app code for #23 is done. To make the button actually sign people in, three
things need configuring **outside the repo**. Do them in this order.

## 1. Azure — register the app (Entra admin)

Azure portal → **Microsoft Entra ID → App registrations → New registration**.

- **Name:** `Teasoo SET`
- **Supported account types:** _Accounts in this organizational directory only_
  (single tenant) for a Unilever-only pilot. Use multi-tenant only if you
  intend to let other orgs in.
- **Redirect URI (Web):**
  `https://kszogyppzlqvyyqltdzj.supabase.co/auth/v1/callback`
  (this is Supabase's callback, **not** the app's — Supabase brokers the flow.)

After it's created:

- **Certificates & secrets → New client secret** → copy the **Value** (once).
- From **Overview**, copy the **Application (client) ID** and **Directory
  (tenant) ID**.
- **API permissions:** Microsoft Graph → delegated `openid`, `email`,
  `profile` (usually present by default). Grant admin consent.

## 2. Supabase — enable the Azure provider

Supabase dashboard → **Authentication → Providers → Azure** → enable, then:

- **Client ID:** the Application (client) ID from step 1.
- **Secret:** the client secret **Value** from step 1.
- **Azure Tenant URL:** `https://login.microsoftonline.com/<tenant-id>`
  (use the Directory/tenant ID; this pins sign-in to the Unilever tenant).

Supabase dashboard → **Authentication → URL Configuration → Redirect URLs**,
add both app origins so the final hop back is allowed:

- `https://<production-domain>/auth/callback`
- `https://<staging-preview-domain>/auth/callback`
- `http://localhost:3000/auth/callback` (local dev)

## 3. Vercel — optional origin override

Redirects are derived from the request host automatically, so no env var is
required. Set **`NEXT_PUBLIC_SITE_URL`** (e.g. the production domain) only if
you want to force a canonical origin regardless of the incoming host.

## First sign-in behaviour

- A new Entra user is auto-provisioned as a **`field`** profile
  (`handle_new_user` trigger). An **Admin** promotes them and sets their
  function in **Governance** (E10) / directly in `profiles`.
- The demo role-switcher stays visible only when `NEXT_PUBLIC_DEMO_MODE=true`.
  Turn it **off** for the real pilot so Microsoft is the only way in.

## Test

1. Open `/login` → **Sign in with Microsoft**.
2. Complete the Microsoft prompt → you land on your role's home.
3. Check a `profiles` row now exists for the account (role `field`).
