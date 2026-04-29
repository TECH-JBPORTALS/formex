"use client";

import { ArrowRight01Icon, Tick02Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Fragment, useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useSubjectsShow } from "@/lib/api/generated/subject/subject";
import { $api } from "@/lib/api/mutator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

type StudentRow = {
  id: string;
  full_name: string;
  register_no: string | null;
};

type CieCol = {
  cie_number: number;
  test: { id: string; name: string; maximum_marks: number } | null;
  max_marks: number;
  marks_by_student: Record<string, number | null>;
};

type OutcomeBlock = {
  course_outcome: {
    id: string;
    name: string;
    description?: string | null;
  };
  total_allotted: number;
  target_percentage?: number;
  target_marks?: number;
  total_obtained_by_student?: Record<string, number>;
  target_achieved_by_student?: Record<string, "Yes" | "N">;
  cie_columns: CieCol[];
};

type TestMarksPayload = {
  subject: { id: string; name: string; code: string | null };
  students: StudentRow[];
  outcome_blocks: OutcomeBlock[];
};

type TestMarksLaravelJson = { data: TestMarksPayload };

type TestMarksFetchResult = {
  data: TestMarksLaravelJson;
  status: number;
  headers: Headers;
};

function cellKey(studentId: string, testId: string, courseOutcomeId: string) {
  return `${studentId}:${testId}:${courseOutcomeId}`;
}

type MarkRow = {
  student_id: string;
  test_id: string;
  course_outcome_id: string;
  marks: number | null;
};

function computeTestTotals(
  d: Record<string, string>,
  data: TestMarksPayload,
): Record<string, number> {
  const acc: Record<string, number> = {};
  for (const block of data.outcome_blocks) {
    for (const col of block.cie_columns) {
      if (!col.test || col.max_marks <= 0) {
        continue;
      }
      for (const s of data.students) {
        const k = cellKey(s.id, col.test.id, block.course_outcome.id);
        const raw = (d[k] ?? "").trim();
        if (raw === "") {
          continue;
        }
        const n = Number(raw);
        if (Number.isInteger(n) && n >= 0) {
          const pk = `${s.id}:${col.test.id}`;
          acc[pk] = (acc[pk] ?? 0) + n;
        }
      }
    }
  }
  return acc;
}

/** Validate + build rows for one student and one CO block (partial save). */
function validateAndBuildRowsForStudentCo(
  d: Record<string, string>,
  data: TestMarksPayload,
  studentId: string,
  studentName: string,
  block: OutcomeBlock,
): { ok: true; rows: MarkRow[] } | { ok: false; message: string } {
  for (const c of block.cie_columns) {
    if (!c?.test || c.max_marks <= 0) {
      continue;
    }
    const k = cellKey(studentId, c.test.id, block.course_outcome.id);
    const raw = (d[k] ?? "").trim();
    if (raw === "") {
      continue;
    }
    const n = Number(raw);
    if (!Number.isInteger(n) || n < 0) {
      return {
        ok: false,
        message: "Use whole numbers only, or leave blank to clear.",
      };
    }
    if (n > c.max_marks) {
      return {
        ok: false,
        message: `Marks in ${c.test.name} for ${block.course_outcome.name} may not exceed ${c.max_marks} (allotted for this CO in this CIE).`,
      };
    }
  }

  const testTotals = computeTestTotals(d, data);
  for (const block of data.outcome_blocks) {
    for (const col of block.cie_columns) {
      if (!col.test || col.max_marks <= 0) {
        continue;
      }
      const pk = `${studentId}:${col.test.id}`;
      const t = testTotals[pk] ?? 0;
      if (t > col.test.maximum_marks) {
        return {
          ok: false,
          message: `For ${studentName}, total in "${col.test.name}" across course outcomes exceeds the test maximum (${col.test.maximum_marks}).`,
        };
      }
    }
  }

  const rows: MarkRow[] = [];
  for (const c of block.cie_columns) {
    if (!c?.test || c.max_marks <= 0) {
      continue;
    }
    const k = cellKey(studentId, c.test.id, block.course_outcome.id);
    const raw = (d[k] ?? "").trim();
    if (raw === "") {
      rows.push({
        student_id: studentId,
        test_id: c.test.id,
        course_outcome_id: block.course_outcome.id,
        marks: null,
      });
    } else {
      rows.push({
        student_id: studentId,
        test_id: c.test.id,
        course_outcome_id: block.course_outcome.id,
        marks: Number(raw),
      });
    }
  }
  return { ok: true, rows };
}

/**
 * Marks grouped by CO. Under each CO, list CIE test rows.
 */
function StudentCoMarkBlocks({
  studentId,
  data,
  draft,
  testTotals,
  onChangeCell,
  disabled,
  onSaveCo,
  isSaving,
  saveIndicator,
}: {
  studentId: string;
  data: TestMarksPayload;
  draft: Record<string, string>;
  testTotals: Record<string, number>;
  onChangeCell: (k: string, v: string) => void;
  disabled?: boolean;
  onSaveCo: (courseOutcomeId: string) => void;
  isSaving: boolean;
  saveIndicator: { studentId: string; courseOutcomeId: string } | null;
}) {
  return (
    <div className="space-y-4 text-sm">
      {data.outcome_blocks.map((block) => {
        const coObtained = block.total_obtained_by_student?.[studentId] ?? 0;
        const coAllotted = block.total_allotted;
        const targetPercentage = block.target_percentage ?? 60;
        const targetMarks =
          block.target_marks ?? (coAllotted * targetPercentage) / 100;
        const targetAchieved =
          block.target_achieved_by_student?.[studentId] ?? "N";

        return (
          <div
            key={block.course_outcome.id}
            className="bg-background overflow-hidden rounded-lg border"
          >
            <div className="bg-muted/40 flex flex-col gap-2 border-b px-3 py-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="text-xs font-heading font-semibold text-foreground">
                  {block.course_outcome.name}
                </h3>
                <p className="text-muted-foreground text-[11px]">
                  {block.course_outcome.description?.trim() ||
                    "Course outcome description not available."}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <span className="text-muted-foreground text-xs">
                  Total Marks allotted {block.course_outcome.name}:{" "}
                  <span className="text-foreground font-mono tabular-nums">
                    {coAllotted}
                  </span>
                </span>
                <span className="text-muted-foreground text-xs">
                  Total marks obtained by the student:{" "}
                  <span className="text-foreground font-mono tabular-nums">
                    {coObtained}
                  </span>
                </span>
                <span className="text-muted-foreground text-xs">
                  Target ({targetPercentage}%):{" "}
                  <span className="text-foreground font-mono tabular-nums">
                    {targetMarks}
                  </span>
                </span>
                <span className="text-muted-foreground text-xs">
                  Target achieved:{" "}
                  <span className="text-foreground font-mono tabular-nums">
                    {targetAchieved}
                  </span>
                </span>
                <Button
                  type="button"
                  size="sm"
                  variant="secondary"
                  className="shrink-0"
                  disabled={disabled || isSaving}
                  onClick={() => onSaveCo(block.course_outcome.id)}
                >
                  <HugeiconsIcon className="size-3.5" icon={Tick02Icon} />
                  {isSaving &&
                  saveIndicator?.studentId === studentId &&
                  saveIndicator.courseOutcomeId === block.course_outcome.id
                    ? "Saving…"
                    : "Save CO marks"}
                </Button>
              </div>
            </div>
            <Table className="text-xs [&_td]:px-2.5 [&_td]:py-1.5 [&_th]:h-9 [&_th]:px-2.5">
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="w-16">CIE</TableHead>
                  <TableHead className="w-28">Test</TableHead>
                  <TableHead className="w-11 text-right">Max</TableHead>
                  <TableHead className="w-14 text-right">Target</TableHead>
                  <TableHead className="w-24 text-right">Obtained</TableHead>
                  <TableHead className="w-20 text-right">Achieved</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {block.cie_columns.map((c) => {
                  const canEdit = Boolean(c.test && c.max_marks > 0);
                  const k = c.test
                    ? cellKey(studentId, c.test.id, block.course_outcome.id)
                    : "";
                  const v = canEdit ? (draft[k] ?? "") : "";
                  const tsum = c.test
                    ? (testTotals[`${studentId}:${c.test.id}`] ?? 0)
                    : 0;
                  const over =
                    c.test && tsum > c.test.maximum_marks ? tsum : null;
                  const targetForCie = canEdit
                    ? Math.ceil((c.max_marks * targetPercentage) / 100)
                    : 0;
                  const obtainedForCie = Number(v);
                  const isTargetAchievedForCie =
                    canEdit &&
                    Number.isFinite(obtainedForCie) &&
                    obtainedForCie >= targetForCie;
                  return (
                    <TableRow
                      key={`${block.course_outcome.id}-cie${c.cie_number}`}
                      className={!canEdit ? "bg-muted/15" : undefined}
                    >
                      <TableCell className="text-muted-foreground font-mono">
                        CIE {c.cie_number}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {c.test?.name ?? "—"}
                      </TableCell>
                      <TableCell className="text-right font-mono tabular-nums text-muted-foreground">
                        {c.max_marks}
                      </TableCell>
                      <TableCell className="text-right font-mono tabular-nums text-muted-foreground">
                        {canEdit ? targetForCie : "—"}
                      </TableCell>
                      <TableCell className="text-right">
                        {canEdit && c.test ? (
                          <div className="flex flex-col items-end gap-0.5">
                            <Input
                              className="h-8 w-18 text-right [appearance:textfield] tabular-nums [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                              type="number"
                              min={0}
                              max={c.max_marks}
                              value={v}
                              disabled={disabled}
                              onChange={(e) => onChangeCell(k, e.target.value)}
                              placeholder="—"
                              aria-label={`Mark for ${block.course_outcome.name}, ${c.test.name}`}
                            />
                            {over !== null && over > 0 ? (
                              <span className="text-destructive text-[9px] leading-tight">
                                Σ {over}/{c.test.maximum_marks} test
                              </span>
                            ) : null}
                          </div>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        {canEdit ? (
                          <span
                            className={cn(
                              "font-mono tabular-nums",
                              isTargetAchievedForCie
                                ? "text-emerald-600"
                                : "text-muted-foreground",
                            )}
                          >
                            {isTargetAchievedForCie ? "Yes" : "N"}
                          </span>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        );
      })}
    </div>
  );
}

export function TestMarksBySubjectSection({
  programId,
  subjectId,
}: {
  programId: string;
  subjectId: string;
}) {
  const queryClient = useQueryClient();
  const [draft, setDraft] = useState<Record<string, string>>({});
  const [rowOpen, setRowOpen] = useState<Record<string, boolean>>({});
  const [savingTarget, setSavingTarget] = useState<{
    studentId: string;
    courseOutcomeId: string;
  } | null>(null);

  const subjectQuery = useSubjectsShow(subjectId, {
    query: { enabled: !!subjectId },
  });
  const subject =
    subjectQuery.data?.status === 200 ? subjectQuery.data.data.data : null;
  const semester = subject ? Math.min(6, Math.max(1, subject.semester)) : null;

  const matrixQuery = useQuery({
    queryKey: ["test-marks-matrix", programId, semester, subjectId],
    queryFn: async () => {
      return $api<TestMarksFetchResult>(
        `/programs/${programId}/test-marks-matrix?semester=${semester}&subject_id=${subjectId}`,
      );
    },
    enabled: !!programId && !!subjectId && semester !== null,
  });

  const data = useMemo((): TestMarksPayload | null => {
    const r = matrixQuery.data;
    if (r?.status !== 200 || !r.data) {
      return null;
    }
    return r.data.data ?? null;
  }, [matrixQuery.data]);

  const seedDraft = useCallback(
    (blocks: OutcomeBlock[], students: StudentRow[]) => {
      const next: Record<string, string> = {};
      for (const block of blocks) {
        for (const col of block.cie_columns) {
          if (!col.test || col.max_marks <= 0) {
            continue;
          }
          for (const s of students) {
            const v = col.marks_by_student[s.id];
            const k = cellKey(s.id, col.test.id, block.course_outcome.id);
            next[k] = v == null || v === undefined ? "" : String(v);
          }
        }
      }
      return next;
    },
    [],
  );

  useEffect(() => {
    if (!data) {
      return;
    }
    setDraft(seedDraft(data.outcome_blocks, data.students));
  }, [data, seedDraft]);

  const setCell = useCallback((k: string, v: string) => {
    setDraft((prev) => ({ ...prev, [k]: v }));
  }, []);

  const testTotals = useMemo(() => {
    if (!data) {
      return {} as Record<string, number>;
    }
    return computeTestTotals(draft, data);
  }, [data, draft]);

  const saveMutation = useMutation({
    mutationFn: async (rows: MarkRow[]) => {
      if (semester === null) {
        throw new Error("no semester");
      }
      return $api<{ status: number; data: unknown }>(
        `/programs/${programId}/test-marks`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            semester,
            subject_id: subjectId,
            rows,
          }),
        },
      );
    },
    onSuccess: async (res: { status: number; data: unknown }) => {
      if (res.status >= 400) {
        const body = res.data as { message?: string };
        toast.error(
          typeof body === "object" && body && "message" in body
            ? String((body as { message?: string }).message)
            : "Could not save marks",
        );
        return;
      }
      await queryClient.invalidateQueries({
        queryKey: ["test-marks-matrix", programId, semester, subjectId],
      });
    },
    onError: () => toast.error("Could not save marks."),
  });

  const handleSaveCo = async (s: StudentRow, block: OutcomeBlock) => {
    if (!data) {
      return;
    }
    setSavingTarget({
      studentId: s.id,
      courseOutcomeId: block.course_outcome.id,
    });
    try {
      const result = validateAndBuildRowsForStudentCo(
        draft,
        data,
        s.id,
        s.full_name,
        block,
      );
      if (!result.ok) {
        toast.error(result.message);
        return;
      }
      if (result.rows.length === 0) {
        toast.error("No tests in this CO to save.");
        return;
      }
      const res = await saveMutation.mutateAsync(result.rows);
      if (res.status >= 400) {
        return;
      }
      toast.success(`${block.course_outcome.name} marks saved.`);
    } finally {
      setSavingTarget(null);
    }
  };

  const toggleRow = (studentId: string) => {
    setRowOpen((prev) => ({ ...prev, [studentId]: !prev[studentId] }));
  };

  if (subjectQuery.isLoading || semester === null) {
    return <p className="text-muted-foreground text-sm">Loading subject…</p>;
  }

  if (matrixQuery.isLoading) {
    return <p className="text-muted-foreground text-sm">Loading test marks…</p>;
  }

  if (!data) {
    return (
      <p className="text-muted-foreground text-sm">
        Could not load test marks.
      </p>
    );
  }

  if (data.students.length === 0) {
    return (
      <p className="text-muted-foreground text-sm">
        No students in this program for semester {semester} (current academic
        year).
      </p>
    );
  }

  if (data.outcome_blocks.length === 0) {
    return (
      <p className="text-muted-foreground text-sm">
        Add course outcomes for this subject first (Course Outcomes tab), and
        configure program Tests with CIE numbers and CO allocations.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="font-heading text-base font-semibold">Test marks</h2>
        <p className="text-muted-foreground text-sm">
          {data.subject.name}
          {data.subject.code ? ` (${data.subject.code})` : ""} — Semester{" "}
          {semester}
        </p>
        <p className="text-muted-foreground text-xs mt-1 max-w-2xl">
          Expand a student to enter marks{" "}
          <strong>with CIE rows under each CO</strong>. CO totals are shown
          before the save button in each CO block.
        </p>
      </div>

      <div className="max-w-full overflow-x-auto rounded-lg border">
        <table className="w-full min-w-md border-collapse text-left text-sm">
          <thead>
            <tr className="bg-muted/50">
              <th className="border-b p-2 text-center text-xs font-medium w-9">
                Sl.
              </th>
              <th className="border-b p-2 text-left text-xs font-medium">
                Reg. no.
              </th>
              <th className="border-b p-2 text-left text-xs font-medium min-w-40">
                Student
              </th>
              <th className="border-b p-2 w-10 text-center text-xs font-medium">
                <span className="sr-only">Expand</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {data.students.map((s, index) => {
              const open = rowOpen[s.id];
              return (
                <Fragment key={s.id}>
                  <tr
                    className={cn(
                      "border-b transition-colors",
                      open
                        ? "bg-muted text-muted-foreground"
                        : "odd:bg-background even:bg-muted/10",
                    )}
                  >
                    <td
                      className={cn(
                        "p-2 text-center text-xs tabular-nums",
                        open &&
                          "sticky top-14 z-30 bg-muted text-muted-foreground shadow-sm",
                      )}
                    >
                      {index + 1}
                    </td>
                    <td
                      className={cn(
                        "p-2 text-xs",
                        open &&
                          "sticky top-14 z-30 bg-muted text-muted-foreground shadow-sm",
                      )}
                    >
                      {s.register_no ?? "—"}
                    </td>
                    <td
                      className={cn(
                        "p-2 text-xs font-medium",
                        open &&
                          "sticky top-14 z-30 bg-muted text-muted-foreground shadow-sm",
                      )}
                    >
                      {s.full_name}
                    </td>
                    <td
                      className={cn(
                        "p-1 text-center",
                        open &&
                          "sticky top-14 z-30 bg-muted text-muted-foreground shadow-sm",
                      )}
                    >
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        className="size-8 shrink-0"
                        onClick={() => toggleRow(s.id)}
                        aria-expanded={open}
                        aria-label={
                          open ? "Collapse marks by CIE" : "Expand marks by CIE"
                        }
                      >
                        <HugeiconsIcon
                          icon={ArrowRight01Icon}
                          className={cn(
                            "size-4 transition-transform duration-200",
                            open && "rotate-90",
                          )}
                        />
                      </Button>
                    </td>
                  </tr>
                  {open ? (
                    <tr>
                      <td
                        colSpan={4}
                        className="bg-muted/20 border-b p-3 align-top"
                      >
                        <StudentCoMarkBlocks
                          studentId={s.id}
                          data={data}
                          draft={draft}
                          testTotals={testTotals}
                          disabled={saveMutation.isPending}
                          onChangeCell={setCell}
                          onSaveCo={(coId) => {
                            const block = data.outcome_blocks.find(
                              (b) => b.course_outcome.id === coId,
                            );
                            if (!block) {
                              return;
                            }
                            void handleSaveCo(s, block);
                          }}
                          isSaving={saveMutation.isPending}
                          saveIndicator={savingTarget}
                        />
                      </td>
                    </tr>
                  ) : null}
                </Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
