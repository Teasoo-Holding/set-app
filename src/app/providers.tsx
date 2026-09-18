"use client";

import * as React from "react";
import { useServerInsertedHTML } from "next/navigation";
import {
  createDOMRenderer,
  RendererProvider,
  SSRProvider,
  FluentProvider,
  renderToStyleElements,
} from "@fluentui/react-components";
import { sisLightTheme } from "@/lib/theme";
import { PostHogProvider } from "@/components/PostHogProvider";

/**
 * SSR-safe Fluent UI v9 provider for the Next.js App Router.
 * Flushes Griffel's collected styles into the streamed HTML so there is
 * no flash of unstyled content on first paint.
 *
 * We flush on EVERY server insertion, not just the first. With a Suspense
 * boundary in the tree (our root loading.tsx), the shell streams first and each
 * async page's content streams in a later chunk; a one-shot flush would emit the
 * shell's styles but drop the page's, leaving data pages (e.g. /platform)
 * unstyled until hydration. Re-emitting is safe — identical rules are deduped by
 * the browser and by Griffel's rehydration.
 */
export function Providers({ children }: { children: React.ReactNode }) {
  const [renderer] = React.useState(() => createDOMRenderer());

  useServerInsertedHTML(() => {
    return <>{renderToStyleElements(renderer)}</>;
  });

  return (
    <RendererProvider renderer={renderer}>
      <SSRProvider>
        <FluentProvider theme={sisLightTheme}>
          <PostHogProvider>{children}</PostHogProvider>
        </FluentProvider>
      </SSRProvider>
    </RendererProvider>
  );
}
