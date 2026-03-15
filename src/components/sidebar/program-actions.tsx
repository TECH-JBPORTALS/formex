"use client";

import { useState } from "react";
import { MoreHorizontalIcon, Pencil, Trash2, Loader2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../ui/alert-dialog";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { useTRPC } from "../../trpc/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";

interface ProgramActionsProps {
  id: string;
  name: string;
}

export function ProgramActions({ id, name }: ProgramActionsProps) {
  const trpc        = useTRPC();
  const queryClient = useQueryClient();

  const [renameOpen, setRenameOpen]   = useState(false);
  const [newName, setNewName]         = useState(name);
  const [renameError, setRenameError] = useState("");
  const [deleteOpen, setDeleteOpen]   = useState(false);

  const update = useMutation(
    trpc.program.update.mutationOptions({
      onSuccess: () => {
        void queryClient.invalidateQueries(trpc.program.list.queryOptions());
        setRenameOpen(false);
      },
      onError: () => setRenameError("Failed to rename. Please try again."),
    }),
  );

  const remove = useMutation(
    trpc.program.delete.mutationOptions({
      onSuccess: () =>
        void queryClient.invalidateQueries(trpc.program.list.queryOptions()),
    }),
  );

  function openRename() {
    setNewName(name);
    setRenameError("");
    setRenameOpen(true);
  }

  function handleRename() {
    const trimmed = newName.trim();
    if (!trimmed) { setRenameError("Program name cannot be empty."); return; }
    if (trimmed === name) { setRenameOpen(false); return; }
    update.mutate({ id, name: trimmed });
  }

  return (
    <>
      {/* ── Three-dot menu ── */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            className="ml-auto flex h-6 w-6 items-center justify-center rounded opacity-0 group-hover/item:opacity-100 hover:bg-accent"
            onClick={(e) => e.stopPropagation()}
          >
            <MoreHorizontalIcon className="h-3.5 w-3.5" />
            <span className="sr-only">Program options</span>
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent side="right" align="start">
          <DropdownMenuItem onClick={openRename}>
            <Pencil className="mr-2 h-3.5 w-3.5" />
            Rename
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => setDeleteOpen(true)}
            className="text-destructive focus:text-destructive"
          >
            <Trash2 className="mr-2 h-3.5 w-3.5" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* ── Rename Dialog ── */}
      <Dialog open={renameOpen} onOpenChange={setRenameOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Rename Branch</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-2 py-2">
            <Label htmlFor="rename-input">Program Name</Label>
            <Input
              id="rename-input"
              value={newName}
              onChange={(e) => { setNewName(e.target.value); if (renameError) setRenameError(""); }}
              onKeyDown={(e) => { if (e.key === "Enter") handleRename(); if (e.key === "Escape") setRenameOpen(false); }}
              autoFocus
              disabled={update.isPending}
            />
            {renameError && <p className="text-xs text-destructive">{renameError}</p>}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRenameOpen(false)} disabled={update.isPending}>
              Cancel
            </Button>
            <Button onClick={handleRename} disabled={update.isPending}>
              {update.isPending ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Saving…</>
              ) : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Delete Alert ── */}
      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Branch?</AlertDialogTitle>
            <AlertDialogDescription>
              <strong>{name}</strong> will be permanently deleted. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={remove.isPending}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => remove.mutate({ id })}
              disabled={remove.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {remove.isPending ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Deleting…</>
              ) : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}