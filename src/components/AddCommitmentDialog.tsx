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
  Input,
  Select,
  MessageBar,
  MessageBarBody,
  makeStyles,
} from "@fluentui/react-components";
import { AddRegular } from "@fluentui/react-icons";
import { createCommitment } from "@/app/actions/commitment";

const useStyles = makeStyles({
  form: { display: "flex", flexDirection: "column", rowGap: "14px", paddingTop: "4px" },
  row: { display: "flex", columnGap: "12px", rowGap: "12px", "@media (max-width: 520px)": { flexDirection: "column" } },
  half: { flex: 1, minWidth: 0 },
});

export function AddCommitmentDialog({
  stakeholderId,
  today,
}: {
  stakeholderId: string;
  today: string;
}) {
  const styles = useStyles();
  const [open, setOpen] = React.useState(false);
  const [pending, setPending] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const fd = new FormData(e.currentTarget);
    setPending(true);
    createCommitment(fd)
      .then(() => {
        setPending(false);
        setOpen(false);
      })
      .catch((err: unknown) => {
        setPending(false);
        setError(err instanceof Error ? err.message : "Could not save.");
      });
  }

  return (
    <Dialog open={open} onOpenChange={(_, d) => setOpen(d.open)}>
      <DialogTrigger disableButtonEnhancement>
        <Button appearance="outline" icon={<AddRegular />} size="small">
          Add commitment
        </Button>
      </DialogTrigger>
      <DialogSurface>
        <form onSubmit={handleSubmit}>
          <input type="hidden" name="stakeholderId" value={stakeholderId} />
          <DialogBody>
            <DialogTitle>Add a commitment</DialogTitle>
            <DialogContent>
              <div className={styles.form}>
                {error && (
                  <MessageBar intent="error">
                    <MessageBarBody>{error}</MessageBarBody>
                  </MessageBar>
                )}
                <Field label="Description" required>
                  <Input name="description" placeholder="e.g. Send signed distribution agreement" required />
                </Field>
                <div className={styles.row}>
                  <Field label="Due date" required className={styles.half}>
                    <Input type="date" name="due_date" defaultValue={today} required />
                  </Field>
                  <Field label="Priority" className={styles.half}>
                    <Select name="priority" defaultValue="low">
                      <option value="low">Low</option>
                      <option value="high">High</option>
                    </Select>
                  </Field>
                </div>
              </div>
            </DialogContent>
            <DialogActions>
              <Button appearance="secondary" type="button" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button appearance="primary" type="submit" disabled={pending}>
                {pending ? "Saving…" : "Add commitment"}
              </Button>
            </DialogActions>
          </DialogBody>
        </form>
      </DialogSurface>
    </Dialog>
  );
}
