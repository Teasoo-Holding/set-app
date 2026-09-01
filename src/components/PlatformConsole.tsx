"use client";

import { useFormState } from "react-dom";
import {
  makeStyles, tokens, Title2, Title3, Body1, Caption1, Text, Button, Badge, Input, Field,
  MessageBar, MessageBarBody, MessageBarTitle,
} from "@fluentui/react-components";
import { SignOutRegular } from "@fluentui/react-icons";
import { BrandMark } from "@/components/BrandMark";
import { signOut } from "@/app/actions/auth";
import { SubmitButton } from "@/components/SubmitButton";
import { ConfirmButton } from "@/components/ConfirmButton";
import { createTenant, setTenantStatus, reinviteTenantAdmin } from "@/app/actions/tenants";
import { SentryDiagnostics } from "@/components/SentryDiagnostics";
import { InfoTip } from "@/components/InfoTip";

export type TenantRow = {
  id: string;
  name: string;
  slug: string;
  status: "active" | "suspended";
  createdAt: string;
  members: number;
  byRole: { admin: number; leadership: number; head: number; field: number };
  hasAdmin: boolean;
  pendingAdminEmail: string | null;
  invitesAccepted: number;
  invitesPending: number;
  stakeholders: number;
  highRisk: number;
  flagged: number;
  negative: number;
  supportive: number;
  engagements7d: number;
  engagements30d: number;
  engagementsTotal: number;
  activeUsers30d: number;
  lastActivityAt: string | null;
  commitmentsTotal: number;
  commitmentsCompleted: number;
  openCommitments: number;
  escalationsTotal: number;
  escalationsResolved: number;
  openEscalations: number;
  escalationsCritical: number;
};

function fmt(iso: string): string {
  return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

/** Whole-number percentage of n over d, or "—" when there's nothing to divide. */
function pct(n: number, d: number): string {
  return d > 0 ? `${Math.round((n / d) * 100)}%` : "n/a";
}

const useStyles = makeStyles({
  page: { minHeight: "100vh", backgroundColor: tokens.colorNeutralBackground2 },
  bar: {
    display: "flex", alignItems: "center", columnGap: "10px", padding: "10px 16px",
    backgroundColor: tokens.colorNeutralBackground1, borderBottom: `1px solid ${tokens.colorNeutralStroke2}`,
    position: "sticky", top: 0, zIndex: 10,
  },
  barSpacer: { flexGrow: 1 },
  main: { maxWidth: "1040px", margin: "0 auto", padding: "32px 24px", display: "flex", flexDirection: "column", rowGap: "20px", "@media (max-width: 640px)": { padding: "16px 12px" } },
  head: { display: "flex", flexDirection: "column", rowGap: "2px" },
  card: { padding: "20px", backgroundColor: tokens.colorNeutralBackground1, border: `1px solid ${tokens.colorNeutralStroke2}`, borderRadius: tokens.borderRadiusXLarge, display: "flex", flexDirection: "column", rowGap: "14px" },
  statGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: "12px" },
  statCard: { padding: "14px 16px", backgroundColor: tokens.colorNeutralBackground1, border: `1px solid ${tokens.colorNeutralStroke2}`, borderRadius: tokens.borderRadiusLarge, display: "flex", flexDirection: "column", rowGap: "2px" },
  statNum: { fontSize: tokens.fontSizeHero700, fontWeight: tokens.fontWeightSemibold, lineHeight: "1.1", color: tokens.colorNeutralForeground1 },
  statLabelRow: { display: "flex", alignItems: "center", columnGap: "4px" },
  statLabel: { color: tokens.colorNeutralForeground2 },
  statSub: { color: tokens.colorNeutralForeground3 },
  metrics: { color: tokens.colorNeutralForeground3 },
  metricsRow: { display: "flex", flexDirection: "column", rowGap: "2px", marginTop: "2px" },
  sectionLabel: { textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: tokens.fontWeightSemibold, color: tokens.colorNeutralForeground3, marginTop: "4px" },
  postHogNote: { color: tokens.colorNeutralForeground3, marginTop: "2px" },
  createForm: { display: "flex", columnGap: "12px", rowGap: "12px", flexWrap: "wrap", alignItems: "flex-end" },
  field: { display: "flex", flexDirection: "column", minWidth: "240px", flexGrow: 1 },
  row: { display: "flex", alignItems: "flex-start", columnGap: "12px", rowGap: "8px", flexWrap: "wrap", padding: "14px 0", borderTop: `1px solid ${tokens.colorNeutralStroke2}` },
  rowMain: { display: "flex", flexDirection: "column", rowGap: "3px", flexGrow: 1, minWidth: "220px" },
  nameRow: { display: "flex", alignItems: "center", columnGap: "8px", flexWrap: "wrap" },
  actions: { display: "flex", alignItems: "center", columnGap: "8px", flexWrap: "wrap" },
  muted: { color: tokens.colorNeutralForeground3 },
  form: { margin: 0, display: "flex" },
  empty: { color: tokens.colorNeutralForeground3, paddingTop: "4px" },
  linkBox: { marginTop: "6px", padding: "8px 10px", borderRadius: tokens.borderRadiusMedium, backgroundColor: tokens.colorNeutralBackground3, wordBreak: "break-all", fontFamily: tokens.fontFamilyMonospace, fontSize: tokens.fontSizeBase200 },
});

function Stat({
  styles,
  num,
  label,
  sub,
  tip,
}: {
  styles: ReturnType<typeof useStyles>;
  num: string | number;
  label: string;
  sub?: string;
  tip?: string;
}) {
  return (
    <div className={styles.statCard}>
      <Text className={styles.statNum}>{num}</Text>
      <span className={styles.statLabelRow}>
        <Caption1 className={styles.statLabel}>{label}</Caption1>
        {tip ? <InfoTip content={tip} label={`What "${label}" means`} /> : null}
      </span>
      {sub ? <Caption1 className={styles.statSub}>{sub}</Caption1> : null}
    </div>
  );
}

export function PlatformConsole({
  viewer,
  tenants,
  sentryTestEnabled = false,
}: {
  viewer: { full_name: string };
  tenants: TenantRow[];
  sentryTestEnabled?: boolean;
}) {
  const styles = useStyles();
  const [createState, createAction] = useFormState(createTenant, null);
  const [resendState, resendAction] = useFormState(reinviteTenantAdmin, null);

  const sum = (f: (t: TenantRow) => number) => tenants.reduce((n, t) => n + f(t), 0);
  const now = Date.now();
  const activeOrgs = tenants.filter((t) => t.status === "active").length;
  const activeOrgs30d = tenants.filter(
    (t) => t.lastActivityAt && now - new Date(t.lastActivityAt).getTime() <= 30 * 864e5,
  ).length;
  const roleTotals = {
    admin: sum((t) => t.byRole.admin),
    leadership: sum((t) => t.byRole.leadership),
    head: sum((t) => t.byRole.head),
    field: sum((t) => t.byRole.field),
  };
  const totalUsers = sum((t) => t.members);
  const totalStakeholders = sum((t) => t.stakeholders);
  const totalEng30d = sum((t) => t.engagements30d);
  const totalEng7d = sum((t) => t.engagements7d);
  const totalActiveUsers = sum((t) => t.activeUsers30d);
  const invAccepted = sum((t) => t.invitesAccepted);
  const invPending = sum((t) => t.invitesPending);
  const comTotal = sum((t) => t.commitmentsTotal);
  const comDone = sum((t) => t.commitmentsCompleted);
  const comOpen = sum((t) => t.openCommitments);
  const escTotal = sum((t) => t.escalationsTotal);
  const escResolved = sum((t) => t.escalationsResolved);
  const escOpen = sum((t) => t.openEscalations);
  const escCritical = sum((t) => t.escalationsCritical);
  const highRisk = sum((t) => t.highRisk);
  const flaggedTotal = sum((t) => t.flagged);
  const negativeTotal = sum((t) => t.negative);
  const supportiveTotal = sum((t) => t.supportive);
  const pendingAdminInvites = tenants.filter((t) => !t.hasAdmin && t.pendingAdminEmail).length;

  return (
    <div className={styles.page}>
      <header className={styles.bar}>
        <BrandMark size="sm" />
        <Text weight="semibold">Teasoo SET · Platform</Text>
        <div className={styles.barSpacer} />
        <Caption1 className={styles.muted}>{viewer.full_name}</Caption1>
        <form action={signOut} className={styles.form}>
          <Button type="submit" appearance="subtle" icon={<SignOutRegular />} aria-label="Sign out" />
        </form>
      </header>

      <main className={styles.main}>
        <div className={styles.head}>
          <Title2>Platform administration</Title2>
          <Body1>Create and manage organisations. You don&apos;t have access to any organisation&apos;s stakeholder data.</Body1>
        </div>

        {/* Overview: aggregate KPIs across all organisations */}
        <div className={styles.card}>
          <Title3>Overview</Title3>

          <Caption1 className={styles.sectionLabel}>Adoption</Caption1>
          <div className={styles.statGrid}>
            <Stat styles={styles} num={tenants.length} label="Organisations" sub={`${activeOrgs} active · ${tenants.length - activeOrgs} suspended`} />
            <Stat styles={styles} num={`${activeOrgs30d}/${tenants.length}`} label="Active orgs (30d)" sub="logged activity recently" tip="Organisations that have logged at least one engagement in the last 30 days, out of all organisations." />
            <Stat styles={styles} num={totalUsers} label="Users" sub={`${roleTotals.leadership} leadership · ${roleTotals.head} head · ${roleTotals.field} field · ${roleTotals.admin} admin`} />
            <Stat styles={styles} num={pct(invAccepted, invAccepted + invPending)} label="Invite acceptance" sub={`${invAccepted} accepted · ${invPending} pending`} tip="Share of invitations that have been accepted, out of all invitations sent." />
          </div>

          <Caption1 className={styles.sectionLabel}>Activity</Caption1>
          <div className={styles.statGrid}>
            <Stat styles={styles} num={totalStakeholders} label="Stakeholders tracked" sub="across all organisations" />
            <Stat styles={styles} num={totalEng30d} label="Engagements (30d)" sub={`${totalEng7d} in the last 7 days`} tip="Engagements logged across all organisations in the last 30 days." />
            <Stat styles={styles} num={totalActiveUsers} label="Active contributors (30d)" sub="logged at least one engagement" tip="People who logged at least one engagement in the last 30 days." />
          </div>

          <Caption1 className={styles.sectionLabel}>Delivery</Caption1>
          <div className={styles.statGrid}>
            <Stat styles={styles} num={pct(comDone, comTotal)} label="Commitments completed" sub={`${comDone} of ${comTotal} · ${comOpen} open`} tip="Share of all commitments marked done, across every organisation." />
            <Stat styles={styles} num={pct(escResolved, escTotal)} label="Escalations resolved" sub={`${escResolved} of ${escTotal} · ${escOpen} open`} tip="Share of all escalations that have been resolved, across every organisation." />
            <Stat styles={styles} num={escCritical} label="Critical escalations open" sub="need attention now" tip="Open escalations at critical severity. These are the most urgent relationships across the platform." />
            <Stat styles={styles} num={pendingAdminInvites} label="Admin invites pending" sub="orgs awaiting first admin" tip="Organisations where the first administrator has been invited but has not yet accepted." />
          </div>

          <Caption1 className={styles.sectionLabel}>Risk snapshot</Caption1>
          <div className={styles.statGrid}>
            <Stat styles={styles} num={highRisk} label="High-risk stakeholders" tip="Stakeholders rated high risk right now, across every organisation." />
            <Stat styles={styles} num={flaggedTotal} label="Flagged" tip="Stakeholders someone has flagged for attention, across every organisation." />
            <Stat styles={styles} num={negativeTotal} label="Resistant sentiment" tip="Stakeholders whose current sentiment is resistant, across every organisation." />
            <Stat styles={styles} num={pct(supportiveTotal, totalStakeholders)} label="Supportive" sub={`${supportiveTotal} of ${totalStakeholders}`} tip="Share of all tracked stakeholders whose current sentiment is supportive." />
          </div>

          <Caption1 className={styles.postHogNote}>
            These are counts only, with no stakeholder details. Sign-ins, active users and feature usage live in PostHog, grouped by organisation.
          </Caption1>
        </div>

        {/* Create tenant */}
        <div className={styles.card}>
          <Title3>Add an organisation</Title3>
          <Caption1 className={styles.muted}>
            Creates the organisation, sets up its default categories and functions, and emails the first
            administrator an invitation to set up their account.
          </Caption1>
          <form action={createAction} className={styles.createForm}>
            <Field label="Organisation name" className={styles.field}>
              <Input name="name" required placeholder="Acme Foods" />
            </Field>
            <Field label="First admin's email" className={styles.field}>
              <Input name="admin_email" type="email" required placeholder="admin@acme.com" />
            </Field>
            <SubmitButton appearance="primary">Create &amp; invite</SubmitButton>
          </form>

          {createState?.error && (
            <MessageBar intent="error">
              <MessageBarBody>
                <MessageBarTitle>Couldn&apos;t create the organisation</MessageBarTitle>
                {createState.error}
              </MessageBarBody>
            </MessageBar>
          )}
          {createState?.createdOrg && createState.emailed && (
            <MessageBar intent="success">
              <MessageBarBody>{`Created ${createState.createdOrg} and emailed the administrator an invitation.`}</MessageBarBody>
            </MessageBar>
          )}
          {createState?.createdOrg && !createState.emailed && createState.inviteLink && (
            <MessageBar intent="warning">
              <MessageBarBody>
                <MessageBarTitle>{`Created ${createState.createdOrg}, but the invite email was not sent`}</MessageBarTitle>
                Email isn&apos;t configured yet, so send this invitation link to the administrator yourself:
                <div className={styles.linkBox}>{createState.inviteLink}</div>
              </MessageBarBody>
            </MessageBar>
          )}
        </div>

        {/* Tenant list */}
        <div className={styles.card}>
          <Title3>{`Organisations (${tenants.length})`}</Title3>

          {resendState?.error && (
            <MessageBar intent="error">
              <MessageBarBody>{resendState.error}</MessageBarBody>
            </MessageBar>
          )}
          {resendState?.inviteLink && (
            <MessageBar intent={resendState.emailed ? "success" : "warning"}>
              <MessageBarBody>
                <MessageBarTitle>
                  {resendState.emailed ? "Invitation resent (and emailed)" : "Invitation resent, but email not sent"}
                </MessageBarTitle>
                Send this fresh link to the administrator (the previous link no longer works):
                <div className={styles.linkBox}>{resendState.inviteLink}</div>
              </MessageBarBody>
            </MessageBar>
          )}
          {tenants.length === 0 ? (
            <div className={styles.empty}>No organisations yet. Add your first above.</div>
          ) : (
            tenants.map((t) => (
              <div key={t.id} className={styles.row}>
                <div className={styles.rowMain}>
                  <div className={styles.nameRow}>
                    <Text weight="semibold">{t.name}</Text>
                    <Badge appearance="tint" color={t.status === "active" ? "success" : "danger"} size="small">
                      {t.status === "active" ? "Active" : "Suspended"}
                    </Badge>
                    {!t.hasAdmin && t.pendingAdminEmail && (
                      <Badge appearance="tint" color="warning" size="small">Admin invite pending</Badge>
                    )}
                  </div>
                  <Caption1 className={styles.muted}>
                    {`${t.slug} · ${t.members} member${t.members === 1 ? "" : "s"} · added ${fmt(t.createdAt)}`}
                    {!t.hasAdmin && t.pendingAdminEmail ? ` · invited ${t.pendingAdminEmail}` : ""}
                  </Caption1>
                  <div className={styles.metricsRow}>
                    <Caption1 className={styles.metrics}>
                      {`${t.byRole.leadership} leadership · ${t.byRole.head} head · ${t.byRole.field} field · ${t.byRole.admin} admin · ${t.stakeholders} stakeholders · ${t.activeUsers30d} active (30d)${t.lastActivityAt ? ` · last active ${fmt(t.lastActivityAt)}` : " · no activity yet"}`}
                    </Caption1>
                    <Caption1 className={styles.metrics}>
                      {`${t.engagements30d} engagements (30d) · commitments ${t.commitmentsCompleted}/${t.commitmentsTotal} done · escalations ${t.escalationsResolved}/${t.escalationsTotal} resolved${t.escalationsCritical ? ` · ${t.escalationsCritical} critical open` : ""}`}
                    </Caption1>
                    <Caption1 className={styles.metrics}>
                      {`Risk: ${t.highRisk} high-risk · ${t.flagged} flagged · ${t.negative} resistant · ${t.supportive} supportive`}
                    </Caption1>
                  </div>
                </div>
                <div className={styles.actions}>
                  {!t.hasAdmin && t.pendingAdminEmail && (
                    <form action={resendAction} className={styles.form}>
                      <input type="hidden" name="tenant_id" value={t.id} />
                      <input type="hidden" name="email" value={t.pendingAdminEmail} />
                      <input type="hidden" name="name" value={t.name} />
                      <SubmitButton size="small" appearance="subtle">Resend invite</SubmitButton>
                    </form>
                  )}
                  <form id={`status-${t.id}`} action={setTenantStatus} className={styles.form}>
                    <input type="hidden" name="id" value={t.id} />
                    <input type="hidden" name="status" value={t.status === "active" ? "suspended" : "active"} />
                    {t.status === "active" ? (
                      <ConfirmButton
                        formId={`status-${t.id}`}
                        size="small"
                        appearance="subtle"
                        confirmTitle={`Suspend ${t.name}?`}
                        confirmBody={`Everyone in ${t.name} will lose access until you reactivate it.`}
                        confirmLabel="Suspend"
                      >
                        Suspend
                      </ConfirmButton>
                    ) : (
                      <SubmitButton size="small" appearance="primary">Reactivate</SubmitButton>
                    )}
                  </form>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Diagnostics: only when SENTRY_TEST is enabled */}
        {sentryTestEnabled && (
          <div className={styles.card}>
            <Title3>Diagnostics</Title3>
            <Caption1 className={styles.muted}>
              Verify error monitoring by sending a test error to Sentry. This card is only shown while diagnostics are
              enabled, and only to platform administrators.
            </Caption1>
            <SentryDiagnostics />
          </div>
        )}
      </main>
    </div>
  );
}
