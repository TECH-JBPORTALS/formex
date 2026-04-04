"use client";

import { PlusSignIcon, Search01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import Link from "next/link";
import { parseAsString, throttle, useQueryState } from "nuqs";
import { useMemo } from "react";
import Container from "@/components/container";
import { DataTable } from "@/components/data-table";
import Header from "@/components/header";
import { getInternshipColumns } from "@/components/internships/columns";
import { CreateInternshipSheet } from "@/components/internships/create-internship-sheet";
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
import { useAuthUser } from "@/lib/api/generated/auth/auth";
import {
  getProgramsIndexQueryKey,
  useProgramsIndex,
} from "@/lib/api/generated/context-program/context-program";
import { useInternshipsIndex } from "@/lib/api/generated/internship/internship";

export function InternshipsPage() {
  const [search, setSearch] = useQueryState(
    "q",
    parseAsString.withDefault("").withOptions({
      limitUrlUpdates: throttle(300),
    }),
  );

  const { data: authData } = useAuthUser();
  const institutionId =
    authData?.status === 200 ? authData.data.current_institution_id : undefined;

  const programsQuery = useProgramsIndex({
    query: {
      queryKey: institutionId
        ? [...getProgramsIndexQueryKey(), institutionId]
        : getProgramsIndexQueryKey(),
      enabled: !!institutionId,
    },
  });

  const programLabelById = useMemo(() => {
    const map = new Map<string, string>();
    if (programsQuery.data?.status === 200) {
      for (const p of programsQuery.data.data.data) {
        map.set(p.id, p.name);
      }
    }
    return map;
  }, [programsQuery.data]);

  const internshipsQuery = useInternshipsIndex();

  const rows =
    internshipsQuery.data?.status === 200
      ? internshipsQuery.data.data.data
      : [];

  const visibleRows = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) {
      return rows;
    }
    return rows.filter((row) => {
      const programName = programLabelById.get(row.program_id) ?? "";
      return [
        row.industry_name,
        row.industry_address,
        row.role,
        programName,
        row.student_id,
        String(row.semester),
        String(row.acad_year),
      ]
        .join(" ")
        .toLowerCase()
        .includes(q);
    });
  }, [rows, search, programLabelById]);

  const columns = useMemo(
    () => getInternshipColumns({ programLabelById }),
    [programLabelById],
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
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Internships</BreadcrumbPage>
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
              placeholder="Search internships…"
              value={search}
              onChange={(e) => void setSearch(e.target.value || null)}
            />
          </InputGroup>
          <CreateInternshipSheet>
            <Button>
              Add <HugeiconsIcon icon={PlusSignIcon} />
            </Button>
          </CreateInternshipSheet>
        </div>

        <DataTable columns={columns} data={visibleRows} />
      </Container>
    </>
  );
}
