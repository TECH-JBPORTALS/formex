"use client";

import { Search01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { ColumnDef } from "@tanstack/react-table";
import { parseAsString, throttle, useQueryState } from "nuqs";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { DataTable } from "@/components/data-table";
import { SpinnerPage } from "@/components/spinner-page";
import { Button } from "@/components/ui/button";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuthUser } from "@/lib/api/generated/auth/auth";
import type { ResultAnalysesUpdateBodyScoredGrade } from "@/lib/api/generated/models/resultAnalysesUpdateBodyScoredGrade";
import type { ResultAnalysis } from "@/lib/api/generated/models/resultAnalysis";
import type { Student } from "@/lib/api/generated/models/student";
import {
  getResultAnalysisListByCourseQueryKey,
  resultAnalysesDestroy,
  resultAnalysesUpdate,
  resultAnalysisStore,
  useResultAnalysisListByCourse,
} from "@/lib/api/generated/result-analysis/result-analysis";
import { useProgramsStudentsIndex } from "@/lib/api/generated/student/student";
import { useSubjectsShow } from "@/lib/api/generated/subject/subject";
import { RESULT_GRADES, type ResultGrade } from "./result-grades";

type GradeValue = ResultGrade | "";
const NO_GRADE = "__none__";
const STABLE_EMPTY_STUDENTS: Student[] = [];
const STABLE_EMPTY_RESULTS: ResultAnalysis[] = [];

export function ResultAnalysisBySubjectSection({
  programId,
  subjectId,
}: {
  programId: string;
  subjectId: string;
}) {
  const queryClient = useQueryClient();
  const [search, setSearch] = useQueryState(
    "res_q",
    parseAsString
      .withDefault("")
      .withOptions({ limitUrlUpdates: throttle(300) }),
  );
  const [gradesByStudentId, setGradesByStudentId] = useState<
    Record<string, GradeValue>
  >({});

  const { data: auth } = useAuthUser();
  const academicYear =
    auth?.status === 200 && auth.data.current_academic_year != null
      ? auth.data.current_academic_year
      : new Date().getFullYear();
  const subjectQ = useSubjectsShow(subjectId, {
    query: { enabled: !!subjectId },
  });
  const semester =
    subjectQ.data?.status === 200 ? (subjectQ.data.data.data.semester ?? 0) : 0;
  const studentsQ = useProgramsStudentsIndex(programId, {
    query: { enabled: !!programId },
  });
  const allStudents: Student[] =
    studentsQ.data?.status === 200
      ? studentsQ.data.data.data
      : STABLE_EMPTY_STUDENTS;
  const semesterStudents = useMemo(
    () =>
      allStudents.filter((s) => {
        return s.semester === semester;
      }),
    [allStudents, semester],
  );
  const listQuery = useResultAnalysisListByCourse(subjectId, {
    query: { enabled: !!subjectId },
  });
  const rows: ResultAnalysis[] =
    listQuery.data?.status === 200
      ? listQuery.data.data.data
      : STABLE_EMPTY_RESULTS;

  const rowsByStudentId = useMemo(
    () => new Map(rows.map((r) => [r.student_id, r])),
    [rows],
  );

  const tableStudents = useMemo(() => {
    const merged = new Map<string, Student>();
    for (const s of semesterStudents) {
      merged.set(s.id, s);
    }
    for (const r of rows) {
      const sid = r.student_id;
      if (merged.has(sid)) {
        continue;
      }
      const rs = r.student;
      if (rs) {
        merged.set(sid, rs);
      }
    }
    return [...merged.values()];
  }, [semesterStudents, rows]);

  useEffect(() => {
    const initial: Record<string, GradeValue> = {};
    for (const s of tableStudents) {
      initial[s.id] =
        (rowsByStudentId.get(s.id)?.scored_grade as GradeValue) ?? "";
    }
    setGradesByStudentId((prev) => {
      const prevKeys = Object.keys(prev);
      const nextKeys = Object.keys(initial);
      if (prevKeys.length !== nextKeys.length) {
        return initial;
      }
      for (const key of nextKeys) {
        if ((prev[key] ?? "") !== (initial[key] ?? "")) {
          return initial;
        }
      }
      return prev;
    });
  }, [tableStudents, rowsByStudentId]);

  const q = search.trim().toLowerCase();
  const visibleStudents = useMemo(() => {
    if (!q) {
      return tableStudents;
    }
    return tableStudents.filter((s) =>
      `${s.full_name} ${s.register_no ?? ""} ${gradesByStudentId[s.id] ?? ""}`
        .toLowerCase()
        .includes(q),
    );
  }, [tableStudents, q, gradesByStudentId]);

  const hasChanges = useMemo(() => {
    for (const s of tableStudents) {
      const initial = rowsByStudentId.get(s.id)?.scored_grade ?? "";
      const current = gradesByStudentId[s.id] ?? "";
      if (initial !== current) {
        return true;
      }
    }
    return false;
  }, [tableStudents, rowsByStudentId, gradesByStudentId]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      for (const s of tableStudents) {
        const existing = rowsByStudentId.get(s.id);
        const previousGrade = existing?.scored_grade ?? "";
        const nextGrade = gradesByStudentId[s.id] ?? "";
        if (previousGrade === nextGrade) {
          continue;
        }
        if (existing && !nextGrade) {
          const res = await resultAnalysesDestroy(
            existing.id as unknown as string,
            {
              method: "DELETE",
            },
          );
          if (res.status >= 400) {
            throw new Error("Could not remove result analysis");
          }
          continue;
        }
        if (existing && nextGrade) {
          const res = await resultAnalysesUpdate(
            existing.id as unknown as string,
            {
              scored_grade: nextGrade as ResultAnalysesUpdateBodyScoredGrade,
            },
          );
          if (res.status >= 400) {
            throw new Error("Could not update result analysis");
          }
          continue;
        }
        if (!existing && nextGrade) {
          const res = await resultAnalysisStore(subjectId, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              student_id: s.id,
              scored_grade: nextGrade,
            }),
          });
          if (res.status >= 400) {
            throw new Error("Could not create result analysis");
          }
        }
      }
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: getResultAnalysisListByCourseQueryKey(subjectId),
      });
      toast.success("Result analysis updated");
    },
    onError: (e) => {
      toast.error(
        e instanceof Error ? e.message : "Could not save result analysis",
      );
    },
  });

  const columns: ColumnDef<Student>[] = [
    {
      id: "student",
      header: "Student",
      cell: ({ row }) => (
        <div>
          <div className="font-medium text-foreground">
            {row.original.full_name}
          </div>
          <div className="text-muted-foreground text-sm">
            {row.original.register_no ?? "—"}
          </div>
        </div>
      ),
    },
    {
      id: "scored_grade",
      header: "Grade",
      cell: ({ row }) => {
        const sid = row.original.id;
        const grade = gradesByStudentId[sid] ?? "";
        return (
          <Select
            value={grade || NO_GRADE}
            onValueChange={(value) => {
              setGradesByStudentId((prev) => ({
                ...prev,
                [sid]: value === NO_GRADE ? "" : (value as ResultGrade),
              }));
            }}
          >
            <SelectTrigger className="w-28">
              <SelectValue placeholder="Select" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={NO_GRADE}>Not set</SelectItem>
              {RESULT_GRADES.map((g) => (
                <SelectItem key={g} value={g}>
                  {g}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );
      },
    },
  ];

  if (listQuery.isLoading || studentsQ.isLoading || subjectQ.isLoading) {
    return <SpinnerPage />;
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <InputGroup className="max-w-sm min-w-[200px]">
          <InputGroupAddon>
            <HugeiconsIcon icon={Search01Icon} />
          </InputGroupAddon>
          <InputGroupInput
            placeholder="Search by student, reg. no., or grade..."
            value={search}
            onChange={(e) => void setSearch(e.target.value || null)}
          />
        </InputGroup>
        <Button
          disabled={!hasChanges || saveMutation.isPending || !academicYear}
          onClick={() => {
            void saveMutation.mutateAsync();
          }}
        >
          Save changes
        </Button>
      </div>

      <DataTable data={visibleStudents} columns={columns} />
    </div>
  );
}
