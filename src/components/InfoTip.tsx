"use client";

import * as React from "react";
import { Tooltip, makeStyles, tokens } from "@fluentui/react-components";
import { InfoRegular } from "@fluentui/react-icons";

const useStyles = makeStyles({
  trigger: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    verticalAlign: "middle",
    color: tokens.colorNeutralForeground3,
    cursor: "help",
    borderRadius: tokens.borderRadiusCircular,
    ":hover": { color: tokens.colorNeutralForeground1 },
    ":focus-visible": { outline: `2px solid ${tokens.colorStrokeFocus2}`, outlineOffset: "1px" },
  },
});

/**
 * A small, focusable info icon that shows a plain-language explanation on hover
 * or keyboard focus. Use it next to a label, metric or jargon term so people can
 * learn what it means without cluttering the page. Keep `content` short and in
 * plain English.
 */
export function InfoTip({
  content,
  label = "More information",
  size = 14,
}: {
  content: string;
  label?: string;
  size?: number;
}) {
  const styles = useStyles();
  return (
    <Tooltip content={content} relationship="description" withArrow positioning="above">
      <span className={styles.trigger} tabIndex={0} role="button" aria-label={label}>
        <InfoRegular fontSize={size} />
      </span>
    </Tooltip>
  );
}
