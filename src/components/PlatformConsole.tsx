"use client";

import { useFormState } from "react-dom";
import {
  makeStyles, tokens, Title2, Title3, Body1, Caption1, Text, Button, Badge, Input, Field,
  MessageBar, MessageBarBody, MessageBarTitle,
} from "@fluentui/react-components";
import { SignOutRegular } from "@fluentui/react-icons";
import { BrandMark } from "@/components/BrandMark";
import { signOut } from "@/app/actions/auth";
import { createTenant, setTenantStatus, reinviteTenantAdmin } from "@/app/actions/tenants";

export type TenantRow = {
  id: string;
  name: string;
  slug: string;
  status: "active" | "suspended";
  createdAt: string;
  members: number;
  hasAdmin: boolean;
  pendingAdminEmail: string | null;
};

function fmt(iso: string): string {
  return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

const useStyles = makeStyles({
  page: { minHeight: "100vh", backgroundColor: tokens.colorNeutralBackground2 },
  bar: {
    display: "flex", alignItems: "center", columnGap: "10px", padding: "10px 16px",
    backgroundColor: tokens.colorNeutralBackground1, borderBottom: `1px solid ${tokens.colorNeutralStroke2}`,
    position: "sticky", top: 0, zIndex: 10,
  },
  barSpacer: { flexGrow: 1 },
  main: { maxWidth: "900px", margin: "0 auto", padding: "32px 24px", display: "flex", flexDirection: "column", rowGap: "20px", "@media (max-width: 640px)": { padding: "16px 12px" } },
  head: { display: "flex", flexDirection: "column", rowGap: "2px" },
  card: { padding: "20px", backgroundColor: tokens.colorNeutralBackground1, border: `1px solid ${tokens.colorNeutralStroke2}`, borderRadius: tokens.borderRadiusXLarge, display: "flex", flexDirection: "column", rowGap: "14px" },
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

export function PlatformConsole({
  viewer,
  tenants,
}: {
  viewer: { full_name: string };
  tenants: TenantRow[];
}) {
  const styles = useStyles();
  const [createState, createAction] = useFormState(createTenant, null);
  const [resendState, resendAction] = useFormState(reinviteTenantAdmin, null);

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
            <Button type="submit" appearance="primary">Create &amp; invite</Button>
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
                </div>
                <div className={styles.actions}>
                  {!t.hasAdmin && t.pendingAdminEmail && (
                    <form action={resendAction} className={styles.form}>
                      <input type="hidden" name="tenant_id" value={t.id} />
                      <input type="hidden" name="email" value={t.pendingAdminEmail} />
                      <input type="hidden" name="name" value={t.name} />
                      <Button type="submit" size="small" appearance="subtle">Resend invite</Button>
                    </form>
                  )}
                  <form action={setTenantStatus} className={styles.form}>
                    <input type="hidden" name="id" value={t.id} />
                    <input type="hidden" name="status" value={t.status === "active" ? "suspended" : "active"} />
                    <Button type="submit" size="small" appearance={t.status === "active" ? "subtle" : "primary"}>
                      {t.status === "active" ? "Suspend" : "Reactivate"}
                    </Button>
                  </form>
                </div>
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  );
}
