"use client";

import { Search01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import type { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import Link from "next/link";
import { parseAsString, throttle, useQueryState } from "nuqs";
import { useMemo, useState } from "react";
import { CreateBridgeSheet } from "@/components/bridges/create-bridge-sheet";
import { DeleteBridgeDialog } from "@/components/bridges/delete-bridge-dialog";
import { EditBridgeSheet } from "@/components/bridges/edit-bridge-sheet";
import Container from "@/components/container";
import { DataTable } from "@/components/data-table";
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
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { useBridgreListBySubject } from "@/lib/api/generated/bridgre/bridgre";
import type { Bridge } from "@/lib/api/generated/models";
import { useSubjectsShow } from "@/lib/api/generated/subject/subject";
import { useProgramsShow } from "@/lib/api/hooks/useProgramsShow";

type BridgesBySubjectPageProps = {
  programId: string;
  subjectId: string;
};

export function BridgesBySubjectPage({
  programId,
  subjectId,
}: BridgesBySubjectPageProps) {
  const [selectedBridge, setSelectedBridge] = useState<Bridge | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const [search, setSearch] = useQueryState(
    "q",
    parseAsString.withDefault("").withOptions({
      limitUrlUpdates: throttle(300),
    }),
  );

  const { data: program } = useProgramsShow(programId);
  const subjectQuery = useSubjectsShow(subjectId, {
    query: { enabled: !!subjectId },
  });
  const subject =
    subjectQuery.data?.status === 200 ? subjectQuery.data.data.data : null;

  const bridgesQuery = useBridgreListBySubject(subjectId, {
    query: { enabled: !!subjectId },
  });

  const listResponse = bridgesQuery.data;
  const listLoaded = !!listResponse && !bridgesQuery.isLoading;
  const listFailed = listLoaded && listResponse.status !== 200;
  const rows =
    listResponse?.status === 200 ? listResponse.data.data : [];

  const columns = useMemo<ColumnDef<Bridge>[]>(
    () => [
      {
        accessorKey: "curriculum_gap",
        header: "Curriculum Gap",
      },
      {
        accessorKey: "resource_person_name",
        header: "Resource Person",
      },
      {
        accessorKey: "company_name",
        header: "Company",
      },
      {
        accessorKey: "venue",
        header: "Venue",
      },
      {
        accessorKey: "conducted_date",
        header: "Conducted Date",
        cell: ({ row }) => {
          const raw = row.original.conducted_date;
          if (!raw) {
            return "—";
          }

          const date = new Date(raw);
          if (Number.isNaN(date.getTime())) {
            return raw;
          }

          return format(date, "dd MMM yyyy");
        },
      },
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSelectedBridge(row.original);
                setEditOpen(true);
              }}
            >
              Edit
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => {
                setSelectedBridge(row.original);
                setDeleteOpen(true);
              }}
            >
              Delete
            </Button>
          </div>
        ),
      },
    ],
    [],
  );

  const visibleRows = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) {
      return rows;
    }

    return rows.filter((row) => {
      const haystack = [
        row.curriculum_gap,
        row.resource_person_name,
        row.company_name,
        row.designation,
        row.venue,
      ]
        .join(" ")
        .toLowerCase();

      return haystack.includes(q);
    });
  }, [rows, search]);

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
                <Link href={`/p/${programId}`}>
                  {program?.name ?? "Program"}
                </Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href={`/p/${programId}/subjects`}>Subjects</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>
                {subject?.name ?? "Bridge Sessions"}
              </BreadcrumbPage>
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
              placeholder="Search bridge sessions..."
              value={search}
              onChange={(e) => void setSearch(e.target.value || null)}
            />
          </InputGroup>
          <CreateBridgeSheet subjectId={subjectId}>
            <Button type="button">Add bridge</Button>
          </CreateBridgeSheet>
        </div>

        {bridgesQuery.isLoading ? (
          <SpinnerPage />
        ) : listFailed ? (
          <p className="text-muted-foreground text-sm">
            Could not load bridge sessions for this subject.
          </p>
        ) : (
          <DataTable columns={columns} data={visibleRows} />
        )}

        {selectedBridge ? (
          <>
            <EditBridgeSheet
              bridge={selectedBridge}
              open={editOpen}
              onOpenChange={setEditOpen}
            />
            <DeleteBridgeDialog
              bridge={selectedBridge}
              open={deleteOpen}
              onOpenChange={setDeleteOpen}
            />
          </>
        ) : null}
      </Container>
    </>
  );
}
