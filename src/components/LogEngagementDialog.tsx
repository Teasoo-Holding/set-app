"use client";

import * as React from "react";
import {
  Dialog,
  DialogTrigger,
  DialogSurface,
  DialogBody,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Field,
  Select,
  Textarea,
  Input,
  MessageBar,
  MessageBarBody,
  makeStyles,
  tokens,
} from "@fluentui/react-components";
import { AddRegular } from "@fluentui/react-icons";
import { logEngagement } from "@/app/actions/engagement";

const useStyles = makeStyles({
  form: { display: "flex", flexDirection: "column", rowGap: "14px", paddingTop: "4px" },
  row: { display: "flex", columnGap: "12px", rowGap: "14px", "@media (max-width: 520px)": { flexDirection: "column" } },
  half: { flex: 1, minWidth: 0 },
  optional: { color: tokens.colorNeutralForeground3, fontSize: tokens.fontSizeBase200 },
});

export function LogEngagementDialog({
  stakeholderId,
  stakeholderName,
  types,
  currentRisk,
  currentSentiment,
  today,
}: {
  stakeholderId: string;
  stakeholderName: string;
  types: string[];
  currentRisk: string;
  currentSentiment: string;
  today: string;
}) {
  const styles = useStyles();
  const [open, setOpen] = React.useState(false);
  const [pending, startTransition] = React.useState<boolean>(false);
  const [error, setError] = React.useState<string | null>(null);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const fd = new FormData(e.currentTarget);
    startTransition(true);
    logEngagement(fd)
      .then(() => {
        startTransition(false);
        setOpen(false);
      })
      .catch((err: unknown) => {
        startTransition(false);
        setError(err instanceof Error ? err.message : "Could not save.");
      });
  }

  return (
    <Dialog open={open} onOpenChange={(_, d) => setOpen(d.open)}>
      <DialogTrigger disableButtonEnhancement>
        <Button appearance="primary" icon={<AddRegular />} size="small">
          Log
        </Button>
      </DialogTrigger>
      <DialogSurface>
        <form onSubmit={handleSubmit}>
          <input type="hidden" name="stakeholderId" value={stakeholderId} />
          <DialogBody>
            <DialogTitle>{`Log engagement · ${stakeholderName}`}</DialogTitle>
            <DialogContent>
              <div className={styles.form}>
                {error && (
                  <MessageBar intent="error">
                    <MessageBarBody>{error}</MessageBarBody>
                  </MessageBar>
                )}
                <div className={styles.row}>
                  <Field label="Type" required className={styles.half}>
                    <Select name="type" defaultValue="" required>
                      <option value="" disabled>
                        Select…
                      </option>
                      {types.map((t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                    </Select>
                  </Field>
                  <Field label="Date" required className={styles.half}>
                    <Input type="date" name="occurred_on" defaultValue={today} required />
                  </Field>
                </div>

                <Field label="Notes">
                  <Textarea name="notes" resize="vertical" placeholder="What happened?" />
                </Field>

                <div className={styles.row}>
                  <Field label="Update risk" hint="optional" className={styles.half}>
                    <Select name="risk" defaultValue="">
                      <option value="">No change</option>
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </Select>
                  </Field>
                  <Field label="Update sentiment" hint="optional" className={styles.half}>
                    <Select name="sentiment" defaultValue="">
                      <option value="">No change</option>
                      <option value="supportive">Supportive</option>
                      <option value="neutral">Neutral</option>
                      <option value="resistant">Resistant</option>
                    </Select>
                  </Field>
                </div>
                <span className={styles.optional}>
                  {`Currently ${currentRisk} risk · ${currentSentiment}. Leave "No change" to keep.`}
                </span>
              </div>
            </DialogContent>
            <DialogActions>
              <Button appearance="secondary" type="button" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button appearance="primary" type="submit" disabled={pending}>
                {pending ? "Saving…" : "Save engagement"}
              </Button>
            </DialogActions>
          </DialogBody>
        </form>
      </DialogSurface>
    </Dialog>
  );
}
