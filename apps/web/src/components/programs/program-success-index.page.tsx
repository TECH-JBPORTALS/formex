"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
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
import { useAuthUser } from "@/lib/api/generated/auth/auth";
import { useProgramsShow } from "@/lib/api/hooks/useProgramsShow";
import { $api } from "@/lib/api/mutator";
import { useQuery } from "@tanstack/react-query";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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

function formatIndex(value: number): string {
  return Number.isFinite(value) ? value.toFixed(2) : "0.00";
}

export function ProgramSuccessIndexPage() {
  const { programId } = useParams<{ programId: string }>();
  const { data: auth } = useAuthUser();
  const { data: program } = useProgramsShow(programId);

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

  const payload =
    successIndexQ.data?.status === 200 ? successIndexQ.data.data.data : null;

  const withoutBacklogCount = (key: "lyg" | "lyg_m1" | "lyg_m2") => {
    const row = payload?.[key];
    if (!row) {
      return 0;
    }
    const backlogCount = Math.max(
      0,
      row.admitted_count - row.passed_without_backlog_count,
    );
    return Math.max(0, row.admitted_count - backlogCount);
  };

  const rowSi = (key: "lyg" | "lyg_m1" | "lyg_m2") => {
    const row = payload?.[key];
    if (!row) {
      return 0;
    }
    if (row.admitted_count <= 0) {
      return 0;
    }
    return row.passed_without_backlog_count / row.admitted_count;
  };

  const averageSuccessIndex =
    (rowSi("lyg") + rowSi("lyg_m1") + rowSi("lyg_m2")) / 3;

  const withBacklogCount = (key: "lyg" | "lyg_m1" | "lyg_m2") => {
    const row = payload?.[key];
    if (!row) {
      return 0;
    }
    return Math.max(0, row.admitted_count - row.passed_without_backlog_count);
  };

  const rowSiWithBacklogs = (key: "lyg" | "lyg_m1" | "lyg_m2") => {
    const row = payload?.[key];
    if (!row || row.admitted_count <= 0) {
      return 0;
    }
    return withBacklogCount(key) / row.admitted_count;
  };

  const averageSuccessIndexWithBacklogs =
    (rowSiWithBacklogs("lyg") +
      rowSiWithBacklogs("lyg_m1") +
      rowSiWithBacklogs("lyg_m2")) /
    3;

  if (successIndexQ.isLoading) {
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
              <BreadcrumbPage>{program?.name ?? "Program"}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </Header>

      <Container>
        <div className="space-y-6">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm text-muted-foreground">
              Showing success index for academic year {currentAcademicYear}.
            </p>
            <Button asChild>
              <Link href={`/p/${programId}/success-index-data`}>
                Manage Success Index Data
              </Link>
            </Button>
          </div>

          <div className="overflow-hidden rounded-md border">
            <Tabs defaultValue="compact" className="p-4">
              <TabsList>
                <TabsTrigger value="compact">Without Backlogs</TabsTrigger>
                <TabsTrigger value="ins12">With Backlogs</TabsTrigger>
              </TabsList>

              <TabsContent value="compact" className="mt-4">
                <table className="w-full border-collapse text-sm">
                  <thead>
                    <tr className="bg-muted/50">
                      <th className="border p-3 text-left font-semibold">
                        Item
                      </th>
                      <th className="border p-3 text-center font-semibold">
                        LYG
                      </th>
                      <th className="border p-3 text-center font-semibold">
                        LYG m1
                      </th>
                      <th className="border p-3 text-center font-semibold">
                        LYG m2
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="border p-3">
                        Total number of students admitted to the program
                        including lateral entry students
                      </td>
                      <td className="border p-3 text-center">
                        {payload?.lyg.admitted_count ?? 0}
                      </td>
                      <td className="border p-3 text-center">
                        {payload?.lyg_m1.admitted_count ?? 0}
                      </td>
                      <td className="border p-3 text-center">
                        {payload?.lyg_m2.admitted_count ?? 0}
                      </td>
                    </tr>
                    <tr>
                      <td className="border p-3">
                        Number of students who have passed without backlogs in
                        the stipulated period of 3 years
                      </td>
                      <td className="border p-3 text-center">
                        {withoutBacklogCount("lyg")}
                      </td>
                      <td className="border p-3 text-center">
                        {withoutBacklogCount("lyg_m1")}
                      </td>
                      <td className="border p-3 text-center">
                        {withoutBacklogCount("lyg_m2")}
                      </td>
                    </tr>
                    <tr>
                      <td className="border p-3 font-semibold">
                        Success index (SI)
                      </td>
                      <td className="border p-3 text-center">
                        {formatIndex(rowSi("lyg"))}
                      </td>
                      <td className="border p-3 text-center">
                        {formatIndex(rowSi("lyg_m1"))}
                      </td>
                      <td className="border p-3 text-center">
                        {formatIndex(rowSi("lyg_m2"))}
                      </td>
                    </tr>
                    <tr>
                      <td className="border p-3 font-semibold">
                        Average Success index (SI)
                      </td>
                      <td
                        className="border p-3 text-center font-semibold"
                        colSpan={3}
                      >
                        {formatIndex(averageSuccessIndex)}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </TabsContent>

              <TabsContent value="ins12" className="mt-4">
                <div className="space-y-4 text-sm">
                  <table className="w-full border-collapse text-sm">
                    <thead>
                      <tr className="bg-muted/50">
                        <th className="border p-3 text-left font-semibold">
                          Item
                        </th>
                        <th className="border p-3 text-center font-semibold">
                          LYG
                        </th>
                        <th className="border p-3 text-center font-semibold">
                          LYGm1
                        </th>
                        <th className="border p-3 text-center font-semibold">
                          LYGm2
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="border p-3">
                          Total number of students admitted to the program
                          including lateral entry students
                        </td>
                        <td className="border p-3 text-center">
                          {payload?.lyg.admitted_count ?? 0}
                        </td>
                        <td className="border p-3 text-center">
                          {payload?.lyg_m1.admitted_count ?? 0}
                        </td>
                        <td className="border p-3 text-center">
                          {payload?.lyg_m2.admitted_count ?? 0}
                        </td>
                      </tr>
                      <tr>
                        <td className="border p-3">
                          Number of students who have passed with backlogs in
                          the stipulated period of 3 years
                        </td>
                        <td className="border p-3 text-center">
                          {withBacklogCount("lyg")}
                        </td>
                        <td className="border p-3 text-center">
                          {withBacklogCount("lyg_m1")}
                        </td>
                        <td className="border p-3 text-center">
                          {withBacklogCount("lyg_m2")}
                        </td>
                      </tr>
                      <tr>
                        <td className="border p-3 font-semibold">
                          Success index (SI)
                        </td>
                        <td className="border p-3 text-center">
                          {formatIndex(rowSiWithBacklogs("lyg"))}
                        </td>
                        <td className="border p-3 text-center">
                          {formatIndex(rowSiWithBacklogs("lyg_m1"))}
                        </td>
                        <td className="border p-3 text-center">
                          {formatIndex(rowSiWithBacklogs("lyg_m2"))}
                        </td>
                      </tr>
                      <tr>
                        <td className="border p-3 font-semibold">
                          Average Success index (SI)
                        </td>
                        <td
                          className="border p-3 text-center font-semibold"
                          colSpan={3}
                        >
                          {formatIndex(averageSuccessIndexWithBacklogs)}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </TabsContent>
            </Tabs>
          </div>

          <div className="space-y-2 text-sm">
            <p>
              SI = (Number of students who have passed from the program without
              backlog) / (Number of students admitted in the first year of that
              batch plus actually admitted in 2nd year via lateral entry)
            </p>
            <p>LYG - Latest year graduation batch</p>
            <p>LYG m1 - Latest year graduation batch minus 1</p>
            <p>LYG m2 - Latest year graduation batch minus 2</p>
          </div>
        </div>
      </Container>
    </>
  );
}
