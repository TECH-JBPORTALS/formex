import { getProgramsShowQueryOptions } from "@/lib/api/generated/context-program/context-program";
import { prefetch } from "@/lib/prefetch";
import { HydrationBoundary } from "@tanstack/react-query";
import { headers } from "next/headers";

export default async function Layout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ programId: string }>;
}) {
  const { programId } = await params;

  const dehydratedState = await prefetch(
    getProgramsShowQueryOptions(programId, {
      request: { headers: await headers() },
    }),
  );

  return (
    <HydrationBoundary state={dehydratedState}>{children}</HydrationBoundary>
  );
}
