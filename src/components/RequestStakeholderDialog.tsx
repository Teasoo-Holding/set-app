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
  Input,
  Textarea,
  MessageBar,
  MessageBarBody,
  makeStyles,
} from "@fluentui/react-components";
import { PersonAddRegular } from "@fluentui/react-icons";
import { requestStakeholder } from "@/app/actions/stakeholder";

const useStyles = makeStyles({
  form: { display: "flex", flexDirection: "column", rowGap: "14px", paddingTop: "4px" },
});

export function RequestStakeholderDialog({ categories }: { categories: string[] }) {
  const styles = useStyles();
  const [open, setOpen] = React.useState(false);
  const [pending, setPending] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [done, setDone] = React.useState(false);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const fd = new FormData(e.currentTarget);
    setPending(true);
    requestStakeholder(fd)
      .then(() => {
        setPending(false);
        setDone(true);
      })
      .catch((err: unknown) => {
        setPending(false);
        setError(err instanceof Error ? err.message : "Could not submit.");
      });
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(_, d) => {
        setOpen(d.open);
        if (!d.open) {
          setDone(false);
          setError(null);
        }
      }}
    >
      <DialogTrigger disableButtonEnhancement>
        <Button appearance="outline" icon={<PersonAddRegular />}>
          Request a stakeholder
        </Button>
      </DialogTrigger>
      <DialogSurface>
        <DialogBody>
          <DialogTitle>Request a new stakeholder</DialogTitle>
          <DialogContent>
            {done ? (
              <MessageBar intent="success">
                <MessageBarBody>
                  Request submitted — an admin will review it.
                </MessageBarBody>
              </MessageBar>
            ) : (
              <form id="request-form" onSubmit={handleSubmit}>
                <div className={styles.form}>
                  {error && (
                    <MessageBar intent="error">
                      <MessageBarBody>{error}</MessageBarBody>
                    </MessageBar>
                  )}
                  <Field label="Name" required>
                    <Input name="requested_name" placeholder="e.g. West Coast Logistics Co" required />
                  </Field>
                  <Field label="Category" required>
                    <Select name="category" defaultValue="" required>
                      <option value="" disabled>
                        Select…
                      </option>
                      {categories.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </Select>
                  </Field>
                  <Field label="Reason" required>
                    <Textarea
                      name="reason"
                      resize="vertical"
                      placeholder="Why should this stakeholder be tracked?"
                      required
                    />
                  </Field>
                </div>
              </form>
            )}
          </DialogContent>
          <DialogActions>
            <Button appearance="secondary" type="button" onClick={() => setOpen(false)}>
              {done ? "Close" : "Cancel"}
            </Button>
            {!done && (
              <Button appearance="primary" type="submit" form="request-form" disabled={pending}>
                {pending ? "Submitting…" : "Submit request"}
              </Button>
            )}
          </DialogActions>
        </DialogBody>
      </DialogSurface>
    </Dialog>
  );
}
