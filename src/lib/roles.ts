// Client-safe roles, types, and demo constants — NO server-only imports
// (this module is pulled into client components; keep it free of next/headers).

export type Role = "field" | "head" | "leadership" | "admin";

export type Profile = {
  id: string;
  full_name: string;
  email: string;
  role: Role;
  function: string | null;
};

/** E1-2 — where each role lands after sign-in. */
export function getLandingPath(role: Role): string {
  switch (role) {
    case "leadership":
    case "admin":
      // Admins see everything — their home is the portfolio overview.
      // Governance lives on its own nav tab.
      return "/portfolio";
    case "head":
      return "/dashboard";
    case "field":
    default:
      return "/home";
  }
}

export const ROLE_LABEL: Record<Role, string> = {
  field: "Standard User",
  head: "Function Head",
  leadership: "Leadership",
  admin: "Administrator",
};

/** Demo roster shown on the login screen (E1-4). Matches seed profiles. */
export type DemoUser = {
  email: string;
  name: string;
  role: Role;
  function: string | null;
};

export const DEMO_USERS: DemoUser[] = [
  { email: "zainab.obagun@example.com", name: "Zainab Obagun", role: "leadership", function: null },
  { email: "amara.eze@example.com", name: "Amara Eze", role: "head", function: "Corporate Affairs" },
  { email: "tunde.bello@example.com", name: "Tunde Bello", role: "head", function: "Sales" },
  { email: "chidi.okonkwo@example.com", name: "Chidi Okonkwo", role: "field", function: "Sales" },
  { email: "ngozi.udo@example.com", name: "Ngozi Udo", role: "field", function: "Corporate Affairs" },
  { email: "admin@example.com", name: "System Admin", role: "admin", function: null },
];

export const DEMO_MODE = process.env.NEXT_PUBLIC_DEMO_MODE === "true";

/**
 * Show the "Sign in with Microsoft" button. Off by default — the Entra
 * provider config is parked (#23); flip NEXT_PUBLIC_ENTRA_ENABLED=true to
 * bring it back without touching code.
 */
export const ENTRA_ENABLED = process.env.NEXT_PUBLIC_ENTRA_ENABLED === "true";
