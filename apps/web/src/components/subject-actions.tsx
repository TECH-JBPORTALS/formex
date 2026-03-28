"use client";

import {
  Delete01Icon,
  LoaderCircle,
  MoreHorizontal,
  Pen01Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SidebarMenuAction } from "@/components/ui/sidebar";

type SubjectActionsProps = {
  id: string | number;
  name: string;
  onRename: (nextName: string) => void;
  onDelete: () => void;
};

export function SubjectActions({
  id,
  name,
  onRename,
  onDelete,
}: SubjectActionsProps) {
  const [renameOpen, setRenameOpen] = useState(false);
  const [newName, setNewName] = useState(name);
  const [renameError, setRenameError] = useState("");
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  function openRename() {
    setNewName(name);
    setRenameError("");
    setRenameOpen(true);
  }

  function handleRename() {
    const trimmed = newName.trim();
    if (!trimmed) {
      setRenameError("Subject name cannot be empty.");
      return;
    }
    if (trimmed === name) {
      setRenameOpen(false);
      return;
    }

    setBusy(true);
    try {
      onRename(trimmed);
      setRenameOpen(false);
    } finally {
      setBusy(false);
    }
  }

  function handleDelete() {
    setBusy(true);
    try {
      onDelete();
      setDeleteOpen(false);
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <DropdownMenu>
        <SidebarMenuAction asChild>
          <DropdownMenuTrigger>
            <HugeiconsIcon icon={MoreHorizontal} className="h-3.5 w-3.5" />
            <span className="sr-only">Subject options</span>
          </DropdownMenuTrigger>
        </SidebarMenuAction>
        <DropdownMenuContent side="right" align="start">
          <DropdownMenuItem onClick={openRename}>
            <HugeiconsIcon icon={Pen01Icon} className="mr-2 h-3.5 w-3.5" />
            Rename
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => setDeleteOpen(true)}
            className="text-destructive focus:text-destructive"
          >
            <HugeiconsIcon icon={Delete01Icon} className="mr-2 h-3.5 w-3.5" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={renameOpen} onOpenChange={setRenameOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Rename Subject</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-2 py-2">
            <Label htmlFor={`rename-subject-${id}`}>Subject Name</Label>
            <Input
              id={`rename-subject-${id}`}
              value={newName}
              onChange={(e) => {
                setNewName(e.target.value);
                if (renameError) setRenameError("");
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleRename();
                if (e.key === "Escape") setRenameOpen(false);
              }}
              autoFocus
              disabled={busy}
            />
            {renameError && (
              <p className="text-xs text-destructive">{renameError}</p>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setRenameOpen(false)}
              disabled={busy}
            >
              Cancel
            </Button>
            <Button onClick={handleRename} disabled={busy}>
              {busy ? (
                <>
                  <HugeiconsIcon
                    icon={LoaderCircle}
                    className="mr-2 h-4 w-4 animate-spin"
                  />
                  Saving…
                </>
              ) : (
                "Save"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Subject?</AlertDialogTitle>
            <AlertDialogDescription>
              <strong>{name}</strong> will be permanently deleted. This action
              cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={busy}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={busy}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {busy ? (
                <>
                  <HugeiconsIcon
                    icon={LoaderCircle}
                    className="mr-2 h-4 w-4 animate-spin"
                  />
                  Deleting…
                </>
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

