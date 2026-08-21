"use client";

import * as React from "react";
import * as Sentry from "@sentry/nextjs";

/**
 * Last-resort boundary for errors thrown in the root layout itself, where the
 * Fluent providers aren't mounted. It must render its own <html>/<body>, so it
 * uses plain inline styles rather than Fluent components.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  React.useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <html lang="en">
      <body
        style={{
          minHeight: "100vh",
          margin: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          gap: "12px",
          padding: "40px 24px",
          fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, sans-serif",
          color: "#242424",
          background: "#fff",
        }}
      >
        <h1 style={{ fontSize: "24px", margin: 0 }}>Something didn&apos;t load</h1>
        <p style={{ maxWidth: "48ch", color: "#616161", margin: 0 }}>
          Sorry, that didn&apos;t work. Try again, and if it keeps happening, refresh the page or come back shortly.
        </p>
        <button
          onClick={() => reset()}
          style={{
            marginTop: "4px",
            padding: "8px 16px",
            border: "none",
            borderRadius: "4px",
            background: "#c8102e",
            color: "#fff",
            fontSize: "14px",
            cursor: "pointer",
          }}
        >
          Try again
        </button>
      </body>
    </html>
  );
}
