"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  Dialog, DialogTrigger, DialogSurface, DialogBody, DialogTitle, DialogContent, DialogActions,
  Button, Field, Select, Input, Textarea, MessageBar, MessageBarBody, makeStyles,
} from "@fluentui/react-components";
import { EditRegular } from "@fluentui/react-icons";
import { updateRequest } from "@/app/actions/stakeholder";

const useStyles = makeStyles({
  form: { display: "flex", flexDirection: "column", rowGap: "14px", paddingTop: "4px" },
});

/** Edit a still-pending stakeholder request (#122). RLS restricts the update to
 *  the requester while pending; an admin decision locks it. */
export function EditRequestDialog({
  request,
  categories,
}: {
  request: { id: string; name: string; category: string; reason: string };
  categories: string[];
}) {
  const styles = useStyles();
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [pending, setPending] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const fd = new FormData(e.currentTarget);
    setPending(true);
    updateRequest(fd)
      .then(() => {
        setPending(false);
        setOpen(false);
        router.refresh();
      })
      .catch((err: unknown) => {
        setPending(false);
        setError(err instanceof Error ? err.message : "Could not save.");
      });
  }

  return (
    <Dialog open={open} onOpenChange={(_, d) => { setOpen(d.open); if (!d.open) setError(null); }}>
      <DialogTrigger disableButtonEnhancement>
        <Button appearance="subtle" size="small" icon={<EditRegular />}>Edit</Button>
      </DialogTrigger>
      <DialogSurface>
        <DialogBody>
          <DialogTitle>Edit your request</DialogTitle>
          <DialogContent>
            <form id={`edit-request-${request.id}`} onSubmit={handleSubmit}>
              <input type="hidden" name="id" value={request.id} />
              <div className={styles.form}>
                {error && (
                  <MessageBar intent="error"><MessageBarBody>{error}</MessageBarBody></MessageBar>
                )}
                <Field label="Name" required>
                  <Input name="requested_name" defaultValue={request.name} required />
                </Field>
                <Field label="Category" required>
                  <Select name="category" defaultValue={request.category} required>
                    <option value="" disabled>Select…</option>
                    {categories.map((c) => <option key={c} value={c}>{c}</option>)}
                  </Select>
                </Field>
                <Field label="Reason" required>
                  <Textarea name="reason" resize="vertical" defaultValue={request.reason} required />
                </Field>
              </div>
            </form>
          </DialogContent>
          <DialogActions>
            <Button appearance="secondary" type="button" onClick={() => setOpen(false)}>Cancel</Button>
            <Button appearance="primary" type="submit" form={`edit-request-${request.id}`} disabled={pending}>
              {pending ? "Saving…" : "Save changes"}
            </Button>
          </DialogActions>
        </DialogBody>
      </DialogSurface>
    </Dialog>
  );
}
