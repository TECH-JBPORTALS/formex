"use client";

import {
  Calendar03Icon,
  GridIcon,
  Home01Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
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
} from "../ui/sidebar";
import { AcademicYearSelect } from "./academic-year-select";
import { AppSidebarFooter } from "./app-sidebar-footer";
import { PrincipalProgramsSection } from "./principal-programs-section";

const institutionFormats = getTemplatePagesByType("institution");

export function StaffSidebar({
  className,
  ...props
}: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname();

  return (
    <Sidebar
      collapsible="none"
      className={cn("w-[16rem]! border-r", className)}
      {...props}
    >
      <SidebarHeader className="flex-row h-12 border-b items-center">
        <span className="text-2xl text-primary px-1.5 font-medium font-brand">
          FORMEX
        </span>
        <Badge
          variant={"default"}
          className="bg-primary/20 text-primary font-bold text-[10px]"
        >
          STAFF
        </Badge>
      </SidebarHeader>

      <SidebarHeader className="border-b">
        <AcademicYearSelect />
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>INSTITUTION</SidebarGroupLabel>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild isActive={pathname === "/"}>
                <Link href="/">
                  <HugeiconsIcon icon={Home01Icon} /> Home
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton asChild isActive={pathname === "/timetable"}>
                <Link href="/timetable">
                  <HugeiconsIcon icon={Calendar03Icon} /> Personal Timetable
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
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
