"use client";

import {
  makeStyles,
  tokens,
  Avatar,
  Badge,
  Button,
  Text,
  Caption1,
} from "@fluentui/react-components";
import { SignOutRegular } from "@fluentui/react-icons";
import { BrandMark } from "@/components/BrandMark";
import { signOut } from "@/app/actions/auth";
import { ROLE_LABEL, type Role } from "@/lib/roles";

const useStyles = makeStyles({
  header: {
    display: "flex",
    alignItems: "center",
    columnGap: "12px",
    padding: "12px 24px",
    backgroundColor: tokens.colorNeutralBackground1,
    borderBottom: `1px solid ${tokens.colorNeutralStroke2}`,
  },
  brand: { display: "flex", alignItems: "center", columnGap: "8px" },
  spacer: { flexGrow: 1 },
  user: { display: "flex", alignItems: "center", columnGap: "10px" },
  who: { display: "flex", flexDirection: "column", alignItems: "flex-end" },
  form: { margin: 0, display: "flex" },
});

export function AppHeader({
  name,
  role,
  func,
}: {
  name: string;
  role: Role;
  func: string | null;
}) {
  const styles = useStyles();
  const roleColor =
    role === "leadership" || role === "admin" ? "brand" : "informative";

  return (
    <header className={styles.header}>
      <div className={styles.brand}>
        <BrandMark size="sm" />
        <Text weight="semibold">SIS</Text>
      </div>
      <div className={styles.spacer} />
      <div className={styles.user}>
        <div className={styles.who}>
          <Text weight="semibold">{name}</Text>
          <Caption1>
            <Badge appearance="tint" color={roleColor} size="small">
              {ROLE_LABEL[role]}
            </Badge>
            {func ? ` · ${func}` : ""}
          </Caption1>
        </div>
        <Avatar name={name} color="colorful" />
        <form action={signOut} className={styles.form}>
          <Button
            type="submit"
            appearance="subtle"
            icon={<SignOutRegular />}
            aria-label="Sign out"
          />
        </form>
      </div>
    </header>
  );
}
