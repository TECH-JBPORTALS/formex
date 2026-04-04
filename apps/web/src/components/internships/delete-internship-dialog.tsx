"use client";

import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { invalidateInternshipCaches } from "@/components/internships/internship-query-invalidation";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useInternshipsDestroy } from "@/lib/api/generated/internship/internship";
import type { Internship } from "@/lib/api/generated/models";
import { Button } from "../ui/button";

export function DeleteInternshipDialog({
  internship,
  open,
  onOpenChange,
}: {
  internship: Internship;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const queryClient = useQueryClient();

  const destroyMutation = useInternshipsDestroy(
    {
      mutation: {
        onSuccess: async (res) => {
          if (res.status !== 200) {
            toast.error("Could not delete internship");
            return;
          }
          await invalidateInternshipCaches(queryClient, internship);
          toast.success("Internship deleted");
          onOpenChange(false);
        },
        onError: (err) => {
          toast.error(
            err instanceof Error ? err.message : "Could not delete internship",
          );
        },
      },
    },
    queryClient,
  );

  async function onConfirm() {
    await destroyMutation.mutateAsync({ internship: internship.id });
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete internship?</AlertDialogTitle>
          <AlertDialogDescription>
            This will remove the internship at{" "}
            <span className="text-foreground font-medium">
              {internship.industry_name}
            </span>{" "}
            ({internship.role}). This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={destroyMutation.isPending}>
            Cancel
          </AlertDialogCancel>
          <Button
            variant="destructive"
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
