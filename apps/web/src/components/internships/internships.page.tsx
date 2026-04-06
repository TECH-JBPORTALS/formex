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
import { useInternshipsList } from "@/lib/api/hooks/useInternshipsList";
import { SpinnerPage } from "../spinner-page";

export function InternshipsPage() {
  const [search, setSearch] = useQueryState(
    "q",
    parseAsString.withDefault("").withOptions({
      limitUrlUpdates: throttle(300),
    }),
  );

  const { internships, internshipsQuery } = useInternshipsList();

  const rows = internships ?? [];

  const visibleRows = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) {
      return rows;
    }

    return rows.filter((row) => {
      const haystack = [
        row.industry_name,
        row.role,
        row.student?.full_name ?? "",
        row.student?.register_no ?? "",
        row.program?.short_name ?? "",
      ]
        .join(" ")
        .toLowerCase();

      return haystack.includes(q);
    });
  }, [rows, search]);

  const columns = useMemo(() => getInternshipColumns(), []);

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

      <Container>
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

        {internshipsQuery.isLoading ? (
          <SpinnerPage />
        ) : (
          <DataTable columns={columns} data={visibleRows} />
        )}
      </Container>
    </>
  );
}
