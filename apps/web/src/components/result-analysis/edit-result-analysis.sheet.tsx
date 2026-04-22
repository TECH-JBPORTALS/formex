"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import type { ResultAnalysis } from "@/lib/api/generated/models/resultAnalysis";
import {
  getResultAnalysisListByCourseQueryKey,
  resultAnalysesUpdate,
} from "@/lib/api/generated/result-analysis/result-analysis";
import { RESULT_GRADES, type ResultGrade } from "./result-grades";

export function EditResultAnalysisSheet({
  initial,
  subjectId,
  open,
  onOpenChange,
  scoredGrade,
  onScoredGradeChange,
}: {
  initial: ResultAnalysis;
  subjectId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  scoredGrade: ResultGrade;
  onScoredGradeChange: (value: ResultGrade) => void;
}) {
  const queryClient = useQueryClient();

  const updateMutation = useMutation({
    mutationFn: async () => {
      return resultAnalysesUpdate(initial.id as unknown as number, {
        scored_grade: scoredGrade,
      });
    },
    onSuccess: async (res) => {
      if (res.status >= 400) {
        const message =
          typeof (res.data as { message?: string })?.message === "string"
            ? (res.data as { message: string }).message
            : "Could not update result analysis";
        toast.error(message);
        return;
      }
      await queryClient.invalidateQueries({
        queryKey: getResultAnalysisListByCourseQueryKey(subjectId),
      });
      toast.success("Result analysis updated");
      onOpenChange(false);
    },
    onError: (e) => {
      toast.error(
        e instanceof Error ? e.message : "Could not update result analysis",
      );
    },
  });

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Edit result analysis</SheetTitle>
          <SheetDescription>
            Update the scored grade for{" "}
            {initial.student?.full_name ?? "student"}.
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-4 px-1 py-2">
          <div className="space-y-2">
            <Label>Scored grade</Label>
            <Select
              value={scoredGrade}
              onValueChange={(v) => onScoredGradeChange(v as ResultGrade)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {RESULT_GRADES.map((grade) => (
                  <SelectItem key={grade} value={grade}>
                    {grade}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <SheetFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={() => {
              updateMutation.mutate();
            }}
            disabled={updateMutation.isPending}
          >
            Update
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
