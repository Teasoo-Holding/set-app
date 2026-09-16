"use client";

import * as React from "react";
import {
  Dialog, DialogTrigger, DialogSurface, DialogBody, DialogTitle, DialogContent, DialogActions,
  Button, Spinner, mergeClasses, makeStyles, tokens, type ButtonProps,
} from "@fluentui/react-components";

const useStyles = makeStyles({
  // Destructive actions (revoke, delete) read as red so they're not mistaken
  // for a neutral control.
  destructive: {
    color: tokens.colorPaletteRedForeground1,
    ":hover": { color: tokens.colorPaletteRedForeground1 },
    ":hover:active": { color: tokens.colorPaletteRedForeground1 },
  },
});

/**
 * A button that asks for confirmation before submitting a form. The trigger
 * carries the button's own appearance/label; on confirm it submits the form
 * with the given id (works across the dialog's portal via requestSubmit) and
 * then shows a pending spinner until the page revalidates. Use for destructive /
 * bulk / irreversible actions; pass `destructive` to colour the trigger red.
 */
export function ConfirmButton({
  formId,
  confirmTitle,
  confirmBody,
  confirmLabel = "Confirm",
  confirmAppearance = "primary",
  destructive = false,
  children,
  className,
  icon,
  disabled,
  ...triggerProps
}: ButtonProps & {
  formId: string;
  confirmTitle: string;
  confirmBody: React.ReactNode;
  confirmLabel?: string;
  confirmAppearance?: ButtonProps["appearance"];
  destructive?: boolean;
}) {
  const styles = useStyles();
  const [open, setOpen] = React.useState(false);
  const [submitting, setSubmitting] = React.useState(false);

  const confirm = () => {
    setOpen(false);
    const form = typeof document !== "undefined" ? (document.getElementById(formId) as HTMLFormElement | null) : null;
    if (form) {
      // Reflect progress on the trigger while the action runs; the surrounding
      // list/page re-renders on revalidation, which clears this naturally.
      setSubmitting(true);
      form.requestSubmit();
    }
  };

  return (
    <Dialog open={open} onOpenChange={(_, d) => setOpen(d.open)}>
      <DialogTrigger disableButtonEnhancement>
        <Button
          type="button"
          {...triggerProps}
          className={mergeClasses(destructive ? styles.destructive : undefined, className)}
          disabled={submitting || disabled}
          icon={submitting ? <Spinner size="tiny" /> : icon}
        >
          {children}
        </Button>
      </DialogTrigger>
      <DialogSurface>
        <DialogBody>
          <DialogTitle>{confirmTitle}</DialogTitle>
          <DialogContent>{confirmBody}</DialogContent>
          <DialogActions>
            <Button appearance="secondary" type="button" onClick={() => setOpen(false)}>Cancel</Button>
            <Button appearance={confirmAppearance} type="button" onClick={confirm}>{confirmLabel}</Button>
          </DialogActions>
        </DialogBody>
      </DialogSurface>
    </Dialog>
  );
}
