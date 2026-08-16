"use client";

import * as React from "react";
import { Input, Button, type InputProps } from "@fluentui/react-components";
import { EyeRegular, EyeOffRegular } from "@fluentui/react-icons";

/**
 * Password field with a show/hide toggle. Drop-in replacement for <Input> in a
 * form — forwards name/required/autoComplete/minLength etc.
 */
export function PasswordInput(props: Omit<InputProps, "type" | "contentAfter">) {
  const [show, setShow] = React.useState(false);
  return (
    <Input
      {...props}
      type={show ? "text" : "password"}
      contentAfter={
        <Button
          type="button"
          appearance="transparent"
          size="small"
          icon={show ? <EyeOffRegular /> : <EyeRegular />}
          aria-label={show ? "Hide password" : "Show password"}
          onClick={() => setShow((s) => !s)}
        />
      }
    />
  );
}
