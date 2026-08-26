"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  Dialog, DialogTrigger, DialogSurface, DialogBody, DialogTitle, DialogContent, DialogActions,
  Button, Caption1, Field, Select, Input, MessageBar, MessageBarBody, makeStyles, tokens,
} from "@fluentui/react-components";
import { AddRegular } from "@fluentui/react-icons";
import { createStakeholder } from "@/app/actions/stakeholder";

const useStyles = makeStyles({
  form: { display: "flex", flexDirection: "column", rowGap: "14px", paddingTop: "4px" },
  row: { display: "flex", columnGap: "12px", flexWrap: "wrap" },
  half: { flexGrow: 1, minWidth: "160px" },
  tierHelp: {
    color: tokens.colorNeutralForeground2,
    backgroundColor: tokens.colorNeutralBackground2,
    border: `1px solid ${tokens.colorNeutralStroke2}`,
    borderRadius: tokens.borderRadiusMedium,
    padding: "8px 10px",
    lineHeight: tokens.lineHeightBase300,
  },
  tierName: { color: tokens.colorNeutralForeground1, fontWeight: tokens.fontWeightSemibold },
});

export type MemberOption = { id: string; name: string };

export function AddStakeholderDialog({
  categories,
  functions,
  members,
  currentUserId,
}: {
  categories: string[];
  functions: string[];
  members: MemberOption[];
  currentUserId: string;
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
    createStakeholder(fd)
      .then(() => {
        setPending(false);
        setOpen(false);
        router.refresh();
      })
      .catch((err: unknown) => {
        setPending(false);
        setError(err instanceof Error ? err.message : "Could not add the stakeholder.");
      });
  }

  return (
    <Dialog open={open} onOpenChange={(_, d) => { setOpen(d.open); if (!d.open) setError(null); }}>
      <DialogTrigger disableButtonEnhancement>
        <Button appearance="primary" icon={<AddRegular />}>Add stakeholder</Button>
      </DialogTrigger>
      <DialogSurface>
        <DialogBody>
          <DialogTitle>Add a stakeholder</DialogTitle>
          <DialogContent>
            <form id="add-stakeholder-form" onSubmit={handleSubmit}>
              <div className={styles.form}>
                {error && (
                  <MessageBar intent="error">
                    <MessageBarBody>{error}</MessageBarBody>
                  </MessageBar>
                )}
                <Field label="Name" required>
                  <Input name="name" placeholder="e.g. National Telecoms Commission" required />
                </Field>
                <div className={styles.row}>
                  <Field label="Category" required className={styles.half}>
                    <Select name="category" defaultValue="" required>
                      <option value="" disabled>Select…</option>
                      {categories.map((c) => <option key={c} value={c}>{c}</option>)}
                    </Select>
                  </Field>
                  <Field label="Function" required className={styles.half}>
                    <Select name="function" defaultValue={functions.length === 1 ? functions[0] : ""} required>
                      <option value="" disabled>Select…</option>
                      {functions.map((f) => <option key={f} value={f}>{f}</option>)}
                    </Select>
                  </Field>
                </div>
                <div className={styles.row}>
                  <Field label="Tier" required className={styles.half}>
                    <Select name="tier" defaultValue="2" required>
                      <option value="1">Tier 1 (strategic)</option>
                      <option value="2">Tier 2 (standard)</option>
                    </Select>
                  </Field>
                  <Field label="Owner" className={styles.half}>
                    <Select name="owner_id" defaultValue={currentUserId}>
                      {members.map((m) => (
                        <option key={m.id} value={m.id}>{m.id === currentUserId ? `${m.name} (you)` : m.name}</option>
                      ))}
                    </Select>
                  </Field>
                </div>
                <Caption1 className={styles.tierHelp}>
                  <span className={styles.tierName}>Tier 1 (strategic):</span> highest-priority relationships you actively manage.{" "}
                  <span className={styles.tierName}>Tier 2 (standard):</span> everyone else you track.
                </Caption1>
              </div>
            </form>
          </DialogContent>
          <DialogActions>
            <Button appearance="secondary" type="button" onClick={() => setOpen(false)}>Cancel</Button>
            <Button appearance="primary" type="submit" form="add-stakeholder-form" disabled={pending}>
              {pending ? "Adding…" : "Add stakeholder"}
            </Button>
          </DialogActions>
        </DialogBody>
      </DialogSurface>
    </Dialog>
  );
}
