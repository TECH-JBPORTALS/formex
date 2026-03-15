"use client";

import { useState } from "react";
import { PlusIcon, Loader2 } from "lucide-react";
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
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { useTRPC } from "../../trpc/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ProgramActions } from "./program-actions";

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

export function AppSidebar() {
  const trpc        = useTRPC();
  const queryClient = useQueryClient();

  const [activeId, setActiveId]       = useState<string | null>(null);
  const [dialogOpen, setDialogOpen]   = useState(false);
  const [programName, setProgramName] = useState("");
  const [error, setError]             = useState("");

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
    if (!trimmed) { setError("Program name cannot be empty."); return; }
    create.mutate({ name: trimmed });
  }

  return (
    <>
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
            <SidebarGroupAction onClick={openDialog}>
              <PlusIcon /> <span className="sr-only">Add Branch</span>
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
                  <SidebarMenuItem key={item.id} className="group/item">
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
      </Sidebar>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Branch</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-2 py-2">
            <Label htmlFor="program-name">Program Name</Label>
            <Input
              id="program-name"
              placeholder="e.g. Computer Science & Engg."
              value={programName}
              onChange={(e) => { setProgramName(e.target.value); if (error) setError(""); }}
              onKeyDown={(e) => { if (e.key === "Enter") handleSave(); if (e.key === "Escape") setDialogOpen(false); }}
              autoFocus
              disabled={create.isPending}
            />
            {error && <p className="text-xs text-destructive">{error}</p>}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)} disabled={create.isPending}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={create.isPending}>
              {create.isPending ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Saving…</>
              ) : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}