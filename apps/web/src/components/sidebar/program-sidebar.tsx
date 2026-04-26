"use client";

import {
  BookOpen01Icon,
  Calendar03Icon,
  CubeIcon,
  GraduationCap,
  Home01Icon,
  Briefcase03Icon,
  UserSquareIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type React from "react";
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
import { hasAnyRole } from "@/lib/auth/roles";
import { useSession } from "@/lib/api/hooks/useSession";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { useProgramsShowSuspense } from "@/lib/api/generated/program/program";

type ProgramSidebarProps = {
  programId: string;
} & React.ComponentProps<typeof Sidebar>;

const navItems = (programId: string, canViewMasterTimetable: boolean) => {
  const items = [
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
      id: "success-index",
      label: "Success Index",
      icon: GraduationCap,
      href: `/p/${programId}/success-index`,
      match: (pathname: string) =>
        pathname.startsWith(`/p/${programId}/success-index`),
    },
    {
      id: "students",
      label: "Students",
      icon: UserSquareIcon,
      href: `/p/${programId}/students`,
      match: (pathname: string) =>
        pathname.startsWith(`/p/${programId}/students`),
    },
    {
      id: "timetable",
      label: "Timetable",
      icon: Calendar03Icon,
      href: `/p/${programId}/timetable`,
      match: (pathname: string) =>
        pathname.startsWith(`/p/${programId}/timetable`),
    },
  ];

  if (canViewMasterTimetable) {
    items.push({
      id: "master-timetable",
      label: "Master Timetable",
      icon: Calendar03Icon,
      href: `/p/${programId}/master-timetable`,
      match: (pathname: string) =>
        pathname.startsWith(`/p/${programId}/master-timetable`),
    });
  }

  items.push({
    id: "skill-programs",
    label: "Skill Programs",
    icon: CubeIcon,
    href: `/p/${programId}/skill-programs`,
    match: (pathname: string) =>
      pathname.startsWith(`/p/${programId}/skill-programs`),
  });

  items.push({
    id: "program-outcome",
    label: "Program Outcome",
    icon: GraduationCap,
    href: `/p/${programId}/program-outcome`,
    match: (pathname: string) =>
      pathname.startsWith(`/p/${programId}/program-outcome`),
  });

  items.push({
    id: "placement-index",
    label: "Placement Index",
    icon: Briefcase03Icon,
    href: `/p/${programId}/placement-index`,
    match: (pathname: string) =>
      pathname.startsWith(`/p/${programId}/placement-index`),
  });

  items.push({
    id: "tests",
    label: "Tests",
    icon: BookOpen01Icon,
    href: `/p/${programId}/tests`,
    match: (pathname: string) => pathname.startsWith(`/p/${programId}/tests`),
  });

  return items;
};

export function ProgramSidebar({
  programId,
  className,
  ...props
}: ProgramSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const session = useSession();
  const semesterParam = searchParams.get("semester");
  const selectedSemester = Number.isFinite(Number(semesterParam))
    ? Math.min(6, Math.max(1, Number(semesterParam)))
    : 1;
  const canViewMasterTimetable = hasAnyRole(session?.current_institution_role, [
    "principal",
    "program_coordinator",
  ]);
  const items = navItems(programId, canViewMasterTimetable);
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
      className={cn("flex-1 flex", className)}
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
