"use client";

import type { ReactNode } from "react";
import { SidebarProvider } from "../ui/sidebar";

export function AppSidebarProvider({ children }: { children: ReactNode }) {
  return (
    <SidebarProvider className="flex min-h-svh w-full">
      {children}
    </SidebarProvider>
  );
}
