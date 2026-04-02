"use client";

import {
  Calendar01Icon,
  CubeIcon,
  GridIcon,
  Home01Icon,
  PlusSignIcon,
  UserSquareIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import Link from "next/link";
import { useParams, usePathname } from "next/navigation";
import type React from "react";
import { cn } from "@/lib/utils";
import { getTemplatePagesByType } from "@/components/tempalate-pages";
import { Badge } from "../ui/badge";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupAction,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "../ui/sidebar";
import { AppSidebarFooter } from "./app-sidebar-footer";

const institutionFormats = getTemplatePagesByType("institution");

const items = [
  { id: 1, label: "Home", icon: Home01Icon, href: "/" },
  { id: 2, label: "Faculty", icon: UserSquareIcon, href: "/faculty" },
  { id: 3, label: "Calendar", icon: Calendar01Icon, href: "/calendar" },
];

const branches = [
  { id: 1, name: "Computer Science", icon: Home01Icon, href: "/" },
  {
    id: 2,
    name: "Electronics & Electricals",
    icon: UserSquareIcon,
    href: "/faculty",
  },
];

export function PrincipalSidebar({
  className,
  ...props
}: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname();
  const { programId } = useParams<{ programId: string }>();

  return (
    <Sidebar
      collapsible="none"
      className={cn("flex-1", className, programId && "border-r")}
      {...props}
    >
      <SidebarHeader className="flex-row items-center">
        <span className="text-lg text-primary px-1.5 font-bold font-brand">
          FORMEX
        </span>
        <Badge variant={"default"} className="font-mono text-xs">
          PRINCIPAL
        </Badge>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarMenu>
            {items.map((item) => (
              <SidebarMenuItem key={item.id}>
                <SidebarMenuButton asChild isActive={item.href === pathname}>
                  <Link href={item.href}>
                    <HugeiconsIcon icon={item.icon} /> {item.label}
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>
            PROGRAMS
            <SidebarGroupAction>
              <HugeiconsIcon icon={PlusSignIcon} />{" "}
              <span className="sr-only">Add Program</span>
            </SidebarGroupAction>
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {branches.map((item) => (
                <SidebarMenuItem key={item.id}>
                  <SidebarMenuButton
                    asChild
                    className="flex w-full items-center"
                    isActive={pathname.startsWith(`/p/${item.id}`)}
                  >
                    <Link href={`/p/${item.id}`}>
                      <HugeiconsIcon icon={CubeIcon} />{" "}
                      <span className="flex-1 truncate">{item.name}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>INSTITUTION FORMATS</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {institutionFormats.map((item) => (
                <SidebarMenuItem key={item.id}>
                  <SidebarMenuButton asChild>
                    <Link href={`#`}>
                      <HugeiconsIcon icon={GridIcon} /> {item.name}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <AppSidebarFooter />
    </Sidebar>
  );
}
