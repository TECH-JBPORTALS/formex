"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ChevronDownIcon, Loader2, PlusIcon, User2 } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { useTRPC } from "../../trpc/client";
import { useSession, signOut } from "@/lib/auth-client";
import { Button } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupAction,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
} from "../ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { ProgramActions } from "./program-actions";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";

const formats = [
  { id: 1, name: "INS FORMAT 01", href: "/f/1" },
  { id: 2, name: "INS FORMAT 02", href: "/f/2" },
];

export function AppSidebar() {
  const pathname = usePathname();
  const trpc = useTRPC();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data: session } = useSession();

  const [activeId, setActiveId] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [programName, setProgramName] = useState("");
  const [error, setError] = useState("");

  const { data: branches = [], isLoading } = useQuery(
    trpc.program.list.queryOptions(),
  );

  const create = useMutation(
    trpc.program.create.mutationOptions({
      onSuccess: (newProgram) => {
        void queryClient.invalidateQueries(trpc.program.list.queryOptions());
        if (newProgram) setActiveId(newProgram.id);
        setDialogOpen(false);
      },
      onError: () => setError("Something went wrong. Please try again."),
    }),
  );

  function openDialog() {
    setProgramName("");
    setError("");
    setDialogOpen(true);
  }

  function handleSave() {
    const trimmed = programName.trim();
    if (!trimmed) {
      setError("Program name cannot be empty.");
      return;
    }
    create.mutate({ name: trimmed });
  }

  return (
    <>
      <Sidebar>
        <SidebarHeader>
          <span className="text-lg px-1.5 font-semibold font-mono">Formex</span>
        </SidebarHeader>

        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Institution Formats</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {formats.map((item) => (
                  <SidebarMenuItem key={item.id}>
                    <SidebarMenuButton
                      asChild
                      isActive={pathname === item.href}
                    >
                      <Link href={item.href}>{item.name}</Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          <SidebarGroup>
            <SidebarGroupLabel>
              Programs
              <SidebarGroupAction onClick={openDialog}>
                <PlusIcon /> <span className="sr-only">Add Program</span>
              </SidebarGroupAction>
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {isLoading ? (
                  <div className="flex items-center gap-2 px-2 py-1.5 text-sm text-muted-foreground">
                    <Loader2 className="h-3.5 w-3.5 animate-spin" /> Loading…
                  </div>
                ) : (
                  branches.map((item) => (
                    <SidebarMenuItem key={item.id}>
                      <SidebarMenuButton
                        isActive={activeId === item.id}
                        onClick={() => setActiveId(item.id)}
                        className="flex w-full items-center"
                      >
                        <span className="flex-1 truncate">{item.name}</span>
                        <ProgramActions id={item.id} name={item.name} />
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))
                )}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

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

                      <ChevronDownIcon className="ml-auto group-data-[state=open]/dropdown-menu:-rotate-180 transition-all duration-200" />
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
                      <AvatarFallback>
                        {session.user.name.charAt(0)}
                      </AvatarFallback>
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
      </Sidebar>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Program</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-2 py-2">
            <Label htmlFor="program-name">Program Name</Label>
            <Input
              id="program-name"
              placeholder="e.g. Computer Science & Engg."
              value={programName}
              onChange={(e) => {
                setProgramName(e.target.value);
                if (error) setError("");
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSave();
                if (e.key === "Escape") setDialogOpen(false);
              }}
              autoFocus
              disabled={create.isPending}
            />
            {error && <p className="text-xs text-destructive">{error}</p>}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDialogOpen(false)}
              disabled={create.isPending}
            >
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={create.isPending}>
              {create.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving…
                </>
              ) : (
                "Save"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
