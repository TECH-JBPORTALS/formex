"use client";

import { PlusSignIcon, Search01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { ColumnDef } from "@tanstack/react-table";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { parseAsString, throttle, useQueryState } from "nuqs";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import Container from "@/components/container";
import { DataTable } from "@/components/data-table";
import Header from "@/components/header";
import { SpinnerPage } from "@/components/spinner-page";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useProgramsShow } from "@/lib/api/hooks/useProgramsShow";
import { $api } from "@/lib/api/mutator";

type CourseOutcomeOption = {
  id: string;
  name: string;
  course_id: string;
};

type TestCourseOutcome = {
  id: string;
  test_id: string;
  course_outcome_id: string;
  assigned_marks: number;
  course_outcome?: {
    id: string;
    name: string;
  };
};

type AcademicTest = {
  id: string;
  semester: number;
  name: string;
  cie_number: number;
  maximum_marks: number;
  minimum_passing_marks: number;
  total_assigned_marks: number;
  course_outcome_marks: TestCourseOutcome[];
};

type ApiCollection<T> = {
  data: {
    data: T[];
  };
  status: number;
};

type TestPayload = {
  semester: number;
  name: string;
  cie_number: number;
  maximum_marks: number;
  minimum_passing_marks: number;
  course_outcome_marks: Array<{
    course_outcome_id: string;
    assigned_marks: number;
  }>;
};

function TestFormDialog({
  open,
  onOpenChange,
  semester,
  initial,
  courseOutcomes,
  onSubmit,
  isSubmitting,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  semester: number;
  initial?: AcademicTest | null;
  courseOutcomes: CourseOutcomeOption[];
  onSubmit: (payload: TestPayload) => Promise<void>;
  isSubmitting: boolean;
}) {
  const [name, setName] = useState(initial?.name ?? "");
  const [cieNumber, setCieNumber] = useState(
    String(initial?.cie_number ?? 1),
  );
  const [maximumMarks, setMaximumMarks] = useState(
    initial?.maximum_marks ? String(initial.maximum_marks) : "",
  );
  const [minimumPassingMarks, setMinimumPassingMarks] = useState(
    initial?.minimum_passing_marks ? String(initial.minimum_passing_marks) : "",
  );
  const [assignedMarks, setAssignedMarks] = useState<Record<string, string>>(() => {
    const next: Record<string, string> = {};
    initial?.course_outcome_marks.forEach((row) => {
      next[row.course_outcome_id] = String(row.assigned_marks);
    });
    return next;
  });

  useEffect(() => {
    if (!open) {
      return;
    }

    setName(initial?.name ?? "");
    setCieNumber(String(initial?.cie_number ?? 1));
    setMaximumMarks(initial?.maximum_marks ? String(initial.maximum_marks) : "");
    setMinimumPassingMarks(
      initial?.minimum_passing_marks ? String(initial.minimum_passing_marks) : "",
    );
    const nextAssignedMarks: Record<string, string> = {};
    initial?.course_outcome_marks.forEach((row) => {
      nextAssignedMarks[row.course_outcome_id] = String(row.assigned_marks);
    });
    setAssignedMarks(nextAssignedMarks);
  }, [initial, open]);

  const totalAssigned = useMemo(() => {
    return Object.values(assignedMarks).reduce((sum, value) => {
      const parsed = Number(value);
      return Number.isFinite(parsed) && parsed > 0 ? sum + parsed : sum;
    }, 0);
  }, [assignedMarks]);

  const submit = async () => {
    const sanitizedRows = courseOutcomes
      .map((co) => ({
        course_outcome_id: co.id,
        assigned_marks: Number(assignedMarks[co.id] ?? 0),
      }))
      .filter((row) => Number.isInteger(row.assigned_marks) && row.assigned_marks > 0);

    if (!name.trim()) {
      toast.error("Test name is required.");
      return;
    }

    const parsedMaximum = Number(maximumMarks);
    const parsedMinimum = Number(minimumPassingMarks);
    const parsedCieNumber = Number(cieNumber);
    if (!Number.isInteger(parsedCieNumber) || parsedCieNumber < 1 || parsedCieNumber > 6) {
      toast.error("CIE number must be between 1 and 6.");
      return;
    }
    if (!Number.isInteger(parsedMaximum) || parsedMaximum <= 0) {
      toast.error("Maximum marks must be a positive number.");
      return;
    }
    if (!Number.isInteger(parsedMinimum) || parsedMinimum < 0) {
      toast.error("Minimum passing marks must be zero or more.");
      return;
    }
    if (parsedMinimum > parsedMaximum) {
      toast.error("Minimum passing marks cannot exceed maximum marks.");
      return;
    }
    if (sanitizedRows.length === 0) {
      toast.error("Assign marks to at least one course outcome.");
      return;
    }

    await onSubmit({
      semester,
      name: name.trim(),
      cie_number: parsedCieNumber,
      maximum_marks: parsedMaximum,
      minimum_passing_marks: parsedMinimum,
      course_outcome_marks: sanitizedRows,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>{initial ? "Edit test" : "Create test"}</DialogTitle>
          <DialogDescription>
            Semester {semester} test with CO-wise marks allocation.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <div className="space-y-1">
            <Label>Test name</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="space-y-1">
            <Label>CIE Number</Label>
            <Select value={cieNumber} onValueChange={setCieNumber}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select CIE number" />
              </SelectTrigger>
              <SelectContent>
                {Array.from({ length: 6 }).map((_, index) => {
                  const value = String(index + 1);
                  return (
                    <SelectItem key={value} value={value}>
                      CIE {value}
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <Label>Maximum marks</Label>
              <Input
                type="number"
                min={1}
                value={maximumMarks}
                onChange={(e) => setMaximumMarks(e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <Label>Minimum passing marks</Label>
              <Input
                type="number"
                min={0}
                value={minimumPassingMarks}
                onChange={(e) => setMinimumPassingMarks(e.target.value)}
              />
            </div>
          </div>
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <Label>Marks per Course Outcome</Label>
              <span className="text-muted-foreground text-xs">
                Total assigned: {totalAssigned}
              </span>
            </div>
            <div className="max-h-64 space-y-2 overflow-y-auto rounded-md border p-2">
              {courseOutcomes.length === 0 ? (
                <p className="text-muted-foreground text-sm">
                  No course outcomes found for this semester.
                </p>
              ) : (
                courseOutcomes.map((co) => (
                  <div
                    key={co.id}
                    className="grid grid-cols-[1fr_90px] items-center gap-2"
                  >
                    <span className="truncate text-sm">{co.name}</span>
                    <Input
                      type="number"
                      min={0}
                      value={assignedMarks[co.id] ?? ""}
                      onChange={(e) =>
                        setAssignedMarks((prev) => ({
                          ...prev,
                          [co.id]: e.target.value,
                        }))
                      }
                    />
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button disabled={isSubmitting} onClick={() => void submit()}>
            {isSubmitting ? "Saving..." : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function TestsPage() {
  const { programId } = useParams<{ programId: string }>();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const [search, setSearch] = useQueryState(
    "q",
    parseAsString
      .withDefault("")
      .withOptions({ limitUrlUpdates: throttle(300) }),
  );
  const semester = Number.isFinite(Number(searchParams.get("semester")))
    ? Math.min(6, Math.max(1, Number(searchParams.get("semester"))))
    : 1;

  const [createOpen, setCreateOpen] = useState(false);
  const [editing, setEditing] = useState<AcademicTest | null>(null);
  const [deleting, setDeleting] = useState<AcademicTest | null>(null);

  const { data: program } = useProgramsShow(programId);
  const testsQuery = useQuery({
    queryKey: ["tests", programId, semester],
    queryFn: async () => {
      return $api<ApiCollection<AcademicTest>>(
        `/programs/${programId}/tests?semester=${semester}`,
      );
    },
    enabled: !!programId,
  });
  const courseOutcomesQuery = useQuery({
    queryKey: ["tests-course-outcomes", programId, semester],
    queryFn: async () => {
      return $api<ApiCollection<CourseOutcomeOption>>(
        `/programs/${programId}/tests/course-outcomes?semester=${semester}`,
      );
    },
    enabled: !!programId,
  });

  const createMutation = useMutation({
    mutationFn: async (payload: TestPayload) => {
      return $api(`/programs/${programId}/tests`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["tests", programId, semester] });
      toast.success("Test created.");
      setCreateOpen(false);
    },
    onError: () => toast.error("Could not create test."),
  });

  const updateMutation = useMutation({
    mutationFn: async ({
      testId,
      payload,
    }: {
      testId: string;
      payload: TestPayload;
    }) => {
      return $api(`/tests/${testId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["tests", programId, semester] });
      toast.success("Test updated.");
      setEditing(null);
    },
    onError: () => toast.error("Could not update test."),
  });

  const deleteMutation = useMutation({
    mutationFn: async (testId: string) => {
      return $api(`/tests/${testId}`, { method: "DELETE" });
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["tests", programId, semester] });
      toast.success("Test deleted.");
      setDeleting(null);
    },
    onError: () => toast.error("Could not delete test."),
  });

  const rows = testsQuery.data?.status === 200 ? testsQuery.data.data.data : [];
  const visibleRows = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) {
      return rows;
    }
    return rows.filter((row) =>
      [row.name, String(row.maximum_marks), String(row.minimum_passing_marks)]
        .join(" ")
        .toLowerCase()
        .includes(q),
    );
  }, [rows, search]);
  const courseOutcomes =
    courseOutcomesQuery.data?.status === 200
      ? courseOutcomesQuery.data.data.data
      : [];

  const columns = useMemo<ColumnDef<AcademicTest>[]>(() => {
    return [
      { accessorKey: "name", header: "Test Name" },
      { accessorKey: "cie_number", header: "CIE No" },
      { accessorKey: "maximum_marks", header: "Maximum Marks" },
      { accessorKey: "minimum_passing_marks", header: "Minimum Passing" },
      { accessorKey: "total_assigned_marks", header: "Total Assigned" },
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => (
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setEditing(row.original)}
            >
              Edit
            </Button>
            <Button
              size="sm"
              variant="destructive"
              onClick={() => setDeleting(row.original)}
            >
              Delete
            </Button>
          </div>
        ),
      },
    ];
  }, []);

  return (
    <>
      <Header>
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href="/">Home</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href={`/p/${programId}`}>{program?.name ?? "Program"}</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Tests</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </Header>
      <Container>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <InputGroup className="max-w-sm min-w-[200px]">
            <InputGroupAddon>
              <HugeiconsIcon icon={Search01Icon} />
            </InputGroupAddon>
            <InputGroupInput
              placeholder="Search tests..."
              value={search}
              onChange={(e) => void setSearch(e.target.value || null)}
            />
          </InputGroup>
          <Button onClick={() => setCreateOpen(true)}>
            Add <HugeiconsIcon icon={PlusSignIcon} />
          </Button>
        </div>

        {testsQuery.isLoading ? (
          <SpinnerPage />
        ) : (
          <DataTable columns={columns} data={visibleRows} />
        )}
      </Container>

      <TestFormDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        semester={semester}
        courseOutcomes={courseOutcomes}
        onSubmit={async (payload) => {
          await createMutation.mutateAsync(payload);
        }}
        isSubmitting={createMutation.isPending}
      />

      <TestFormDialog
        open={!!editing}
        onOpenChange={(open) => {
          if (!open) {
            setEditing(null);
          }
        }}
        semester={semester}
        initial={editing}
        courseOutcomes={courseOutcomes}
        onSubmit={async (payload) => {
          if (!editing) {
            return;
          }
          await updateMutation.mutateAsync({ testId: editing.id, payload });
        }}
        isSubmitting={updateMutation.isPending}
      />

      <AlertDialog open={!!deleting} onOpenChange={(open) => !open && setDeleting(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete test?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete <strong>{deleting?.name}</strong>.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteMutation.isPending}>
              Cancel
            </AlertDialogCancel>
            <Button
              variant="destructive"
              disabled={deleteMutation.isPending}
              onClick={() => deleting && void deleteMutation.mutateAsync(deleting.id)}
            >
              {deleteMutation.isPending ? "Deleting..." : "Delete"}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
