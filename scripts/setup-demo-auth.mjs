// One-off: give the seeded demo users a password + confirmed email so the
// demo role-switcher can sign in (they were inserted via SQL without one).
// Uses the SERVICE-ROLE admin API — run locally, never ship this to a client.
//
//   node --env-file=.env.local scripts/setup-demo-auth.mjs
//
// Requires: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, DEMO_LOGIN_PASSWORD
import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const password = process.env.DEMO_LOGIN_PASSWORD;

if (!url || !serviceKey || !password) {
  console.error(
    "Missing env. Need NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, DEMO_LOGIN_PASSWORD.",
  );
  process.exit(1);
}

const admin = createClient(url, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const DEMO_EMAILS = [
  "zainab.obagun@example.com",
  "amara.eze@example.com",
  "tunde.bello@example.com",
  "chidi.okonkwo@example.com",
  "ngozi.udo@example.com",
  "admin@example.com",
];

// Page through users and index by email.
const byEmail = new Map();
let page = 1;
for (;;) {
  const { data, error } = await admin.auth.admin.listUsers({ page, perPage: 200 });
  if (error) {
    console.error("listUsers failed:", error.message);
    process.exit(1);
  }
  for (const u of data.users) byEmail.set(u.email, u.id);
  if (data.users.length < 200) break;
  page += 1;
}

let ok = 0;
for (const email of DEMO_EMAILS) {
  const id = byEmail.get(email);
  if (!id) {
    console.warn(`- ${email}: no auth user found (skipped)`);
    continue;
  }
  const { error } = await admin.auth.admin.updateUserById(id, {
    password,
    email_confirm: true,
  });
  if (error) {
    console.error(`- ${email}: ${error.message}`);
  } else {
    console.log(`✓ ${email}`);
    ok += 1;
  }
}
console.log(`\nDone. ${ok}/${DEMO_EMAILS.length} demo users ready.`);
