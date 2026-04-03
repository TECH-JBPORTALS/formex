import "server-only";

import {
  dehydrate,
  QueryClient,
  type DehydratedState,
} from "@tanstack/react-query";
import { createQueryClient } from "./query-client";
import { dehydrateSerializeOptions } from "./query-hydration";
import { cache } from "react";

type PrefetchArg = Parameters<QueryClient["prefetchQuery"]>[0];

const queryClient = cache(() => createQueryClient())();

/**
 * Accepts Orval `getXxxQueryOptions()` (branded `UseQueryOptions`) or any options
 * {@link QueryClient.prefetchQuery} supports. Those types are not assignable to
 * `PrefetchArg` in TypeScript (covariance on `queryFn` / `staleTime` / etc.).
 */
export async function prefetch(
  ...queries: unknown[]
): Promise<DehydratedState> {


  await Promise.all(
    queries.map((q) => queryClient.prefetchQuery(q as PrefetchArg)),
  );

  return dehydrate(queryClient, dehydrateSerializeOptions);
}