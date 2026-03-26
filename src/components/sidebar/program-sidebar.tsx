"use client";

import {
  Book02Icon,
  DashboardCircleIcon,
  GridIcon,
  Mortarboard01Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import Link from "next/link";
import { useParams, usePathname } from "next/navigation";
import { getTemplatePagesByType } from "../tempalate-pages";
import { Button } from "../ui/button";
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

const items = [
  { id: 1, label: "Dashboard", icon: DashboardCircleIcon, href: "" },
  { id: 2, label: "Students", icon: Mortarboard01Icon, href: "/students" },
  { id: 3, label: "Subjects", icon: Book02Icon, href: "/subjects" },
];

const semesters = [
  {
    id: 1,
    label: "SEM-1",
  },
  {
    id: 2,
    label: "SEM-2",
  },
  {
    id: 3,
    label: "SEM-3",
  },
  {
    id: 4,
    label: "SEM-4",
  },
];

const branchFormats = getTemplatePagesByType("branch");

export function ProgramSidebar() {
  const { programId } = useParams<{ programId: string }>();
  const pathname = usePathname();
  const activeSemesterId = 1;

  return (
    <Sidebar collapsible="none" className="peer flex-1 flex">
      <SidebarHeader className="border-b">
        <span className="text-lg px-1.5 font-semibold font-heading">
          Computer Science & Engg.
        </span>

        <SidebarGroup>
          <SidebarMenu className="grid gap-1.5 grid-cols-4">
            {semesters.map((item) => (
              <SidebarMenuItem key={item.id}>
                <SidebarMenuButton
                  isActive={activeSemesterId === item.id}
                  size={"sm"}
                  asChild
                >
                  <Button
                    variant={activeSemesterId === item.id ? "outline" : "ghost"}
                    className="font-mono bg-transparent"
                  >
                    {item.label}
                  </Button>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>SEMESTER</SidebarGroupLabel>
          <SidebarMenu>
            {items.map((item) => (
              <SidebarMenuItem key={item.id}>
                <Link href={`/p/${programId}${item.href}`}>
                  <SidebarMenuButton
                    isActive={pathname === `/p/${programId}${item.href}`}
                  >
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
            {branchFormats.map((item) => (
              <SidebarMenuItem key={item.id}>
                <SidebarMenuButton isActive={pathname === `/f/${item.slug}`}>
                  <HugeiconsIcon icon={GridIcon} /> {item.name}
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>PROGRAM FORMATS</SidebarGroupLabel>
          <SidebarMenu>
            {branchFormats.map((item) => (
              <SidebarMenuItem key={item.id}>
                <SidebarMenuButton isActive={pathname === `/f/${item.slug}`}>
                  <HugeiconsIcon icon={GridIcon} /> {item.name}
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
