import { PlusIcon } from "lucide-react";
import {
  Sidebar,
  SidebarGroup,
  SidebarGroupAction,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "../ui/sidebar";

const formats = [
  {
    id: 1,
    name: "INS FORMAT 01",
  },
  {
    id: 2,
    name: "INS FORMAT 02",
  },
];

const branches = [
  {
    id: 1,
    name: "Computer Science & Engg.",
  },
  {
    id: 2,
    name: "Electrical & Electronics",
  },
  {
    id: 3,
    name: "Mechanical Engg.",
  },
  {
    id: 4,
    name: "Hotel Management",
  },
];

export function AppSidebar() {
  return (
    <Sidebar>
      <SidebarHeader>
        <span className="text-lg px-1.5 font-semibold font-mono">Formex</span>
      </SidebarHeader>

      <SidebarGroup>
        <SidebarGroupLabel>Institution Formats</SidebarGroupLabel>
        <SidebarGroupContent>
          <SidebarMenu>
            {formats.map((item) => (
              <SidebarMenuItem key={item.id}>
                <SidebarMenuButton>{item.name}</SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>

      <SidebarGroup>
        <SidebarGroupLabel>
          Branches
          <SidebarGroupAction>
            <PlusIcon /> <span className="sr-only">Add Branch</span>
          </SidebarGroupAction>
        </SidebarGroupLabel>
        <SidebarGroupContent>
          <SidebarMenu>
            {branches.map((item) => (
              <SidebarMenuItem key={item.id}>
                <SidebarMenuButton>{item.name}</SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>
    </Sidebar>
  );
}
