"use client";

import {
  makeStyles,
  tokens,
  Table,
  TableHeader,
  TableHeaderCell,
  TableBody,
  TableRow,
  TableCell,
  Badge,
  Text,
} from "@fluentui/react-components";
import { FlagFilled } from "@fluentui/react-icons";

export type StakeholderRow = {
  id: string;
  name: string;
  function: string;
  category: string;
  tier: number;
  risk: "low" | "medium" | "high";
  sentiment: "supportive" | "neutral" | "resistant";
  flagged: boolean;
};

const riskColor = { high: "danger", medium: "warning", low: "success" } as const;
const riskLabel = { high: "High", medium: "Medium", low: "Low" } as const;
const sentColor = {
  supportive: "success",
  neutral: "informative",
  resistant: "danger",
} as const;
const sentLabel = {
  supportive: "Supportive",
  neutral: "Neutral",
  resistant: "Resistant",
} as const;

const useStyles = makeStyles({
  wrap: { overflowX: "auto", width: "100%" },
  // Keep columns readable on small screens: don't let text wrap/crush — the
  // wrapper scrolls horizontally instead.
  table: {
    minWidth: "620px",
    "& td": { whiteSpace: "nowrap" },
    "& th": { whiteSpace: "nowrap" },
  },
  name: { display: "flex", alignItems: "center", columnGap: "6px" },
  flag: { color: tokens.colorStatusDangerForeground1, fontSize: "14px" },
  empty: {
    padding: "24px",
    textAlign: "center",
    color: tokens.colorNeutralForeground3,
  },
});

export function StakeholderTable({ rows }: { rows: StakeholderRow[] }) {
  const styles = useStyles();

  if (rows.length === 0) {
    return (
      <div className={styles.empty}>
        <Text>No stakeholders in your scope.</Text>
      </div>
    );
  }

  return (
    <div className={styles.wrap}>
      <Table aria-label="Stakeholders in scope" size="small" className={styles.table}>
        <TableHeader>
          <TableRow>
            <TableHeaderCell>Name</TableHeaderCell>
            <TableHeaderCell>Function</TableHeaderCell>
            <TableHeaderCell>Category</TableHeaderCell>
            <TableHeaderCell>Tier</TableHeaderCell>
            <TableHeaderCell>Risk</TableHeaderCell>
            <TableHeaderCell>Sentiment</TableHeaderCell>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((r) => (
            <TableRow key={r.id}>
              <TableCell>
                <span className={styles.name}>
                  {r.flagged && <FlagFilled className={styles.flag} aria-label="Flagged" />}
                  <Text weight="semibold">{r.name}</Text>
                </span>
              </TableCell>
              <TableCell>{r.function}</TableCell>
              <TableCell>{r.category}</TableCell>
              <TableCell>{`Tier ${r.tier}`}</TableCell>
              <TableCell>
                <Badge appearance="tint" color={riskColor[r.risk]}>
                  {riskLabel[r.risk]}
                </Badge>
              </TableCell>
              <TableCell>
                <Badge appearance="tint" color={sentColor[r.sentiment]}>
                  {sentLabel[r.sentiment]}
                </Badge>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
