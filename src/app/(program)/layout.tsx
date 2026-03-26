import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { AppSidebar } from "@/components/sidebar/app-sidebar";
import { ProgramSidebar } from "@/components/sidebar/program-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { auth } from "@/lib/auth";
import { PrincipalSidebar } from "@/components/sidebar/principal-sidebar";

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) {
    redirect("/sign-in");
  }

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": `calc(16rem*2)`,
        } as React.CSSProperties
      }
    >
      <AppSidebar className="border-r">
        <PrincipalSidebar className="border-r" />
        <ProgramSidebar />
      </AppSidebar>
      <SidebarInset>{children}</SidebarInset>
    </SidebarProvider>
  );
}
