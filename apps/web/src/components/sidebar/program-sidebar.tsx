"use client";

import {
  BookOpen01Icon,
  Home01Icon,
  UserSquareIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type React from "react";
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
import { cn } from "@/lib/utils";
import {
  useProgramsShow,
  useProgramsShowSuspense,
} from "@/lib/api/generated/context-program/context-program";

type ProgramSidebarProps = {
  programId: string;
} & React.ComponentProps<typeof Sidebar>;

const navItems = (programId: string) =>
  [
    {
      id: "overview",
      label: "Overview",
      icon: Home01Icon,
      href: `/p/${programId}`,
      match: (pathname: string) =>
        pathname === `/p/${programId}` || pathname === `/p/${programId}/`,
    },
    {
      id: "subjects",
      label: "Subjects",
      icon: BookOpen01Icon,
      href: `/p/${programId}/subjects`,
      match: (pathname: string) =>
        pathname.startsWith(`/p/${programId}/subjects`) ||
        pathname.startsWith(`/p/${programId}/s/`),
    },
    {
      id: "students",
      label: "Students",
      icon: UserSquareIcon,
      href: `/p/${programId}/students`,
      match: (pathname: string) =>
        pathname.startsWith(`/p/${programId}/students`),
    },
  ] as const;

export function ProgramSidebar({
  programId,
  className,
  ...props
}: ProgramSidebarProps) {
  const pathname = usePathname();
  const items = navItems(programId);
  const { data: programShow } = useProgramsShowSuspense(programId);
  const program = programShow?.status == 200 ? programShow.data.data : null;

  return (
    <Sidebar
      collapsible="none"
      className={cn("shrink-0 border-r bg-sidebar", className)}
      {...props}
    >
      <SidebarHeader className="gap-1 border-b px-2 py-3">
        <span className="truncate  px-1.5 text-sm font-semibold font-heading leading-tight">
          {program?.name}
        </span>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="sr-only">Program</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.id}>
                  <SidebarMenuButton
                    asChild
                    isActive={item.match(pathname)}
                    className="w-full"
                  >
                    <Link href={item.href}>
                      <HugeiconsIcon icon={item.icon} />
                      {item.label}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
