"use client";

import * as React from "react";
import {
  Dialog, DialogTrigger, DialogSurface, DialogBody, DialogTitle, DialogContent, DialogActions,
  Button, type ButtonProps,
} from "@fluentui/react-components";

/**
 * A button that asks for confirmation before submitting a form. The trigger
 * carries the button's own appearance/label; on confirm it submits the form
 * with the given id (works across the dialog's portal via requestSubmit).
 * Use for destructive / bulk / irreversible actions.
 */
export function ConfirmButton({
  formId,
  confirmTitle,
  confirmBody,
  confirmLabel = "Confirm",
  confirmAppearance = "primary",
  children,
  ...triggerProps
}: ButtonProps & {
  formId: string;
  confirmTitle: string;
  confirmBody: React.ReactNode;
  confirmLabel?: string;
  confirmAppearance?: ButtonProps["appearance"];
}) {
  const [open, setOpen] = React.useState(false);

  const confirm = () => {
    setOpen(false);
    const form = typeof document !== "undefined" ? (document.getElementById(formId) as HTMLFormElement | null) : null;
    form?.requestSubmit();
  };

  return (
    <Dialog open={open} onOpenChange={(_, d) => setOpen(d.open)}>
      <DialogTrigger disableButtonEnhancement>
        <Button type="button" {...triggerProps}>{children}</Button>
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
