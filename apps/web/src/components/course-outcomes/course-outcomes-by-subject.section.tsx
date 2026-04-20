"use client";

import { PlusSignIcon, Search01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { parseAsString, throttle, useQueryState } from "nuqs";
import { useMemo } from "react";
import { DataTable } from "@/components/data-table";
import { SpinnerPage } from "@/components/spinner-page";
import { Button } from "@/components/ui/button";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { useCourseOutcomeListByCourse } from "@/lib/api/generated/course-outcome/course-outcome";
import { CreateCourseOutcomeSheet } from "./create-course-outcome-sheet";
import { getCourseOutcomeColumns } from "./columns";

export function CourseOutcomesBySubjectSection({ subjectId }: { subjectId: string }) {
  const [search, setSearch] = useQueryState(
    "q",
    parseAsString.withDefault("").withOptions({ limitUrlUpdates: throttle(300) }),
  );
  const outcomesQuery = useCourseOutcomeListByCourse(subjectId, {
    query: { enabled: !!subjectId },
  });
  const rows = outcomesQuery.data?.status === 200 ? outcomesQuery.data.data.data : [];

  const visibleRows = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) {
      return rows;
    }
    return rows.filter((entry) => {
      return [entry.name ?? "", entry.description ?? "", entry.syllabus_scheme ?? ""]
        .join(" ")
        .toLowerCase()
        .includes(q);
    });
  }, [rows, search]);

  const columns = useMemo(() => getCourseOutcomeColumns(), []);

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <InputGroup className="max-w-sm min-w-[200px]">
          <InputGroupAddon>
            <HugeiconsIcon icon={Search01Icon} />
          </InputGroupAddon>
          <InputGroupInput
            placeholder="Search course outcomes..."
            value={search}
            onChange={(e) => void setSearch(e.target.value || null)}
          />
        </InputGroup>
        <CreateCourseOutcomeSheet subjectId={subjectId}>
          <Button>
            Add <HugeiconsIcon icon={PlusSignIcon} />
          </Button>
        </CreateCourseOutcomeSheet>
      </div>
      {outcomesQuery.isLoading ? (
        <SpinnerPage />
      ) : (
        <DataTable data={visibleRows} columns={columns} />
      )}
    </div>
  );
}
