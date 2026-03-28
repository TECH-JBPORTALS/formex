"use client";

import { useParams } from "next/navigation";
import type React from "react";
import { SidebarProvider } from "../ui/sidebar";

export function AppSidebarProvider({
  ...props
}: React.ComponentProps<typeof SidebarProvider>) {
  const { programId } = useParams<{ programId: string }>();

  return (
    <SidebarProvider
      style={
        programId
          ? ({
              "--sidebar-width": "calc(16rem*2)",
            } as React.CSSProperties)
          : undefined
      }
      {...props}
    />
  );
}
