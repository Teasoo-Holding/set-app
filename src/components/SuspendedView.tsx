"use client";

import { makeStyles, tokens, Title1, Body1, Text, Button } from "@fluentui/react-components";
import { PauseCircleRegular, SignOutRegular } from "@fluentui/react-icons";
import { BrandMark } from "@/components/BrandMark";
import { signOut } from "@/app/actions/auth";
import { COMPANY } from "@/lib/company";

const useStyles = makeStyles({
  page: { minHeight: "100vh", backgroundColor: tokens.colorNeutralBackground2, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "48px 24px", rowGap: "20px" },
  brand: { display: "flex", alignItems: "center", columnGap: "10px" },
  card: { width: "100%", maxWidth: "460px", backgroundColor: tokens.colorNeutralBackground1, border: `1px solid ${tokens.colorNeutralStroke2}`, borderRadius: tokens.borderRadiusLarge, padding: "32px", display: "flex", flexDirection: "column", rowGap: "14px", boxShadow: tokens.shadow4, textAlign: "center", alignItems: "center" },
  icon: { fontSize: "40px", color: tokens.colorNeutralForeground3, display: "flex" },
  muted: { color: tokens.colorNeutralForeground3 },
  form: { margin: 0 },
});

export function SuspendedView({ orgName }: { orgName: string }) {
  const styles = useStyles();
  return (
    <main className={styles.page}>
      <div className={styles.brand}>
        <BrandMark size="md" />
        <Text as="h1" weight="semibold" size={500}>Teasoo SET</Text>
      </div>
      <div className={styles.card}>
        <span className={styles.icon}><PauseCircleRegular /></span>
        <Title1 as="h2">Access is paused</Title1>
        <Body1>Access to <strong>{orgName}</strong> on Teasoo SET is currently paused. Your data is safe and nothing has been deleted.</Body1>
        <Body1 className={styles.muted}>To restore access, contact your administrator. If you need help, reach us at <a href={`mailto:${COMPANY.email}`}>{COMPANY.email}</a>.</Body1>
        <form action={signOut} className={styles.form}>
          <Button type="submit" appearance="secondary" icon={<SignOutRegular />}>Sign out</Button>
        </form>
      </div>
    </main>
  );
}
