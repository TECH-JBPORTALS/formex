"use client";

import { PlusSignIcon, Search01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import Container from "@/components/container";
import { DataTable } from "@/components/data-table";
import Header from "@/components/header";
import { CreateStudentSheet } from "@/components/students/create-student-sheet";
import { getStudentColumns } from "@/components/students/columns";
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
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { useProgramsShow } from "@/lib/api/hooks/useProgramsShow";
import { useProgramsStudentsIndex } from "@/lib/api/generated/student/student";

function clampSemester(value: string | null): number {
  const n = Number(value);
  if (!Number.isFinite(n)) return 1;
  return Math.min(6, Math.max(1, n));
}

export function StudentsPage() {
  const { programId } = useParams<{ programId: string }>();
  const searchParams = useSearchParams();
  const selectedSemester = clampSemester(searchParams.get("semester"));
  const currentYear = new Date().getFullYear();

  const studentsQuery = useProgramsStudentsIndex(programId, {
    query: { enabled: !!programId },
  });

  const allStudents =
    studentsQuery.data?.status == 200 ? studentsQuery.data.data.data : [];

  const [search, setSearch] = useState("");
  const visibleStudents = useMemo(() => {
    const q = search.trim().toLowerCase();
    return allStudents
      .filter((s) => s.semester === selectedSemester)
      .filter((s) => {
        if (!q) return true;
        return [s.full_name, s.register_no, s.email]
          .filter(Boolean)
          .some((v) => (v ?? "").toLowerCase().includes(q));
      });
  }, [allStudents, search, selectedSemester]);

  const { data: programShow } = useProgramsShow(programId);

  const columns = useMemo(
    () =>
      getStudentColumns({
        programId,
        listSemester: selectedSemester,
      }),
    [programId, selectedSemester],
  );

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
            {programId ? (
              <>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbLink asChild>
                    <Link href={`/p/${programId}`}>{programShow?.name}</Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
              </>
            ) : null}
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Students</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </Header>

      <Container className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <InputGroup className="max-w-sm min-w-[200px]">
            <InputGroupAddon>
              <HugeiconsIcon icon={Search01Icon} />
            </InputGroupAddon>
            <InputGroupInput
              placeholder="Search students…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </InputGroup>
          {programId ? (
            <CreateStudentSheet
              programId={programId}
              semester={selectedSemester}
              academicYearDefault={currentYear}
            >
              <Button>
                Add <HugeiconsIcon icon={PlusSignIcon} />
              </Button>
            </CreateStudentSheet>
          ) : null}
        </div>

        {}
        <DataTable columns={columns} data={visibleStudents} />
      </Container>
    </>
  );
}
