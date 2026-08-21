import type { ErrorEvent, EventHint } from "@sentry/nextjs";

/** Remove the query string and hash from a URL (they can carry invite / reset tokens). */
function stripUrl(url: unknown): string | undefined {
  if (typeof url !== "string") return undefined;
  return url.split("?")[0].split("#")[0];
}

/**
 * beforeSend hook shared by the browser, server and edge runtimes.
 *
 * This app renders stakeholder data, so we are deliberately strict about what
 * leaves the process: no request cookies, headers or body (they can carry
 * session tokens and personal data), and no query strings anywhere (invite and
 * password-reset links put a token in the query). Combined with
 * `sendDefaultPii: false`, Sentry receives the error and stack trace but not
 * the surrounding personal context.
 */
export function scrubEvent(event: ErrorEvent, _hint: EventHint): ErrorEvent {
  if (event.request) {
    delete event.request.cookies;
    delete event.request.headers;
    delete event.request.data;
    delete event.request.query_string;
    const stripped = stripUrl(event.request.url);
    if (stripped !== undefined) event.request.url = stripped;
  }

  if (event.breadcrumbs) {
    for (const crumb of event.breadcrumbs) {
      if (!crumb.data) continue;
      for (const key of ["url", "to", "from"]) {
        const stripped = stripUrl(crumb.data[key]);
        if (stripped !== undefined) crumb.data[key] = stripped;
      }
    }
  }

  return event;
}
