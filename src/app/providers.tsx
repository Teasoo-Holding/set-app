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
 */
export function Providers({ children }: { children: React.ReactNode }) {
  const [renderer] = React.useState(() => createDOMRenderer());
  const didRenderRef = React.useRef(false);

  useServerInsertedHTML(() => {
    if (didRenderRef.current) {
      return null;
    }
    didRenderRef.current = true;
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
