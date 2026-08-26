// Client-safe roles, types, and demo constants — NO server-only imports
// (this module is pulled into client components; keep it free of next/headers).

export type Role = "field" | "head" | "leadership" | "admin" | "platform_admin";

export type Profile = {
  id: string;
  tenant_id: string | null; // null only for platform_admin
  full_name: string;
  email: string;
  role: Role;
  function: string | null;
};

/** E1-2 / E12-3 — where each role lands after sign-in. */
export function getLandingPath(role: Role): string {
  switch (role) {
    case "platform_admin":
      // Cross-tenant operator — the platform console, no business data.
      return "/platform";
    case "leadership":
    case "admin":
      // Tenant admins / leadership see everything in their tenant — the
      // portfolio overview. Governance lives on its own nav tab.
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
  platform_admin: "Platform Admin",
};

/**
 * Plain-English summary of what each role can access, shown where a role is
 * assigned (the invite form). Kept consistent with the §8 permission matrix
 * enforced in RLS. platform_admin is cross-tenant and not assignable in a tenant.
 */
export const ROLE_DESCRIPTION: Record<Role, string> = {
  field: "Logs engagements and sees stakeholders in their own function only.",
  head: "Leads a function. Sees that function's stakeholders, team and escalations.",
  leadership: "Organisation-wide view of the full stakeholder portfolio and risk.",
  admin: "Manages the organisation: users, categories, functions, engagement types, and all stakeholders.",
  platform_admin: "Cross-tenant operator with no access to any organisation's data.",
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
