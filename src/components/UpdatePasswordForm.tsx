"use client";

import {
  makeStyles,
  tokens,
  Title1,
  Body1,
  Text,
  Field,
  Input,
  Button,
  MessageBar,
  MessageBarBody,
} from "@fluentui/react-components";
import { BrandMark } from "@/components/BrandMark";
import { updatePassword } from "@/app/actions/auth";

const useStyles = makeStyles({
  page: {
    minHeight: "100vh",
    backgroundColor: tokens.colorNeutralBackground2,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    padding: "48px 24px",
    rowGap: "24px",
  },
  brand: { display: "flex", alignItems: "center", columnGap: "10px" },
  card: {
    width: "100%",
    maxWidth: "440px",
    backgroundColor: tokens.colorNeutralBackground1,
    border: `1px solid ${tokens.colorNeutralStroke2}`,
    borderRadius: tokens.borderRadiusLarge,
    padding: "32px",
    display: "flex",
    flexDirection: "column",
    rowGap: "20px",
    boxShadow: tokens.shadow4,
  },
  hero: { display: "flex", flexDirection: "column", rowGap: "8px" },
  form: { margin: 0, display: "flex", flexDirection: "column", rowGap: "14px" },
});

export function UpdatePasswordForm({ error }: { error?: string }) {
  const styles = useStyles();
  return (
    <main className={styles.page}>
      <div className={styles.brand}>
        <BrandMark size="md" />
        <Text as="h1" weight="semibold" size={500}>
          Teasoo SET
        </Text>
      </div>

      <div className={styles.card}>
        <div className={styles.hero}>
          <Title1>Set a new password.</Title1>
          <Body1>Choose a new password for your account. You&apos;ll be signed in once it&apos;s saved.</Body1>
        </div>

        {error && (
          <MessageBar intent="error">
            <MessageBarBody>{error}</MessageBarBody>
          </MessageBar>
        )}

        <form action={updatePassword} className={styles.form}>
          <Field label="New password" hint="At least 8 characters.">
            <Input name="password" type="password" autoComplete="new-password" required minLength={8} />
          </Field>
          <Button type="submit" appearance="primary">
            Save new password
          </Button>
        </form>
      </div>
    </main>
  );
}
