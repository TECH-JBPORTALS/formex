"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import type { Subject } from "@/lib/api/generated/models";
import {
  getSubjectListbysemesterQueryKey,
  useSubjectsDestroy,
} from "@/lib/api/generated/subject/subject";
import { Button } from "../ui/button";

export function DeleteSubjectDialog({
  subject,
  programId,
  listSemester,
  open,
  onOpenChange,
}: {
  subject: Subject;
  programId: string;
  listSemester: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const queryClient = useQueryClient();
  const [busy, setBusy] = useState(false);

  const destroyMutation = useSubjectsDestroy(
    {
      mutation: {
        onSuccess: async (res) => {
          if (res.status !== 200) {
            toast.error("Could not delete subject");
            return;
          }
          await queryClient.invalidateQueries({
            queryKey: getSubjectListbysemesterQueryKey(programId, listSemester),
          });
          if (subject.semester !== listSemester) {
            await queryClient.invalidateQueries({
              queryKey: getSubjectListbysemesterQueryKey(
                programId,
                subject.semester,
              ),
            });
          }
          toast.success("Subject deleted");
          onOpenChange(false);
        },
        onError: (err) => {
          toast.error(
            err instanceof Error ? err.message : "Could not delete subject",
          );
        },
      },
    },
    queryClient,
  );

  async function onConfirm() {
    await destroyMutation.mutateAsync({ subject: subject.id });
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete subject?</AlertDialogTitle>
          <AlertDialogDescription>
            This will remove{" "}
            <span className="text-foreground font-medium">{subject.name}</span>{" "}
            ({subject.short_name}). This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={busy}>Cancel</AlertDialogCancel>
          <Button
            variant={"destructive"}
            onClick={() => void onConfirm()}
            disabled={destroyMutation.isPending}
          >
            {destroyMutation.isPending ? "Deleting…" : "Delete"}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
