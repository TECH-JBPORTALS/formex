"use client";

import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { RoomReport } from "@/lib/api/generated/models";
import {
  getRoomReportListByProgramQueryKey,
  useRoomReportsDestroy,
} from "@/lib/api/generated/room-report/room-report";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../ui/alert-dialog";
import { Button } from "../ui/button";

export function DeleteRoomReportDialog({
  roomReport,
  programId,
  open,
  onOpenChange,
}: {
  roomReport: RoomReport;
  programId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const queryClient = useQueryClient();
  const destroyMutation = useRoomReportsDestroy(
    {
      mutation: {
        onSuccess: async (res) => {
          if (res.status !== 200) {
            toast.error("Could not delete room report");
            return;
          }

          await queryClient.invalidateQueries({
            queryKey: getRoomReportListByProgramQueryKey(programId),
          });
          toast.success("Room report deleted");
          onOpenChange(false);
        },
        onError: (error) => {
          toast.error(error instanceof Error ? error.message : "Could not delete room report");
        },
      },
    },
    queryClient,
  );

  async function onConfirm() {
    await destroyMutation.mutateAsync({ roomReport: roomReport.id });
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete room report?</AlertDialogTitle>
          <AlertDialogDescription>
            This will remove room report for room{" "}
            <span className="text-foreground font-medium">{roomReport.room_number}</span>.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={destroyMutation.isPending}>Cancel</AlertDialogCancel>
          <Button
            variant="destructive"
            onClick={() => void onConfirm()}
            disabled={destroyMutation.isPending}
          >
            {destroyMutation.isPending ? "Deleting..." : "Delete"}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
