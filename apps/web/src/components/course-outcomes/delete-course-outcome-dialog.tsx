"use client";

import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { CourseOutcome } from "@/lib/api/generated/models";
import {
  getCourseOutcomesIndexQueryKey,
  getCourseOutcomeListByCourseQueryKey,
  useCourseOutcomesDestroy,
} from "@/lib/api/generated/course-outcome/course-outcome";

export function DeleteCourseOutcomeDialog({
  courseOutcome,
  open,
  onOpenChange,
}: {
  courseOutcome: CourseOutcome;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const queryClient = useQueryClient();
  const destroyMutation = useCourseOutcomesDestroy(
    {
      mutation: {
        onSuccess: async (res) => {
          if (res.status !== 200) {
            toast.error("Could not delete course outcome");
            return;
          }
          await queryClient.invalidateQueries({
            queryKey: getCourseOutcomesIndexQueryKey(),
          });
          await queryClient.invalidateQueries({
            queryKey: getCourseOutcomeListByCourseQueryKey(courseOutcome.course_id),
          });
          toast.success("Course outcome deleted");
          onOpenChange(false);
        },
        onError: (err) => {
          toast.error(
            err instanceof Error ? err.message : "Could not delete course outcome",
          );
        },
      },
    },
    queryClient,
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete course outcome?</DialogTitle>
          <DialogDescription>
            This permanently removes the selected course outcome.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            disabled={destroyMutation.isPending}
            onClick={() =>
              void destroyMutation.mutateAsync({
                courseOutcome: courseOutcome.id as unknown as number,
              })
            }
          >
            {destroyMutation.isPending ? "Deleting..." : "Delete"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
