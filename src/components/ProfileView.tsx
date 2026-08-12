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
} from "@fluentui/react-components";
import { ArrowLeftRegular, FlagFilled } from "@fluentui/react-icons";
import { AppShell } from "@/components/AppShell";
import { LogEngagementDialog } from "@/components/LogEngagementDialog";
import { setTier } from "@/app/actions/stakeholder";
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
  commitRow: { display: "flex", alignItems: "center", columnGap: "10px", padding: "10px 0", borderTop: `1px solid ${tokens.colorNeutralStroke2}` },
  commitDesc: { flexGrow: 1, minWidth: 0 },
  muted: { color: tokens.colorNeutralForeground3 },
  empty: { color: tokens.colorNeutralForeground3, padding: "8px 0" },
  tierEdit: { display: "flex", flexDirection: "column", rowGap: "6px", marginTop: "12px", paddingTop: "12px", borderTop: `1px solid ${tokens.colorNeutralStroke2}` },
  tierBtns: { display: "flex", columnGap: "8px" },
  form: { margin: 0, display: "flex" },
});

export function ProfileView({
  viewer,
  stakeholder: s,
  engagements,
  commitments,
  escalation,
  types,
  today,
}: {
  viewer: { full_name: string; role: Role; function: string | null };
  stakeholder: StakeholderProfile;
  engagements: Engagement[];
  commitments: Commitment[];
  escalation: Escalation | null;
  types: string[];
  today: string;
}) {
  const styles = useStyles();
  const canEditTier =
    viewer.role === "head" || viewer.role === "leadership" || viewer.role === "admin";

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
          {canEditTier && (
            <div className={styles.tierEdit}>
              <Caption1 className={styles.muted}>
                Set tier · rubric: impact · power · escalation potential · cadence
              </Caption1>
              <div className={styles.tierBtns}>
                {[1, 2].map((t) => (
                  <form key={t} action={setTier} className={styles.form}>
                    <input type="hidden" name="id" value={s.id} />
                    <input type="hidden" name="tier" value={t} />
                    <Button
                      type="submit"
                      size="small"
                      appearance={s.tier === t ? "primary" : "outline"}
                    >
                      {`Tier ${t}`}
                    </Button>
                  </form>
                ))}
              </div>
            </div>
          )}
        </div>

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
