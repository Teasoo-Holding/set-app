"use client";

import { Spinner } from "@fluentui/react-components";

export default function Loading() {
  return (
    <div style={{ minHeight: "60vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <Spinner size="large" label="Loading…" />
    </div>
  );
}
