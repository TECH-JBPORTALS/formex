"use client";

import type React from "react";
import { Sidebar } from "../ui/sidebar";

export function AppSidebar({
  children,
  className,
  ...props
}: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar
      collapsible="icon"
      className="overflow-hidden *:data-[sidebar=sidebar]:flex-row duration-100"
      {...props}
    >
      {children}
    </Sidebar>
  );
}
