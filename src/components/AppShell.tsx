"use client";

import * as React from "react";
import Link from "next/link";
import {
  makeStyles,
  tokens,
  Text,
  Caption1,
  Avatar,
  Badge,
  Button,
} from "@fluentui/react-components";
import {
  HomeRegular,
  HomeFilled,
  PeopleRegular,
  PeopleFilled,
  FlagRegular,
  FlagFilled,
  SignOutRegular,
} from "@fluentui/react-icons";
import { BrandMark } from "@/components/BrandMark";
import { signOut } from "@/app/actions/auth";
import { ROLE_LABEL, getLandingPath, type Role } from "@/lib/roles";

const useStyles = makeStyles({
  layout: { display: "flex", minHeight: "100vh", backgroundColor: tokens.colorNeutralBackground2 },
  rail: {
    width: "232px",
    flexShrink: 0,
    backgroundColor: tokens.colorNeutralBackground1,
    borderRight: `1px solid ${tokens.colorNeutralStroke2}`,
    display: "flex",
    flexDirection: "column",
    padding: "16px 12px",
    position: "sticky",
    top: 0,
    height: "100vh",
  },
  brand: { display: "flex", alignItems: "center", columnGap: "8px", padding: "4px 8px 16px" },
  nav: { display: "flex", flexDirection: "column", rowGap: "2px", flexGrow: 1 },
  navItem: {
    display: "flex",
    alignItems: "center",
    columnGap: "10px",
    padding: "9px 12px",
    borderRadius: tokens.borderRadiusMedium,
    color: tokens.colorNeutralForeground2,
    textDecoration: "none",
    fontSize: tokens.fontSizeBase300,
    ":hover": { backgroundColor: tokens.colorNeutralBackground1Hover },
  },
  navItemActive: {
    backgroundColor: tokens.colorBrandBackground2,
    color: tokens.colorBrandForeground1,
    fontWeight: tokens.fontWeightSemibold,
  },
  navIcon: { fontSize: "20px", display: "flex" },
  navBadge: { marginLeft: "auto" },
  user: {
    borderTop: `1px solid ${tokens.colorNeutralStroke2}`,
    paddingTop: "12px",
    display: "flex",
    alignItems: "center",
    columnGap: "8px",
  },
  userText: { display: "flex", flexDirection: "column", minWidth: 0, flexGrow: 1 },
  content: { flexGrow: 1, minWidth: 0, overflowX: "hidden" },
  form: { margin: 0, display: "flex" },
});

type NavKey = "home" | "directory" | "escalations";

export function AppShell({
  profile,
  active,
  children,
}: {
  profile: { full_name: string; role: Role; function: string | null };
  active: NavKey;
  children: React.ReactNode;
}) {
  const styles = useStyles();

  const items: {
    key: NavKey;
    label: string;
    href: string;
    icon: React.ReactNode;
    iconActive: React.ReactNode;
  }[] = [
    { key: "home", label: "Home", href: getLandingPath(profile.role), icon: <HomeRegular />, iconActive: <HomeFilled /> },
    { key: "directory", label: "Directory", href: "/directory", icon: <PeopleRegular />, iconActive: <PeopleFilled /> },
    { key: "escalations", label: "Escalations", href: "/escalations", icon: <FlagRegular />, iconActive: <FlagFilled /> },
  ];

  return (
    <div className={styles.layout}>
      <nav className={styles.rail} aria-label="Primary">
        <div className={styles.brand}>
          <BrandMark size="sm" />
          <Text weight="semibold">Teasoo SET</Text>
        </div>

        <div className={styles.nav}>
          {items.map((it) => {
            const isActive = it.key === active;
            return (
              <Link
                key={it.key}
                href={it.href}
                className={`${styles.navItem} ${isActive ? styles.navItemActive : ""}`}
                aria-current={isActive ? "page" : undefined}
              >
                <span className={styles.navIcon}>{isActive ? it.iconActive : it.icon}</span>
                {it.label}
              </Link>
            );
          })}
        </div>

        <div className={styles.user}>
          <Avatar name={profile.full_name} color="colorful" size={32} />
          <span className={styles.userText}>
            <Text weight="semibold" truncate wrap={false}>
              {profile.full_name}
            </Text>
            <Caption1>
              <Badge appearance="tint" size="small" color={profile.role === "leadership" || profile.role === "admin" ? "brand" : "informative"}>
                {ROLE_LABEL[profile.role]}
              </Badge>
            </Caption1>
          </span>
          <form action={signOut} className={styles.form}>
            <Button type="submit" appearance="subtle" icon={<SignOutRegular />} aria-label="Sign out" />
          </form>
        </div>
      </nav>

      <div className={styles.content}>{children}</div>
    </div>
  );
}
