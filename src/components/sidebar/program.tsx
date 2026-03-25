"use client";

import {
  Book02Icon,
  DashboardCircleIcon,
  Mortarboard01Icon,
} from "@hugeicons/core-free-icons";
import Link from "next/link";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "../ui/sidebar";
import { HugeiconsIcon } from "@hugeicons/react";
import { useParams, usePathname } from "next/navigation";

const items = [
  { id: 1, label: "Dashboard", icon: DashboardCircleIcon, href: "" },
  { id: 2, label: "Students", icon: Mortarboard01Icon, href: "/students" },
  { id: 3, label: "Subjects", icon: Book02Icon, href: "/subjects" },
];

export function ProgramSidebar() {
  const { programId } = useParams<{ programId: string }>();
  const pathname = usePathname();
  return (
    <Sidebar collapsible="none" className="hidden peer flex-1 flex">
      <SidebarHeader>
        <span className="text-lg px-1.5 font-semibold font-heading">
          Program Title
        </span>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
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
      </SidebarContent>
    </Sidebar>
  );
}
