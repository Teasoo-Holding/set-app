"use client";

import Link from "next/link";
import {
  makeStyles,
  tokens,
  Title2,
  Title3,
  Body1,
  Caption1,
  Text,
  Avatar,
  Badge,
  Button,
  Select,
  Input,
  Field,
  Divider,
} from "@fluentui/react-components";
import { ArrowLeftRegular, FlagFilled, FlagRegular } from "@fluentui/react-icons";
import { AppShell } from "@/components/AppShell";
import { LogEngagementDialog } from "@/components/LogEngagementDialog";
import { updateStakeholder, toggleFlag } from "@/app/actions/stakeholder";
import type { Role } from "@/lib/roles";

export type StakeholderProfile = {
  id: string;
  name: string;
  category: string;
  function: string;
  tier: number;
  risk: "low" | "medium" | "high";
  sentiment: "supportive" | "neutral" | "resistant";
  flagged: boolean;
  flag_reason: string | null;
  last_contact_at: string | null;
  notes: string | null;
  ownerName: string | null;
};

type Engagement = {
  id: string;
  type: string;
  occurred_on: string;
  notes: string | null;
  logger: { full_name: string } | null;
};
type Commitment = {
  id: string;
  description: string;
  due_date: string;
  priority: "high" | "low";
  status: string;
};
type Escalation = {
  id: string;
  severity: "elevated" | "critical";
  status: string;
  summary: string | null;
  opened_at: string;
  next_action_date: string | null;
};

const riskColor = { high: "danger", medium: "warning", low: "success" } as const;
const riskLabel = { high: "High risk", medium: "Medium risk", low: "Low risk" } as const;
const sentColor = { supportive: "success", neutral: "warning", resistant: "danger" } as const;
const sentLabel = { supportive: "Supportive", neutral: "Neutral", resistant: "Resistant" } as const;

function fmt(iso: string | null, withYear = false): string {
  if (!iso) return "—";
  const d = new Date(iso + "T00:00:00");
  return d.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    ...(withYear ? { year: "numeric" } : {}),
  });
}
function isOverdue(due: string): boolean {
  return new Date(due + "T00:00:00") < new Date(new Date().toDateString());
}

const useStyles = makeStyles({
  main: { maxWidth: "880px", margin: "0 auto", padding: "24px", display: "flex", flexDirection: "column", rowGap: "16px", "@media (max-width: 640px)": { padding: "16px 12px" } },
  back: { display: "inline-flex", alignItems: "center", columnGap: "6px", color: tokens.colorNeutralForeground3, textDecoration: "none", width: "fit-content", ":hover": { color: tokens.colorBrandForeground1 } },
  card: { backgroundColor: tokens.colorNeutralBackground1, border: `1px solid ${tokens.colorNeutralStroke2}`, borderRadius: tokens.borderRadiusXLarge, padding: "20px" },
  headRow: { display: "flex", alignItems: "flex-start", columnGap: "16px" },
  headMid: { display: "flex", flexDirection: "column", rowGap: "6px", flexGrow: 1, minWidth: 0 },
  nameRow: { display: "flex", alignItems: "center", columnGap: "8px", flexWrap: "wrap" },
  pillRow: { display: "flex", alignItems: "center", columnGap: "8px", rowGap: "8px", flexWrap: "wrap", marginTop: "4px" },
  ownerPill: { padding: "3px 10px", borderRadius: tokens.borderRadiusCircular, backgroundColor: tokens.colorNeutralBackground3, color: tokens.colorNeutralForeground2, fontSize: tokens.fontSizeBase200 },
  banner: { display: "flex", columnGap: "10px", padding: "14px 16px", borderRadius: tokens.borderRadiusMedium, backgroundColor: tokens.colorStatusDangerBackground1, border: `1px solid ${tokens.colorStatusDangerBorder1}` },
  bannerDot: { width: "8px", height: "8px", borderRadius: "50%", backgroundColor: tokens.colorStatusDangerForeground1, marginTop: "6px", flexShrink: 0 },
  sectionHead: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" },
  timeline: { display: "flex", flexDirection: "column" },
  entry: { display: "flex", columnGap: "12px", paddingBottom: "16px" },
  rail: { display: "flex", flexDirection: "column", alignItems: "center", flexShrink: 0 },
  dot: { width: "10px", height: "10px", borderRadius: "50%", backgroundColor: tokens.colorBrandBackground, marginTop: "4px" },
  line: { width: "2px", flexGrow: 1, backgroundColor: tokens.colorNeutralStroke2, marginTop: "4px" },
  entryBody: { display: "flex", flexDirection: "column", rowGap: "2px", flexGrow: 1, minWidth: 0 },
  entryTop: { display: "flex", justifyContent: "space-between", columnGap: "8px" },
  commitRow: { display: "flex", alignItems: "center", columnGap: "10px", rowGap: "8px", flexWrap: "wrap", padding: "10px 0", borderTop: `1px solid ${tokens.colorNeutralStroke2}` },
  commitDesc: { flexGrow: 1, minWidth: "150px" },
  commitBadges: { display: "flex", alignItems: "center", columnGap: "8px", flexShrink: 0, marginLeft: "auto" },
  muted: { color: tokens.colorNeutralForeground3 },
  empty: { color: tokens.colorNeutralForeground3, padding: "8px 0" },
  form: { margin: 0, display: "flex" },
  manage: { backgroundColor: tokens.colorNeutralBackground1, border: `1px solid ${tokens.colorNeutralStroke2}`, borderRadius: tokens.borderRadiusXLarge, padding: "20px", display: "flex", flexDirection: "column", rowGap: "14px" },
  manageForm: { margin: 0, display: "flex", flexDirection: "column", rowGap: "8px" },
  manageRow: { display: "flex", alignItems: "flex-end", columnGap: "12px", rowGap: "12px", flexWrap: "wrap" },
  field: { minWidth: "120px" },
  flagRow: { display: "flex", alignItems: "center", justifyContent: "space-between", columnGap: "12px", rowGap: "10px", flexWrap: "wrap" },
  flagForm: { margin: 0, display: "flex", alignItems: "flex-end", columnGap: "8px", rowGap: "8px", flexWrap: "wrap" },
  reason: { flexGrow: 1, minWidth: "180px" },
});

export function ProfileView({
  viewer,
  stakeholder: s,
  engagements,
  commitments,
  escalation,
  types,
  today,
  canEdit,
}: {
  viewer: { full_name: string; role: Role; function: string | null };
  stakeholder: StakeholderProfile;
  engagements: Engagement[];
  commitments: Commitment[];
  escalation: Escalation | null;
  types: string[];
  today: string;
  canEdit: boolean;
}) {
  const styles = useStyles();

  return (
    <AppShell profile={viewer} active="directory">
      <main className={styles.main}>
        <Link href="/directory" className={styles.back}>
          <ArrowLeftRegular fontSize={16} /> Directory
        </Link>

        {/* Header */}
        <div className={styles.card}>
          <div className={styles.headRow}>
            <Avatar name={s.name} color="colorful" size={56} shape="square" />
            <div className={styles.headMid}>
              <div className={styles.nameRow}>
                <Title2>{s.name}</Title2>
                <Badge appearance="tint" color="informative" size="small">{`Tier ${s.tier}`}</Badge>
                {s.flagged && (
                  <Badge appearance="tint" color="danger" size="small">
                    <FlagFilled fontSize={12} /> Flagged
                  </Badge>
                )}
              </div>
              <Caption1 className={styles.muted}>{`${s.category} · ${s.function}`}</Caption1>
              <div className={styles.pillRow}>
                <Badge appearance="filled" color={riskColor[s.risk]}>{riskLabel[s.risk]}</Badge>
                <Badge appearance="tint" color={sentColor[s.sentiment]}>{sentLabel[s.sentiment]}</Badge>
                <span className={styles.ownerPill}>{`Owner · ${s.ownerName ?? "Unassigned"}`}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Manage: tier / risk / sentiment / flag (E2-6, E5-1, E5-3) */}
        {canEdit && (
          <div className={styles.manage}>
            <Title3>Manage</Title3>
            <form action={updateStakeholder} className={styles.manageForm}>
              <input type="hidden" name="id" value={s.id} />
              <div className={styles.manageRow}>
                <Field label="Tier" className={styles.field}>
                  <Select name="tier" defaultValue={String(s.tier)}>
                    <option value="1">Tier 1</option>
                    <option value="2">Tier 2</option>
                  </Select>
                </Field>
                <Field label="Risk" className={styles.field}>
                  <Select name="risk" defaultValue={s.risk}>
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </Select>
                </Field>
                <Field label="Sentiment" className={styles.field}>
                  <Select name="sentiment" defaultValue={s.sentiment}>
                    <option value="supportive">Supportive</option>
                    <option value="neutral">Neutral</option>
                    <option value="resistant">Resistant</option>
                  </Select>
                </Field>
                <Button type="submit" appearance="primary">
                  Save
                </Button>
              </div>
              <Caption1 className={styles.muted}>
                Tier rubric: impact · power · escalation potential · cadence. Setting High
                risk / Resistant may open an escalation.
              </Caption1>
            </form>

            <Divider />

            {s.flagged ? (
              <div className={styles.flagRow}>
                <Body1>
                  <strong>Flagged.</strong> {s.flag_reason ?? "No reason given."}
                </Body1>
                <form action={toggleFlag} className={styles.form}>
                  <input type="hidden" name="id" value={s.id} />
                  <input type="hidden" name="flag" value="false" />
                  <Button type="submit" appearance="outline" icon={<FlagFilled />}>
                    Unflag
                  </Button>
                </form>
              </div>
            ) : (
              <form action={toggleFlag} className={styles.flagForm}>
                <input type="hidden" name="id" value={s.id} />
                <input type="hidden" name="flag" value="true" />
                <Input
                  className={styles.reason}
                  name="reason"
                  placeholder="Reason for flagging (optional)"
                />
                <Button type="submit" appearance="primary" icon={<FlagRegular />}>
                  Flag
                </Button>
              </form>
            )}
          </div>
        )}

        {/* Escalation banner */}
        {escalation && (
          <div className={styles.banner}>
            <span className={styles.bannerDot} />
            <div>
              <Text weight="semibold">
                {escalation.severity === "critical" ? "Critical escalation" : "Escalation active"}
                {escalation.next_action_date ? ` · next action ${fmt(escalation.next_action_date)}` : ""}
              </Text>
              {escalation.summary && <Body1> — {escalation.summary}</Body1>}
            </div>
          </div>
        )}

        {/* Open commitments */}
        <div className={styles.card}>
          <div className={styles.sectionHead}>
            <Title3>Open commitments</Title3>
            <Caption1 className={styles.muted}>{commitments.length}</Caption1>
          </div>
          {commitments.length === 0 ? (
            <div className={styles.empty}>No open commitments.</div>
          ) : (
            commitments.map((c) => (
              <div key={c.id} className={styles.commitRow}>
                <span className={styles.commitDesc}>
                  <Body1>{c.description}</Body1>
                </span>
                <span className={styles.commitBadges}>
                  {c.priority === "high" && (
                    <Badge appearance="tint" color="danger" size="small">High</Badge>
                  )}
                  <Badge
                    appearance="tint"
                    color={isOverdue(c.due_date) ? "danger" : "informative"}
                    size="small"
                  >
                    {isOverdue(c.due_date) ? `Overdue · ${fmt(c.due_date)}` : `Due ${fmt(c.due_date)}`}
                  </Badge>
                </span>
              </div>
            ))
          )}
        </div>

        {/* Engagement history */}
        <div className={styles.card}>
          <div className={styles.sectionHead}>
            <Title3>Engagement history</Title3>
            <LogEngagementDialog
              stakeholderId={s.id}
              stakeholderName={s.name}
              types={types}
              currentRisk={s.risk}
              currentSentiment={s.sentiment}
              today={today}
            />
          </div>
          {engagements.length === 0 ? (
            <div className={styles.empty}>No engagements logged yet.</div>
          ) : (
            <div className={styles.timeline}>
              {engagements.map((e, i) => (
                <div key={e.id} className={styles.entry}>
                  <div className={styles.rail}>
                    <span className={styles.dot} />
                    {i < engagements.length - 1 && <span className={styles.line} />}
                  </div>
                  <div className={styles.entryBody}>
                    <div className={styles.entryTop}>
                      <Text weight="semibold">
                        {e.type}
                        <Caption1 className={styles.muted}>{`  ·  ${e.logger?.full_name ?? "Unknown"}`}</Caption1>
                      </Text>
                      <Caption1 className={styles.muted}>{fmt(e.occurred_on, true)}</Caption1>
                    </div>
                    {e.notes && <Body1 className={styles.muted}>{e.notes}</Body1>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </AppShell>
  );
}
