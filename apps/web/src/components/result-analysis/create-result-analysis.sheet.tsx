"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { type ReactNode, useMemo, useState } from "react";
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
  SheetTrigger,
} from "@/components/ui/sheet";
import { useAuthUser } from "@/lib/api/generated/auth/auth";
import type { Student } from "@/lib/api/generated/models/student";
import {
  getResultAnalysisListByCourseQueryKey,
  resultAnalysisStore,
} from "@/lib/api/generated/result-analysis/result-analysis";
import { useProgramsStudentsIndex } from "@/lib/api/generated/student/student";
import { useSubjectsShow } from "@/lib/api/generated/subject/subject";
import { RESULT_GRADES, type ResultGrade } from "./result-grades";

export function CreateResultAnalysisSheet({
  children,
  programId,
  subjectId,
}: {
  children: ReactNode;
  programId: string;
  subjectId: string;
}) {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [studentId, setStudentId] = useState("");
  const [scoredGrade, setScoredGrade] = useState<ResultGrade>("A");

  const { data: auth } = useAuthUser();
  const academicYear =
    auth?.status === 200 && auth.data.current_academic_year != null
      ? auth.data.current_academic_year
      : new Date().getFullYear();

  const subjectQ = useSubjectsShow(subjectId, {
    query: { enabled: open && !!subjectId },
  });
  const subject =
    subjectQ.data?.status === 200 ? subjectQ.data.data.data : null;
  const semester = subject?.semester ?? 0;

  const studentsQ = useProgramsStudentsIndex(programId, {
    query: { enabled: open && !!programId },
  });
  const allStudents: Student[] =
    studentsQ.data?.status === 200 ? studentsQ.data.data.data : [];

  const eligibleStudents = useMemo(
    () =>
      allStudents.filter(
        (s) => s.semester === semester && s.academic_year === academicYear,
      ),
    [allStudents, semester, academicYear],
  );

  const createMutation = useMutation({
    mutationFn: async () => {
      return resultAnalysisStore(subjectId, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          student_id: studentId,
          scored_grade: scoredGrade,
        }),
      });
    },
    onSuccess: async (res) => {
      if (res.status >= 400) {
        const message =
          typeof (res.data as { message?: string })?.message === "string"
            ? (res.data as { message: string }).message
            : "Could not save result analysis";
        toast.error(message);
        return;
      }
      await queryClient.invalidateQueries({
        queryKey: getResultAnalysisListByCourseQueryKey(subjectId),
      });
      toast.success("Result analysis saved");
      setOpen(false);
      setStudentId("");
      setScoredGrade("A");
    },
    onError: (e) => {
      toast.error(
        e instanceof Error ? e.message : "Could not save result analysis",
      );
    },
  });

  function submit() {
    if (!studentId) {
      toast.error("Select a student");
      return;
    }
    createMutation.mutate();
  }

  return (
    <Sheet
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) {
          setStudentId("");
          setScoredGrade("A");
        }
      }}
    >
      <SheetTrigger asChild>{children}</SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Create result analysis</SheetTitle>
          <SheetDescription>
            Add a scored grade for one student in this course.
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-4 px-1 py-2">
          <div className="space-y-2">
            <Label>Student</Label>
            <Select value={studentId} onValueChange={setStudentId}>
              <SelectTrigger>
                <SelectValue placeholder="Select student" />
              </SelectTrigger>
              <SelectContent>
                {eligibleStudents.map((s) => (
                  <SelectItem key={s.id} value={s.id}>
                    {s.full_name}
                    {s.register_no ? ` (${s.register_no})` : ""}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Scored grade</Label>
            <Select
              value={scoredGrade}
              onValueChange={(v) => setScoredGrade(v as ResultGrade)}
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
          <Button
            variant="outline"
            onClick={() => {
              setOpen(false);
            }}
          >
            Cancel
          </Button>
          <Button onClick={submit} disabled={createMutation.isPending}>
            Save
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
