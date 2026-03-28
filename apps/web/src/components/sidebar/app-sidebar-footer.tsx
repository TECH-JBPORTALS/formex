import { ArrowDown01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useRouter } from "next/navigation";
import { authClient } from "@/auth/auth-client";
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
  const { data: session } = authClient.useSession();
  const signOut = authClient.signOut;
  const router = useRouter();

  return (
    <SidebarFooter className="pb-6">
      <SidebarMenu>
        {session?.user ? (
          <DropdownMenu>
            <SidebarMenuItem>
              <DropdownMenuTrigger className="group/dropdown-menu" asChild>
                <SidebarMenuButton size={"lg"}>
                  <Avatar>
                    <AvatarImage
                      src={session.user.image ?? ""}
                      alt={`${session.user.name}'s Avatar`}
                    />
                    <AvatarFallback>
                      {session.user.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>

                  <div>
                    <span className="font-medium">{session.user.name}</span>
                    <p className="text-xs text-muted-foreground">
                      {session.user.email}
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
                  <AvatarImage
                    src={session.user.image ?? ""}
                    alt={`${session.user.name}'s Avatar`}
                  />
                  <AvatarFallback>{session.user.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <span className="text-sm font-medium leading-none">
                    {session.user.name ?? "Signed in"}
                  </span>
                  <p className="text-xs text-muted-foreground">
                    {session.user.email}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => {
                  void signOut().then(() => router.refresh());
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
