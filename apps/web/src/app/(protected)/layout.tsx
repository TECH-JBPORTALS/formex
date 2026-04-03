import { redirect } from "next/navigation";
import type React from "react";
import { AppSidebar } from "@/components/sidebar/app-sidebar";
import { AppSidebarProvider } from "@/components/sidebar/app-sidebar-provider";
import { AppSidebarRail } from "@/components/sidebar/app-sidebar-rail";
import { getServerSession } from "../../auth/session";
import { SidebarInset } from "../../components/ui/sidebar";
import { prefetch } from "@/lib/prefetch";
import { getAuthUserQueryOptions } from "@/lib/api/generated/auth/auth";
import { QueryHydrationBoundary } from "@/components/providers/query-hydration-boundary";
import { headers } from "next/headers";

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession();

  if (!session) {
    redirect("/sign-in");
  }

  if (session.user.institutions.length === 0) {
    redirect("/institutions/new");
  }

  const dehydratedState = await prefetch(
    getAuthUserQueryOptions({ request: { headers: await headers() } }),
  );

  return (
    <QueryHydrationBoundary state={dehydratedState}>
      <AppSidebarProvider>
        <AppSidebar>
          <AppSidebarRail />
        </AppSidebar>
        <SidebarInset>{children}</SidebarInset>
      </AppSidebarProvider>
    </QueryHydrationBoundary>
  );
}
