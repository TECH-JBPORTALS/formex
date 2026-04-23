"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import Container from "@/components/container";
import Header from "@/components/header";
import { SpinnerPage } from "@/components/spinner-page";
import { Button } from "@/components/ui/button";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useAuthUser } from "@/lib/api/generated/auth/auth";
import { useProgramsShow } from "@/lib/api/hooks/useProgramsShow";
import { $api } from "@/lib/api/mutator";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

type SuccessIndexRow = {
  academic_year: number;
  admitted_count: number;
  passed_without_backlog_count: number;
  success_index: number;
};

type ProgramSuccessIndexResponse = {
  data: {
    data: {
      program_id: string;
      lyg: SuccessIndexRow;
      lyg_m1: SuccessIndexRow;
      lyg_m2: SuccessIndexRow;
      average_success_index: number;
    };
  };
  status: number;
  headers: Headers;
};

type SuccessIndexYearRow = {
  academic_year: number;
  admitted_count: number;
  passed_without_backlog_count: number;
  backlog_count: number;
};

type ProgramSuccessIndexRowsResponse = {
  data: {
    data: SuccessIndexYearRow[];
  };
  status: number;
  headers: Headers;
};

function toCount(raw: string): number {
  const next = Number(raw);
  if (!Number.isFinite(next) || next < 0) {
    return 0;
  }
  return Math.floor(next);
}

export function ProgramSuccessIndexDataPage() {
  const queryClient = useQueryClient();
  const { programId } = useParams<{ programId: string }>();
  const { data: auth } = useAuthUser();
  const { data: program } = useProgramsShow(programId);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingYear, setEditingYear] = useState<number | null>(null);
  const [yearInput, setYearInput] = useState("");
  const [admittedInput, setAdmittedInput] = useState("");
  const [passedInput, setPassedInput] = useState("");

  const currentAcademicYear =
    auth?.status === 200 && auth.data.current_academic_year != null
      ? auth.data.current_academic_year
      : new Date().getFullYear();

  const successIndexQ = useQuery({
    queryKey: ["program-success-index", programId, currentAcademicYear],
    queryFn: async () => {
      return $api<ProgramSuccessIndexResponse>(
        `/programs/${programId}/success-index?academic_year=${currentAcademicYear}`,
      );
    },
    enabled: !!programId,
  });
  const rowsQ = useQuery({
    queryKey: ["program-success-index-rows", programId],
    queryFn: async () => {
      return $api<ProgramSuccessIndexRowsResponse>(
        `/programs/${programId}/success-index-rows`,
      );
    },
    enabled: !!programId,
  });

  const payload =
    successIndexQ.data?.status === 200 ? successIndexQ.data.data.data : null;
  const rows =
    rowsQ.data?.status === 200 ? rowsQ.data.data.data : [];

  const saveMutation = useMutation({
    mutationFn: async () => {
      const academicYear = Number(yearInput);
      const admittedCount = toCount(admittedInput);
      const passedCount = toCount(passedInput);

      return $api<ProgramSuccessIndexResponse>(`/programs/${programId}/success-index`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rows: [
            {
              academic_year: academicYear,
              admitted_count: admittedCount,
              passed_without_backlog_count: passedCount,
            },
          ],
        }),
      });
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["program-success-index-rows", programId],
      });
      await queryClient.invalidateQueries({
        queryKey: ["program-success-index", programId, currentAcademicYear],
      });
      toast.success(
        editingYear == null
          ? "Academic year data added"
          : "Academic year data updated",
      );
      setIsDialogOpen(false);
      setEditingYear(null);
    },
    onError: () => {
      toast.error("Could not save success index data");
    },
  });

  const dialogErrors = useMemo(() => {
    const academicYear = Number(yearInput);
    const admittedCount = toCount(admittedInput);
    const passedCount = toCount(passedInput);
    const errors: string[] = [];
    if (!Number.isInteger(academicYear) || academicYear < 1900 || academicYear > 9999) {
      errors.push("Academic year must be between 1900 and 9999.");
    }
    if (passedCount > admittedCount) {
      errors.push("Passed out count cannot be greater than admitted count.");
    }
    return errors;
  }, [admittedInput, passedInput, yearInput]);

  const openAddDialog = () => {
    setEditingYear(null);
    setYearInput(String(currentAcademicYear));
    setAdmittedInput("0");
    setPassedInput("0");
    setIsDialogOpen(true);
  };

  const openEditDialog = (row: SuccessIndexYearRow) => {
    setEditingYear(row.academic_year);
    setYearInput(String(row.academic_year));
    setAdmittedInput(String(row.admitted_count));
    setPassedInput(String(row.passed_without_backlog_count));
    setIsDialogOpen(true);
  };

  if (successIndexQ.isLoading || rowsQ.isLoading) {
    return <SpinnerPage />;
  }

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
              <BreadcrumbPage>Success Index Data</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </Header>

      <Container>
        <div className="space-y-6">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm text-muted-foreground">
              Manage inserted academic year values for this program.
            </p>
            <Button onClick={openAddDialog}>
              Add Academic Year Data
            </Button>
          </div>

          <div className="overflow-hidden rounded-md border">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="bg-muted/50">
                  <th className="border p-3 text-left font-semibold">
                    Academic Year
                  </th>
                  <th className="border p-3 text-center font-semibold">
                    Total students including lateral entry
                  </th>
                  <th className="border p-3 text-center font-semibold">
                    Total students passed out
                  </th>
                  <th className="border p-3 text-center font-semibold">
                    Total students with backlog (calculated)
                  </th>
                  <th className="border p-3 text-center font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {rows.length === 0 ? (
                  <tr>
                    <td
                      className="border p-3 text-center text-muted-foreground"
                      colSpan={5}
                    >
                      No data added yet.
                    </td>
                  </tr>
                ) : (
                  rows.map((row) => (
                    <tr key={row.academic_year}>
                      <td className="border p-3">{row.academic_year}</td>
                      <td className="border p-3 text-center">{row.admitted_count}</td>
                      <td className="border p-3 text-center">
                        {row.passed_without_backlog_count}
                      </td>
                      <td className="border p-3 text-center">{row.backlog_count}</td>
                      <td className="border p-3 text-center">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openEditDialog(row)}
                        >
                          Edit
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="space-y-2 text-sm">
            <p>
              Home page format uses the current academic year and the previous two
              years (LYG, LYG m1, LYG m2) from this inserted data.
            </p>
            {payload ? (
              <p className="text-muted-foreground">
                Current year preview: {payload.lyg.academic_year} /{" "}
                {payload.lyg.admitted_count} admitted /{" "}
                {payload.lyg.passed_without_backlog_count} passed.
              </p>
            ) : null}
          </div>
        </div>
      </Container>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingYear == null ? "Add academic year data" : "Edit academic year data"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium" htmlFor="success-index-year">
                Academic year
              </label>
              <Input
                id="success-index-year"
                type="number"
                min={1900}
                max={9999}
                value={yearInput}
                onChange={(e) => setYearInput(e.target.value)}
                disabled={saveMutation.isPending}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium" htmlFor="success-index-admitted">
                Total students including lateral entry
              </label>
              <Input
                id="success-index-admitted"
                type="number"
                min={0}
                value={admittedInput}
                onChange={(e) => setAdmittedInput(e.target.value)}
                disabled={saveMutation.isPending}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium" htmlFor="success-index-passed">
                Total students passed out
              </label>
              <Input
                id="success-index-passed"
                type="number"
                min={0}
                value={passedInput}
                onChange={(e) => setPassedInput(e.target.value)}
                disabled={saveMutation.isPending}
              />
            </div>
            {dialogErrors.length > 0 ? (
              <div className="space-y-1">
                {dialogErrors.map((error) => (
                  <p key={error} className="text-sm text-destructive">
                    {error}
                  </p>
                ))}
              </div>
            ) : null}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDialogOpen(false)}
              disabled={saveMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              onClick={() => void saveMutation.mutateAsync()}
              disabled={dialogErrors.length > 0 || saveMutation.isPending}
            >
              {saveMutation.isPending ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
