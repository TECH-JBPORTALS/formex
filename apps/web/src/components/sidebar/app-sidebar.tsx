import type { ReactNode } from "react";
import { Sidebar } from "../ui/sidebar";

export function AppSidebar({ children }: { children: ReactNode }) {
  return (
    <Sidebar collapsible="none" className="flex flex-row w-fit h-svh shrink-0">
      {children}
    </Sidebar>
  );
}
