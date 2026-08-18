"use client";

import { makeStyles, tokens, Title2, Body1, Button } from "@fluentui/react-components";

const useStyles = makeStyles({
  wrap: {
    minHeight: "60vh",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    textAlign: "center",
    rowGap: "12px",
    padding: "40px 24px",
    color: tokens.colorNeutralForeground1,
  },
  sub: { color: tokens.colorNeutralForeground2, maxWidth: "48ch" },
});

export default function Error({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const styles = useStyles();
  return (
    <div className={styles.wrap}>
      <Title2>Something didn&apos;t load</Title2>
      <Body1 className={styles.sub}>
        Sorry, that didn&apos;t work. Try again, and if it keeps happening, refresh the page or come back shortly.
      </Body1>
      <Button appearance="primary" onClick={() => reset()}>Try again</Button>
    </div>
  );
}
