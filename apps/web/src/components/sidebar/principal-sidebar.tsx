"use client";

import {
  GridIcon,
  Home01Icon,
  LaborIcon,
  PermanentJobIcon,
  UserSquareIcon,
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
import { AppSidebarFooter } from "./app-sidebar-footer";
import { PrincipalProgramsSection } from "./principal-programs-section";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

const institutionFormats = getTemplatePagesByType("institution");

const items = [
  { id: 1, label: "Home", icon: Home01Icon, href: "/" },
  { id: 2, label: "Faculty", icon: UserSquareIcon, href: "/faculty" },
  { id: 3, label: "Internships", icon: LaborIcon, href: "/internships" },
  { id: 4, label: "Placements", icon: PermanentJobIcon, href: "/placements" },
];

export function PrincipalSidebar({
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
      <SidebarHeader className="flex-row h-12  border-b items-center">
        <span className="text-2xl text-primary px-1.5 font-medium font-brand">
          FORMEX
        </span>
        <Badge
          variant={"default"}
          className="bg-primary/20 text-primary font-bold text-[10px]"
        >
          PRINCIPAL
        </Badge>
      </SidebarHeader>

      <SidebarHeader className="border-b">
        <Select defaultValue={new Date().getFullYear().toString()}>
          <SelectTrigger size="sm" className="w-full">
            <SelectValue placeholder="Academic Year" />
          </SelectTrigger>
          <SelectContent>
            {["2026", "2025"].map((acadyear) => {
              return (
                <SelectItem key={acadyear} value={String(acadyear)}>
                  Academic Year - {acadyear}
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>INSTITUTION</SidebarGroupLabel>
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
