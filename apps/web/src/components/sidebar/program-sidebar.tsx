"use client";

import {
  BookOpen01Icon,
  Home01Icon,
  UserSquareIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
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
  SidebarSeparator,
} from "../ui/sidebar";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
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
  const router = useRouter();
  const searchParams = useSearchParams();
  const semesterParam = searchParams.get("semester");
  const selectedSemester = Number.isFinite(Number(semesterParam))
    ? Math.min(6, Math.max(1, Number(semesterParam)))
    : 1;
  const items = navItems(programId);
  const { data: programShow } = useProgramsShowSuspense(programId);
  const program = programShow?.status == 200 ? programShow.data.data : null;

  const onSemesterChange = (value: string) => {
    const nextSemester = Math.min(6, Math.max(1, Number(value)));
    const params = new URLSearchParams(searchParams.toString());
    params.set("semester", String(nextSemester));
    router.replace(`${pathname}?${params.toString()}`);
  };

  return (
    <Sidebar
      collapsible="none"
      className={cn("shrink-0 border-r bg-sidebar", className)}
      {...props}
    >
      <SidebarHeader className="gap-2 border-b px-2 h-12 justify-center">
        <span className="truncate px-1.5 font-semibold font-heading leading-tight">
          {program?.name}
        </span>
      </SidebarHeader>

      <SidebarHeader className="border-b">
        <Select
          value={String(selectedSemester)}
          onValueChange={onSemesterChange}
        >
          <SelectTrigger size="sm" className="w-full">
            <SelectValue placeholder="Semester" />
          </SelectTrigger>
          <SelectContent>
            {Array.from({ length: 6 }).map((_, i) => {
              const s = i + 1;
              return (
                <SelectItem key={s} value={String(s)}>
                  Semester {s}
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>PROGRAM</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.id}>
                  <SidebarMenuButton
                    asChild
                    isActive={item.match(pathname)}
                    className="w-full"
                  >
                    <Link
                      href={{
                        pathname: item.href,
                        query: { semester: String(selectedSemester) },
                      }}
                    >
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
