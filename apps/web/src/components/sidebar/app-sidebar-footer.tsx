"use client";

import { ArrowDown01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useQueryClient } from "@tanstack/react-query";
import { signOutSession } from "@/auth/client";
import {
  getAuthUserQueryKey,
  useAuthSetCurrentInstitution,
  useAuthUserSuspense,
} from "@/lib/api/generated/auth/auth";
import { getProgramsIndexQueryKey } from "@/lib/api/generated/context-program/context-program";
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
  const queryClient = useQueryClient();
  const { data } = useAuthUserSuspense();
  const { mutate: setCurrentInstitution, isPending: isSwitching } =
    useAuthSetCurrentInstitution({
      mutation: {
        onSettled: () => {
          void queryClient.invalidateQueries({
            queryKey: getAuthUserQueryKey(),
          });
          void queryClient.invalidateQueries({
            queryKey: getProgramsIndexQueryKey(),
          });
        },
      },
    });

  const session = data?.status === 200 ? data.data : null;
  const user = session?.user ?? null;
  const currentInstitution = session?.current_institution;

  return (
    <SidebarFooter className="pb-6">
      <SidebarMenu>
        {user ? (
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
                    {currentInstitution ? (
                      <p className="text-xs text-muted-foreground/90 truncate max-w-44">
                        {currentInstitution.name}
                      </p>
                    ) : null}
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

              {/** Show dropdown if there is more than 1 institution in the user's institutions */}
              {user.institutions.length > 1 ? (
                <>
                  <DropdownMenuLabel className="text-xs font-normal text-muted-foreground">
                    Institution
                  </DropdownMenuLabel>
                  {user.institutions.map((institution) => (
                    <DropdownMenuItem
                      key={institution.id}
                      disabled={
                        isSwitching ||
                        institution.id === session?.current_institution_id
                      }
                      onClick={() => {
                        setCurrentInstitution({
                          data: { institution_id: institution.id },
                        });
                      }}
                    >
                      {institution.name}
                    </DropdownMenuItem>
                  ))}
                  <DropdownMenuSeparator />
                </>
              ) : null}

              <DropdownMenuItem
                onClick={() => {
                  void signOutSession().then(() => window.location.reload());
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
