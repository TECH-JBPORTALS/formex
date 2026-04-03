"use client";

import {
  Calendar01Icon,
  GridIcon,
  Home01Icon,
  UserSquareIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import Link from "next/link";
import { useParams, usePathname } from "next/navigation";
import type React from "react";
import { Suspense } from "react";
import { getTemplatePagesByType } from "@/components/tempalate-pages";
import { cn } from "@/lib/utils";
import { Badge } from "../ui/badge";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSkeleton,
} from "../ui/sidebar";
import { AppSidebarFooter } from "./app-sidebar-footer";
import { PrincipalProgramsSection } from "./principal-programs-section";

const institutionFormats = getTemplatePagesByType("institution");

const items = [
  { id: 1, label: "Home", icon: Home01Icon, href: "/" },
  { id: 2, label: "Faculty", icon: UserSquareIcon, href: "/faculty" },
  { id: 3, label: "Calendar", icon: Calendar01Icon, href: "/calendar" },
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
      className={cn("shrink-0", className, programId && "border-r")}
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

        <PrincipalProgramsSection />

        <SidebarGroup>
          <SidebarGroupLabel>INSTITUTION FORMATS</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {institutionFormats.map((item) => (
                <SidebarMenuItem key={item.id}>
                  <SidebarMenuButton
                    isActive={pathname === `/formats/${item.slug}`}
                    asChild
                  >
                    <Link href={`/formats/${item.slug}`}>
                      <HugeiconsIcon icon={GridIcon} /> <span>{item.name}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <Suspense fallback={<div className="h-16 px-2 py-2" />}>
        <AppSidebarFooter />
      </Suspense>
    </Sidebar>
  );
}
