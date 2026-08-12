"use client";

import Link from "next/link";
import { makeStyles, tokens, Text, Caption1, Avatar, Badge, Button } from "@fluentui/react-components";
import { FlagFilled, FlagRegular } from "@fluentui/react-icons";
import { toggleFlag } from "@/app/actions/stakeholder";

const riskColor = { high: "danger", medium: "warning", low: "success" } as const;
const riskLabel = { high: "High risk", medium: "Medium risk", low: "Low risk" } as const;
const sentColor = { supportive: "success", neutral: "warning", resistant: "danger" } as const;
const sentLabel = { supportive: "Supportive", neutral: "Neutral", resistant: "Resistant" } as const;

/** Summary shape used by list views (home + directory pre-filter). */
export type StakeholderSummary = {
  id: string;
  name: string;
  function: string;
  category: string;
  tier: number;
  risk: "low" | "medium" | "high";
  sentiment: "supportive" | "neutral" | "resistant";
  flagged: boolean;
};

const useStyles = makeStyles({
  card: {
    display: "flex",
    alignItems: "center",
    backgroundColor: tokens.colorNeutralBackground1,
    border: `1px solid ${tokens.colorNeutralStroke2}`,
    borderRadius: tokens.borderRadiusXLarge,
    transitionProperty: "box-shadow, border-color",
    transitionDuration: tokens.durationNormal,
    ":hover": { boxShadow: tokens.shadow8, border: `1px solid ${tokens.colorBrandStroke1}` },
  },
  content: {
    display: "flex",
    alignItems: "center",
    columnGap: "14px",
    padding: "14px 16px",
    flexGrow: 1,
    minWidth: 0,
    textDecoration: "none",
    color: "inherit",
    cursor: "pointer",
    // On very narrow phones, let the status pills wrap to their own line.
    "@media (max-width: 440px)": { flexWrap: "wrap", rowGap: "10px" },
  },
  mid: { display: "flex", flexDirection: "column", rowGap: "3px", flexGrow: 1, minWidth: 0 },
  nameRow: { display: "flex", alignItems: "center", columnGap: "8px", flexWrap: "wrap" },
  meta: { color: tokens.colorNeutralForeground3 },
  pills: {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-end",
    rowGap: "6px",
    flexShrink: 0,
    "@media (max-width: 440px)": {
      flexDirection: "row",
      alignItems: "center",
      columnGap: "8px",
      marginLeft: "54px",
    },
  },
  flag: { display: "inline-flex", alignItems: "center", columnGap: "4px" },
  flagForm: { margin: 0, display: "flex", flexShrink: 0, paddingRight: "8px" },
});

export function StakeholderCard({
  id,
  name,
  tier,
  risk,
  sentiment,
  flagged,
  meta,
  canFlag = false,
}: {
  id: string;
  name: string;
  tier: number;
  risk: "low" | "medium" | "high";
  sentiment: "supportive" | "neutral" | "resistant";
  flagged: boolean;
  meta: string;
  canFlag?: boolean;
}) {
  const styles = useStyles();
  return (
    <div className={styles.card}>
      <Link href={`/directory/${id}`} className={styles.content}>
        <Avatar name={name} color="colorful" size={40} shape="square" />
        <div className={styles.mid}>
          <div className={styles.nameRow}>
            <Text weight="semibold">{name}</Text>
            <Badge appearance="tint" color="informative" size="small">
              {`Tier ${tier}`}
            </Badge>
            {flagged && (
              <Badge appearance="tint" color="danger" size="small">
                <span className={styles.flag}>
                  <FlagFilled fontSize={12} /> Flagged
                </span>
              </Badge>
            )}
          </div>
          <Caption1 className={styles.meta}>{meta}</Caption1>
        </div>
        <div className={styles.pills}>
          <Badge appearance="filled" color={riskColor[risk]}>
            {riskLabel[risk]}
          </Badge>
          <Badge appearance="tint" color={sentColor[sentiment]}>
            {sentLabel[sentiment]}
          </Badge>
        </div>
      </Link>

      {canFlag && (
        <form action={toggleFlag} className={styles.flagForm}>
          <input type="hidden" name="id" value={id} />
          <input type="hidden" name="flag" value={flagged ? "false" : "true"} />
          <Button
            type="submit"
            appearance="subtle"
            icon={flagged ? <FlagFilled /> : <FlagRegular />}
            aria-label={flagged ? "Unflag" : "Flag"}
            title={flagged ? "Unflag stakeholder" : "Flag stakeholder"}
          />
        </form>
      )}
    </div>
  );
}
