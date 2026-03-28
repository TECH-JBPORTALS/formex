"use client";

import {
  Book01Icon,
  Books01Icon,
  Calendar01Icon,
  GridIcon,
  Home01Icon,
  Mortarboard01Icon,
  PlusSignIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Badge } from "../ui/badge";
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
import { AppSidebarFooter } from "./app-sidebar-footer";

const items = {
  program: [
    { id: 1, label: "Home", icon: Home01Icon, href: "/" },
    { id: 2, label: "Calendar", icon: Calendar01Icon, href: "/calendar" },
  ],
  semester: [
    { id: 1, label: "Students", icon: Mortarboard01Icon, href: "/students" },
    { id: 2, label: "Subjects", icon: Books01Icon, href: "/subjects" },
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

export function ProgramCoordinatorSidebar() {
  const pathname = usePathname();
  const activeSemesterId = 1;

  return (
    <Sidebar collapsible="none" className="peer flex-1 flex">
      <SidebarHeader className="border-b">
        <div className="flex-row flex items-center">
          <span className="text-lg text-primary px-1.5 font-bold font-brand">
            FORMEX
          </span>
          <Badge variant={"secondary"} className="font-mono text-xs">
            HOD
          </Badge>
        </div>
        <SidebarGroup className="px-0">
          <SidebarGroupLabel>COMPUTER SCIENCE</SidebarGroupLabel>
          <SidebarMenu className="grid grid-cols-4 px-2 gap-0.5">
            {semesters.map((item) => (
              <SidebarMenuItem key={item.id}>
                <SidebarMenuButton
                  isActive={activeSemesterId === item.id}
                  className="text-xs"
                  size={"sm"}
                  asChild
                >
                  <Button
                    size={"xs"}
                    variant={activeSemesterId === item.id ? "outline" : "ghost"}
                    className="font-mono text-xs bg-transparent"
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
          <SidebarMenu>
            {items.program.map((item) => (
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
          <SidebarGroupLabel>SEMESTER</SidebarGroupLabel>
          <SidebarMenu>
            {items.semester.map((item) => (
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
