"use client";

import { useQueryClient } from "@tanstack/react-query";
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
import { Button } from "@/components/ui/button";
import type { Placement } from "@/lib/api/generated/models";
import {
  getPlacementListByStudentQueryKey,
  getPlacementsIndexQueryKey,
  usePlacementsDestroy,
} from "@/lib/api/generated/placement/placement";

export function DeletePlacementDialog({
  placement,
  open,
  onOpenChange,
}: {
  placement: Placement;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const queryClient = useQueryClient();

  const destroyMutation = usePlacementsDestroy(
    {
      mutation: {
        onSuccess: async (res) => {
          if (res.status !== 200) {
            toast.error("Could not delete placement");
            return;
          }
          await queryClient.invalidateQueries({
            queryKey: getPlacementsIndexQueryKey(),
          });
          await queryClient.invalidateQueries({
            queryKey: getPlacementListByStudentQueryKey(placement.student_id),
          });
          toast.success("Placement deleted");
          onOpenChange(false);
        },
        onError: (err) => {
          toast.error(
            err instanceof Error ? err.message : "Could not delete placement",
          );
        },
      },
    },
    queryClient,
  );

  async function onConfirm() {
    await destroyMutation.mutateAsync({ placement: placement.id });
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete placement?</AlertDialogTitle>
          <AlertDialogDescription>
            This will remove the placement at{" "}
            <span className="text-foreground font-medium">
              {placement.industry_name}
            </span>{" "}
            ({placement.role}). This action cannot be undone.
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
