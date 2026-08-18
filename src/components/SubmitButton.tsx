"use client";

import * as React from "react";
import { useFormStatus } from "react-dom";
import { Button, Spinner, type ButtonProps } from "@fluentui/react-components";

/**
 * A submit button that reflects the parent form's pending state: it disables
 * itself and shows a spinner while the server action runs. Must be rendered
 * inside a `<form action={…}>`. Drop-in replacement for `<Button type="submit">`.
 */
export function SubmitButton({ children, icon, disabled, ...props }: ButtonProps) {
  const { pending } = useFormStatus();
  return (
    <Button
      type="submit"
      {...props}
      disabled={pending || disabled}
      icon={pending ? <Spinner size="tiny" /> : icon}
    >
      {children}
    </Button>
  );
}
