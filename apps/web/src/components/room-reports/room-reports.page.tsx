"use client";

import { PlusSignIcon, Search01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { parseAsString, throttle, useQueryState } from "nuqs";
import { useMemo } from "react";
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
import { useProgramsShow } from "@/lib/api/hooks/useProgramsShow";
import { useRoomReportListByProgram } from "@/lib/api/generated/room-report/room-report";
import { CreateRoomReportSheet } from "./create-room-report-sheet";
import { getRoomReportColumns } from "./columns";

function clampSemester(value: string | null): number {
  const n = Number(value);
  if (!Number.isFinite(n)) return 1;
  return Math.min(6, Math.max(1, n));
}

export function RoomReportsPage() {
  const { programId } = useParams<{ programId: string }>();
  const searchParams = useSearchParams();
  const selectedSemester = clampSemester(searchParams.get("semester"));
  const [search, setSearch] = useQueryState(
    "q",
    parseAsString.withDefault("").withOptions({
      limitUrlUpdates: throttle(300),
    }),
  );
  const roomReportsQuery = useRoomReportListByProgram(programId, {
    query: { enabled: !!programId },
  });
  const { data: programShow } = useProgramsShow(programId);

  const rows =
    roomReportsQuery.data?.status === 200 ? roomReportsQuery.data.data.data : [];

  const visibleRows = useMemo(() => {
    const q = search.trim().toLowerCase();
    const bySemester = rows.filter((row) => row.semester === selectedSemester);

    if (!q) {
      return bySemester;
    }

    return bySemester.filter((row) =>
      [
        row.room_number,
        row.topic_planned,
        row.topic_taught,
        row.learning_outcome,
        row.valuation,
        row.principal_remarks,
      ]
        .join(" ")
        .toLowerCase()
        .includes(q),
    );
  }, [rows, search, selectedSemester]);

  const columns = useMemo(
    () =>
      getRoomReportColumns({
        programId,
        semester: selectedSemester,
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
              <BreadcrumbPage>Room Reports</BreadcrumbPage>
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
              placeholder="Search room reports..."
              value={search}
              onChange={(event) => void setSearch(event.target.value || null)}
            />
          </InputGroup>
          <CreateRoomReportSheet
            programId={programId}
            semester={selectedSemester}
          >
            <Button>
              Add <HugeiconsIcon icon={PlusSignIcon} />
            </Button>
          </CreateRoomReportSheet>
        </div>

        {roomReportsQuery.isLoading ? (
          <SpinnerPage />
        ) : (
          <DataTable columns={columns} data={visibleRows} />
        )}
      </Container>
    </>
  );
}
