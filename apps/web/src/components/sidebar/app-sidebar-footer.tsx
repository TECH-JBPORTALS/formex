"use client";

import { ArrowDown01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { signOutSession } from "@/auth/client";
import { useAuthLogout, useAuthUser } from "@/lib/api/generated/auth/auth";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import {
  SidebarFooter,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "../ui/sidebar";

export function AppSidebarFooter() {
  const { data, isPending } = useAuthUser();
  const {} = useAuthLogout();
  const user = data?.status === 200 ? data.data.user : null;

  return (
    <SidebarFooter className="pb-6">
      <SidebarMenu>
        {isPending ? (
          <p className="px-2 py-1.5 text-xs text-muted-foreground">Loading…</p>
        ) : user ? (
          <DropdownMenu>
            <SidebarMenuItem>
              <DropdownMenuTrigger className="group/dropdown-menu" asChild>
                <SidebarMenuButton size={"lg"}>
                  <Avatar>
                    <AvatarImage src="" alt="" />
                    <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                  </Avatar>

                  <div>
                    <span className="font-medium">{user.name}</span>
                    <p className="text-xs text-muted-foreground">
                      {user.email}
                    </p>
                  </div>

                  <HugeiconsIcon
                    icon={ArrowDown01Icon}
                    className="ml-auto group-data-[state=open]/dropdown-menu:-rotate-180 transition-all duration-200"
                  />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
            </SidebarMenuItem>
            <DropdownMenuContent className="w-60" align="start" side="top">
              <DropdownMenuLabel className="flex gap-1.5">
                <Avatar>
                  <AvatarImage src="" alt="" />
                  <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <span className="text-sm font-medium leading-none">
                    {user.name}
                  </span>
                  <p className="text-xs text-muted-foreground">{user.email}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => {
                  void signOutSession();
                }}
                variant="destructive"
              >
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <p className="px-2 py-1.5 text-xs text-muted-foreground">
            Not signed in
          </p>
        )}
      </SidebarMenu>
    </SidebarFooter>
  );
}
