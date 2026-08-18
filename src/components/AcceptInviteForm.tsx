"use client";

import Link from "next/link";
import {
  makeStyles, tokens, Title1, Body1, Caption1, Text, Field, Input, Button, Badge,
  MessageBar, MessageBarBody,
} from "@fluentui/react-components";
import { BrandMark } from "@/components/BrandMark";
import { PasswordInput } from "@/components/PasswordInput";
import { acceptInvite } from "@/app/actions/invitations";

const useStyles = makeStyles({
  page: { minHeight: "100vh", backgroundColor: tokens.colorNeutralBackground2, display: "flex", flexDirection: "column", alignItems: "center", padding: "48px 24px", rowGap: "24px" },
  brand: { display: "flex", alignItems: "center", columnGap: "10px" },
  card: { width: "100%", maxWidth: "440px", backgroundColor: tokens.colorNeutralBackground1, border: `1px solid ${tokens.colorNeutralStroke2}`, borderRadius: tokens.borderRadiusLarge, padding: "32px", display: "flex", flexDirection: "column", rowGap: "18px", boxShadow: tokens.shadow4, "@media (max-width: 480px)": { padding: "24px 18px" } },
  hero: { display: "flex", flexDirection: "column", rowGap: "8px" },
  form: { margin: 0, display: "flex", flexDirection: "column", rowGap: "14px" },
  meta: { display: "flex", alignItems: "center", columnGap: "8px", flexWrap: "wrap" },
  muted: { color: tokens.colorNeutralForeground3 },
});

function Shell({ children }: { children: React.ReactNode }) {
  const styles = useStyles();
  return (
    <main className={styles.page}>
      <div className={styles.brand}>
        <BrandMark size="md" />
        <Text as="span" weight="semibold" size={500}>Teasoo SET</Text>
      </div>
      <div className={styles.card}>{children}</div>
    </main>
  );
}

export function AcceptInviteInvalid({ reason }: { reason: string }) {
  return (
    <Shell>
      <Title1>Invitation not valid</Title1>
      <Body1>{reason}</Body1>
      <Link href="/login">Go to sign in</Link>
    </Shell>
  );
}

export function AcceptInviteForm({
  token, email, orgName, roleLabel, error,
}: {
  token: string; email: string; orgName: string; roleLabel: string; error?: string;
}) {
  const styles = useStyles();
  return (
    <Shell>
      <div className={styles.hero}>
        <Title1>{`Join ${orgName}`}</Title1>
        <Body1>You&apos;ve been invited to Teasoo SET. Set a password to finish creating your account.</Body1>
        <div className={styles.meta}>
          <Badge appearance="tint" color="brand">{roleLabel}</Badge>
          <Caption1 className={styles.muted}>{email}</Caption1>
        </div>
      </div>

      {error && (
        <MessageBar intent="error">
          <MessageBarBody>{error}</MessageBarBody>
        </MessageBar>
      )}

      <form action={acceptInvite} className={styles.form}>
        <input type="hidden" name="token" value={token} />
        <Field label="Full name">
          <Input name="full_name" type="text" autoComplete="name" required placeholder="Ada Lovelace" />
        </Field>
        <Field label="Password" hint="At least 8 characters.">
          <PasswordInput name="password" autoComplete="new-password" required minLength={8} />
        </Field>
        <Button type="submit" appearance="primary">Create account &amp; sign in</Button>
      </form>
    </Shell>
  );
}
