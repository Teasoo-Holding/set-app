"use client";

import { makeStyles, tokens, Title1, Body1, Caption1, Text, Avatar } from "@fluentui/react-components";
import Link from "next/link";
import { ArrowRightRegular } from "@fluentui/react-icons";
import { BrandMark } from "@/components/BrandMark";
import { signInAsDemo } from "@/app/actions/auth";
import { DEMO_USERS, ROLE_LABEL } from "@/lib/roles";

const useStyles = makeStyles({
  page: { minHeight: "100vh", backgroundColor: tokens.colorNeutralBackground2, display: "flex", flexDirection: "column", alignItems: "center", padding: "48px 24px", rowGap: "24px" },
  brand: { display: "flex", alignItems: "center", columnGap: "10px" },
  card: { width: "100%", maxWidth: "440px", backgroundColor: tokens.colorNeutralBackground1, border: `1px solid ${tokens.colorNeutralStroke2}`, borderRadius: tokens.borderRadiusLarge, padding: "32px", display: "flex", flexDirection: "column", rowGap: "18px", boxShadow: tokens.shadow4, "@media (max-width: 480px)": { padding: "24px 18px" } },
  hero: { display: "flex", flexDirection: "column", rowGap: "8px" },
  roles: { display: "flex", flexDirection: "column", rowGap: "8px" },
  roleForm: { margin: 0 },
  roleBtn: { width: "100%", display: "flex", alignItems: "center", columnGap: "12px", textAlign: "left", padding: "12px 14px", borderRadius: tokens.borderRadiusMedium, border: `1px solid ${tokens.colorNeutralStroke2}`, backgroundColor: tokens.colorNeutralBackground1, cursor: "pointer", fontFamily: tokens.fontFamilyBase, ":hover": { backgroundColor: tokens.colorNeutralBackground1Hover, border: `1px solid ${tokens.colorBrandStroke1}` } },
  roleText: { display: "flex", flexDirection: "column", flexGrow: 1, minWidth: 0 },
  arrow: { color: tokens.colorNeutralForeground3, fontSize: "18px" },
  back: { color: tokens.colorBrandForeground1, fontSize: tokens.fontSizeBase200, fontWeight: tokens.fontWeightSemibold, textDecoration: "none", ":hover": { textDecoration: "underline" } },
});

export function DemoRoster() {
  const styles = useStyles();
  return (
    <main className={styles.page}>
      <div className={styles.brand}>
        <BrandMark size="md" />
        <Text as="span" weight="semibold" size={500}>Teasoo SET</Text>
      </div>

      <div className={styles.card}>
        <div className={styles.hero}>
          <Title1>Explore the demo.</Title1>
          <Body1>Pick a role to jump straight into a live example organisation. This is for demonstrations only.</Body1>
        </div>

        <div className={styles.roles}>
          {DEMO_USERS.map((u) => (
            <form key={u.email} action={signInAsDemo} className={styles.roleForm}>
              <input type="hidden" name="email" value={u.email} />
              <button type="submit" className={styles.roleBtn}>
                <Avatar name={u.name} color="colorful" />
                <span className={styles.roleText}>
                  <Body1><strong>{u.name}</strong></Body1>
                  <Caption1>
                    {ROLE_LABEL[u.role]}
                    {u.function ? ` · ${u.function}` : ""}
                  </Caption1>
                </span>
                <ArrowRightRegular className={styles.arrow} />
              </button>
            </form>
          ))}
        </div>

        <Link href="/login" className={styles.back}>Back to sign in</Link>
      </div>
    </main>
  );
}
