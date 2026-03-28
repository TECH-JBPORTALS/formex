"use client";

import {
  Books01Icon,
  Calendar01Icon,
  GridIcon,
  Home01Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Badge } from "../ui/badge";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "../ui/sidebar";
import { AppSidebarFooter } from "./app-sidebar-footer";

const items = {
  app: [
    { id: 1, label: "Home", icon: Home01Icon, href: "/" },
    { id: 2, label: "Calendar", icon: Calendar01Icon, href: "/calendar" },
    { id: 3, label: "Subjects", icon: Books01Icon, href: "/subjects" },
  ],
  semesterFormats: [
    { id: 1, label: "INS Format 02", icon: GridIcon, href: "#" },
    { id: 2, label: "INS Format 04", icon: GridIcon, href: "#" },
  ],
  programFormats: [
    { id: 1, label: "INS Format 04", icon: GridIcon, href: "#" },
    { id: 2, label: "INS Format 05", icon: GridIcon, href: "#" },
  ],
};

export function StaffSidebar() {
  const pathname = usePathname();

  return (
    <Sidebar collapsible="none" className="flex-1 w-full">
      <SidebarHeader className="flex-row items-center">
        <span className="text-lg text-primary px-1.5 font-bold font-brand">
          FORMEX
        </span>
        <Badge variant={"outline"} className="font-mono text-xs">
          STAFF
        </Badge>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarMenu>
            {items.app.map((item) => (
              <SidebarMenuItem key={item.id}>
                <Link href={item.href}>
                  <SidebarMenuButton isActive={pathname === item.href}>
                    <HugeiconsIcon icon={item.icon} /> {item.label}
                  </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>SEMESTER FORMATS</SidebarGroupLabel>
          <SidebarMenu>
            {items.semesterFormats.map((item) => (
              <SidebarMenuItem key={item.id}>
                <SidebarMenuButton>
                  <HugeiconsIcon icon={GridIcon} /> {item.label}
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>PROGRAM FORMATS</SidebarGroupLabel>
          <SidebarMenu>
            {items.programFormats.map((item) => (
              <SidebarMenuItem key={item.id}>
                <SidebarMenuButton>
                  <HugeiconsIcon icon={GridIcon} /> {item.label}
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      <AppSidebarFooter />
    </Sidebar>
  );
}
