import { AppSidebar } from "@/components/sidebar/app";
import { SidebarProvider } from "@/components/ui/sidebar";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <main className="min-h-svh flex flex-col w-full">{children}</main>
    </SidebarProvider>
  );
}
