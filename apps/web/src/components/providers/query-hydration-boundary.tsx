"use client";

import { deserializeQueryData } from "@/lib/query-hydration";
import {
  HydrationBoundary,
  type DehydratedState,
} from "@tanstack/react-query";
import type { ReactNode } from "react";

const hydrateOptions = {
  defaultOptions: {
    deserializeData: deserializeQueryData,
  },
} as const;

/** Server may pass only serializable `state`; hydrate options (functions) live on the client. */
export function QueryHydrationBoundary({
  state,
  children,
}: {
  state: DehydratedState;
  children: ReactNode;
}) {
  return (
    <HydrationBoundary state={state} options={hydrateOptions}>
      {children}
    </HydrationBoundary>
  );
}
