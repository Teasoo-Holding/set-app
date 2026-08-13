"use client";

import * as React from "react";
import { makeStyles, tokens, Title2, Title3, Body1, Caption1, Text, Button, Badge, Input, Select, Divider } from "@fluentui/react-components";
import { AppShell } from "@/components/AppShell";
import { approveRequest, rejectRequest, addTaxonomy, setTaxonomyActive, reassignStakeholders } from "@/app/actions/governance";
import type { Role } from "@/lib/roles";

export type PendingRequest = {
  id: string;
  name: string;
  category: string;
  reason: string;
  createdAt: string;
  requesterName: string;
};
export type TaxonomyValue = {
  id: string;
  kind: "category" | "function" | "engagement_type";
  value: string;
  label: string;
  is_active: boolean;
};
export type PersonOption = { id: string; name: string; role: string; owns: number };

const KINDS: { key: TaxonomyValue["kind"]; label: string }[] = [
  { key: "category", label: "Categories" },
  { key: "function", label: "Functions" },
  { key: "engagement_type", label: "Engagement types" },
];

function fmt(iso: string): string {
  return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

const useStyles = makeStyles({
  main: { maxWidth: "900px", margin: "0 auto", padding: "32px 24px", display: "flex", flexDirection: "column", rowGap: "20px", "@media (max-width: 640px)": { padding: "16px 12px" } },
  head: { display: "flex", flexDirection: "column", rowGap: "2px" },
  card: { padding: "20px", backgroundColor: tokens.colorNeutralBackground1, border: `1px solid ${tokens.colorNeutralStroke2}`, borderRadius: tokens.borderRadiusXLarge, display: "flex", flexDirection: "column", rowGap: "12px" },
  sectionHead: { display: "flex", alignItems: "center", justifyContent: "space-between", columnGap: "8px" },
  reqRow: { display: "flex", alignItems: "flex-start", columnGap: "12px", rowGap: "10px", flexWrap: "wrap", padding: "12px 0", borderTop: `1px solid ${tokens.colorNeutralStroke2}` },
  reqBody: { display: "flex", flexDirection: "column", rowGap: "3px", flexGrow: 1, minWidth: "220px" },
  reqActions: { display: "flex", alignItems: "center", columnGap: "8px", flexShrink: 0 },
  nameRow: { display: "flex", alignItems: "center", columnGap: "8px", flexWrap: "wrap" },
  muted: { color: tokens.colorNeutralForeground3 },
  form: { margin: 0, display: "flex" },
  taxGroup: { display: "flex", flexDirection: "column", rowGap: "6px" },
  taxRow: { display: "flex", alignItems: "center", columnGap: "8px", flexWrap: "wrap" },
  taxValues: { display: "flex", columnGap: "8px", rowGap: "8px", flexWrap: "wrap" },
  taxChip: { display: "inline-flex", alignItems: "center", columnGap: "6px", padding: "4px 6px 4px 12px", borderRadius: tokens.borderRadiusCircular, border: `1px solid ${tokens.colorNeutralStroke2}` },
  addRow: { display: "flex", columnGap: "8px", marginTop: "4px" },
  reassign: { display: "flex", columnGap: "12px", rowGap: "12px", flexWrap: "wrap", alignItems: "flex-end" },
  field: { display: "flex", flexDirection: "column", rowGap: "4px", minWidth: "200px" },
  empty: { color: tokens.colorNeutralForeground3, paddingTop: "4px" },
});

export function GovernanceAdmin({
  viewer,
  requests,
  taxonomy,
  persons,
}: {
  viewer: { full_name: string; role: Role; function: string | null };
  requests: PendingRequest[];
  taxonomy: TaxonomyValue[];
  persons: PersonOption[];
}) {
  const styles = useStyles();
  const owners = persons.filter((p) => p.owns > 0);
  const [fromId, setFromId] = React.useState<string>("");
  const [toId, setToId] = React.useState<string>("");
  const movingCount = persons.find((p) => p.id === fromId)?.owns ?? 0;

  return (
    <AppShell profile={viewer} active="governance">
      <main className={styles.main}>
        <div className={styles.head}>
          <Title2>Governance &amp; administration</Title2>
          <Body1>Approve requests, manage the taxonomy, and reassign ownership.</Body1>
        </div>

        {/* E10-1 approval queue */}
        <div className={styles.card}>
          <div className={styles.sectionHead}>
            <Title3>Pending stakeholder requests</Title3>
            <Caption1 className={styles.muted}>{requests.length}</Caption1>
          </div>
          {requests.length === 0 ? (
            <div className={styles.empty}>No requests waiting. 🎉</div>
          ) : (
            requests.map((r) => (
              <div key={r.id} className={styles.reqRow}>
                <div className={styles.reqBody}>
                  <div className={styles.nameRow}>
                    <Text weight="semibold">{r.name}</Text>
                    <Badge appearance="tint" color="informative" size="small">{r.category}</Badge>
                  </div>
                  <Caption1 className={styles.muted}>{`Requested by ${r.requesterName} · ${fmt(r.createdAt)}`}</Caption1>
                  <Body1>{r.reason}</Body1>
                </div>
                <div className={styles.reqActions}>
                  <form action={rejectRequest} className={styles.form}>
                    <input type="hidden" name="id" value={r.id} />
                    <Button type="submit" size="small" appearance="subtle">Reject</Button>
                  </form>
                  <form action={approveRequest} className={styles.form}>
                    <input type="hidden" name="id" value={r.id} />
                    <Button type="submit" size="small" appearance="primary">Approve</Button>
                  </form>
                </div>
              </div>
            ))
          )}
        </div>

        {/* E10-2 taxonomy editor */}
        <div className={styles.card}>
          <Title3>Taxonomy</Title3>
          {KINDS.map((k) => {
            const values = taxonomy.filter((t) => t.kind === k.key);
            return (
              <div key={k.key} className={styles.taxGroup}>
                <Caption1 className={styles.muted}>{k.label}</Caption1>
                <div className={styles.taxValues}>
                  {values.map((t) => (
                    <span key={t.id} className={styles.taxChip} style={{ opacity: t.is_active ? 1 : 0.5 }}>
                      <Text>{t.value}</Text>
                      <form action={setTaxonomyActive} className={styles.form}>
                        <input type="hidden" name="id" value={t.id} />
                        <input type="hidden" name="active" value={t.is_active ? "false" : "true"} />
                        <Button type="submit" size="small" appearance="subtle">
                          {t.is_active ? "Disable" : "Enable"}
                        </Button>
                      </form>
                    </span>
                  ))}
                </div>
                <form action={addTaxonomy} className={styles.addRow}>
                  <input type="hidden" name="kind" value={k.key} />
                  <Input name="value" size="small" placeholder={`Add a ${k.label.slice(0, -1).toLowerCase()}…`} />
                  <Button type="submit" size="small" appearance="outline">Add</Button>
                </form>
                <Divider />
              </div>
            );
          })}
        </div>

        {/* E10-3 reassignment */}
        <div className={styles.card}>
          <Title3>Reassign ownership</Title3>
          <Caption1 className={styles.muted}>Move every stakeholder from one owner to another — useful when someone leaves.</Caption1>
          <form action={reassignStakeholders} className={styles.reassign}>
            <label className={styles.field}>
              <Caption1>From</Caption1>
              <Select name="from" value={fromId} onChange={(_, d) => setFromId(d.value)}>
                <option value="">Select…</option>
                {owners.map((p) => (
                  <option key={p.id} value={p.id}>{`${p.name} (${p.owns})`}</option>
                ))}
              </Select>
            </label>
            <label className={styles.field}>
              <Caption1>To</Caption1>
              <Select name="to" value={toId} onChange={(_, d) => setToId(d.value)}>
                <option value="">Select…</option>
                {persons.map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </Select>
            </label>
            <Button type="submit" appearance="primary" disabled={!fromId || !toId || fromId === toId}>
              {movingCount > 0 ? `Reassign ${movingCount}` : "Reassign"}
            </Button>
          </form>
        </div>
      </main>
    </AppShell>
  );
}
