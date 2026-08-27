"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  Dialog, DialogTrigger, DialogSurface, DialogBody, DialogTitle, DialogContent, DialogActions,
  Button, Textarea, MessageBar, MessageBarBody, Caption1, makeStyles, tokens,
} from "@fluentui/react-components";
import { ArrowUploadRegular, ArrowDownloadRegular } from "@fluentui/react-icons";
import { importStakeholders, type ImportResult } from "@/app/actions/stakeholder";

const TEMPLATE_HEADER = "name,category,function,tier,owner,risk,sentiment,notes";

const useStyles = makeStyles({
  form: { display: "flex", flexDirection: "column", rowGap: "12px", paddingTop: "4px" },
  muted: { color: tokens.colorNeutralForeground3 },
  mono: { fontFamily: tokens.fontFamilyMonospace },
  errors: { display: "flex", flexDirection: "column", rowGap: "2px", maxHeight: "160px", overflowY: "auto", marginTop: "6px" },
});

export function ImportStakeholdersDialog({ categories, functions }: { categories: string[]; functions: string[] }) {
  const styles = useStyles();
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [pending, setPending] = React.useState(false);
  const [result, setResult] = React.useState<ImportResult | null>(null);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    setPending(true);
    setResult(null);
    importStakeholders(fd)
      .then((r) => {
        setPending(false);
        setResult(r);
        if (r.imported > 0) router.refresh();
      })
      .catch(() => {
        setPending(false);
        setResult({ imported: 0, total: 0, errors: [{ row: 0, message: "Import failed. Please try again." }] });
      });
  }

  function downloadTemplate() {
    const example = `Example Stakeholder,${categories[0] ?? "Regulator"},${functions[0] ?? "Corporate Affairs"},1,,low,neutral,Primary contact`;
    const blob = new Blob([`${TEMPLATE_HEADER}\n${example}\n`], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "stakeholder-import-template.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <Dialog open={open} onOpenChange={(_, d) => { setOpen(d.open); if (!d.open) { setResult(null); setPending(false); } }}>
      <DialogTrigger disableButtonEnhancement>
        <Button appearance="secondary" icon={<ArrowUploadRegular />}>Import CSV</Button>
      </DialogTrigger>
      <DialogSurface>
        <DialogBody>
          <DialogTitle>Import stakeholders from CSV</DialogTitle>
          <DialogContent>
            <form id="import-form" onSubmit={handleSubmit}>
              <div className={styles.form}>
                <Caption1 className={styles.muted}>
                  Columns: <span className={styles.mono}>name, category, function, tier, owner, risk, sentiment, notes</span>. Name,
                  category, function and tier (1 or 2) are required; the rest are optional. Category and function must already exist
                  in your organisation, and owner (if given) must match a teammate&apos;s name or email.
                </Caption1>
                <div>
                  <Button type="button" appearance="subtle" size="small" icon={<ArrowDownloadRegular />} onClick={downloadTemplate}>
                    Download template
                  </Button>
                </div>
                <Textarea name="csv" resize="vertical" textarea={{ rows: 8 }} placeholder={`${TEMPLATE_HEADER}\n…`} />
                {result && (
                  <MessageBar intent={result.imported > 0 ? (result.errors.length ? "warning" : "success") : "error"}>
                    <MessageBarBody>
                      {result.imported > 0 ? `Imported ${result.imported} of ${result.total}.` : "Nothing was imported."}
                      {result.errors.length > 0 && (
                        <div className={styles.errors}>
                          {result.errors.map((e, i) => (
                            <Caption1 key={i}>{e.row > 0 ? `Row ${e.row}: ${e.message}` : e.message}</Caption1>
                          ))}
                        </div>
                      )}
                    </MessageBarBody>
                  </MessageBar>
                )}
              </div>
            </form>
          </DialogContent>
          <DialogActions>
            <Button appearance="secondary" type="button" onClick={() => setOpen(false)}>
              {result && result.imported > 0 ? "Done" : "Cancel"}
            </Button>
            <Button appearance="primary" type="submit" form="import-form" disabled={pending}>
              {pending ? "Importing…" : "Import"}
            </Button>
          </DialogActions>
        </DialogBody>
      </DialogSurface>
    </Dialog>
  );
}
