"use client";

import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { invalidateBridgeCaches } from "@/components/bridges/bridge-query-invalidation";
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
import { useBridgesDestroy } from "@/lib/api/generated/bridgre/bridgre";
import type { Bridge } from "@/lib/api/generated/models";

export function DeleteBridgeDialog({
  bridge,
  open,
  onOpenChange,
}: {
  bridge: Bridge;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const queryClient = useQueryClient();

  const destroyMutation = useBridgesDestroy(
    {
      mutation: {
        onSuccess: async (res) => {
          if (res.status !== 200) {
            toast.error("Could not delete bridge session");
            return;
          }
          await invalidateBridgeCaches(queryClient, bridge);
          toast.success("Bridge session deleted");
          onOpenChange(false);
        },
        onError: (err) => {
          toast.error(
            err instanceof Error ? err.message : "Could not delete bridge session",
          );
        },
      },
    },
    queryClient,
  );

  async function onConfirm() {
    await destroyMutation.mutateAsync({
      bridge: bridge.id as unknown as number,
    });
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete bridge session?</AlertDialogTitle>
          <AlertDialogDescription>
            This will remove the bridge session for{" "}
            <span className="text-foreground font-medium">
              {bridge.curriculum_gap}
            </span>
            . This action cannot be undone.
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
