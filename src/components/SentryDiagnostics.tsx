"use client";

import * as React from "react";
import { makeStyles, tokens, Button, Caption1, MessageBar, MessageBarBody } from "@fluentui/react-components";
import { sendSentryTestEvent } from "@/app/actions/diagnostics";

const useStyles = makeStyles({
  buttons: { display: "flex", columnGap: "8px", rowGap: "8px", flexWrap: "wrap" },
  note: { color: tokens.colorNeutralForeground3 },
});

/**
 * Admin-only Sentry verification. "Throw client error" raises an uncaught error
 * (via setTimeout, so it escapes React's handler and hits the global handler)
 * to test browser capture; "Send server test event" exercises the server SDK.
 */
export function SentryDiagnostics() {
  const styles = useStyles();
  const [pending, setPending] = React.useState(false);
  const [result, setResult] = React.useState<{ ok: boolean; message: string } | null>(null);

  const sendServerEvent = async () => {
    setPending(true);
    try {
      setResult(await sendSentryTestEvent());
    } finally {
      setPending(false);
    }
  };

  return (
    <>
      <div className={styles.buttons}>
        <Button appearance="secondary" disabled={pending} onClick={sendServerEvent}>
          Send server test event
        </Button>
        <Button
          appearance="secondary"
          onClick={() => {
            setTimeout(() => {
              throw new Error("Sentry client-side test error (admin diagnostics)");
            });
          }}
        >
          Throw client error
        </Button>
      </div>
      <Caption1 className={styles.note}>
        The client button intentionally crashes this page so you can confirm the error reaches Sentry. Refresh
        afterwards.
      </Caption1>
      {result && (
        <MessageBar intent={result.ok ? "success" : "error"}>
          <MessageBarBody>{result.message}</MessageBarBody>
        </MessageBar>
      )}
    </>
  );
}
