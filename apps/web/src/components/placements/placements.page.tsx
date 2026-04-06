"use client";

import { Button } from "../ui/button";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "../ui/input-group";
import Header from "../header";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "../ui/breadcrumb";
import { HugeiconsIcon } from "@hugeicons/react";
import { PlusSignIcon, Search01Icon } from "@hugeicons/core-free-icons";
import { parseAsString, throttle, useQueryState } from "nuqs";
import { useMemo } from "react";
import Container from "../container";
import Link from "next/link";
import { DataTable } from "../data-table";
import { getPlacementColumns } from "./columns";
import { CreatePlacementSheet } from "./create-placement-sheet";
import { usePlacementsList } from "@/lib/api/hooks/usePlacementsList";
import { SpinnerPage } from "../spinner-page";

export function PlacementsPage() {
  const { placements, placementsQuery } = usePlacementsList();
  const [search, setSearch] = useQueryState(
    "q",
    parseAsString.withDefault("").withOptions({
      limitUrlUpdates: throttle(300),
    }),
  );

  const rows = placements ?? [];

  const columns = useMemo(() => getPlacementColumns(), []);

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
              <BreadcrumbPage>Placements</BreadcrumbPage>
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
              placeholder="Search placements..."
              value={search}
              onChange={(e) => setSearch(e.target.value || null)}
            />
          </InputGroup>
          <CreatePlacementSheet>
            <Button>
              Add <HugeiconsIcon icon={PlusSignIcon} />
            </Button>
          </CreatePlacementSheet>
        </div>

        {placementsQuery.isLoading ? (
          <SpinnerPage />
        ) : (
          <DataTable data={rows} columns={columns} />
        )}
      </Container>
    </>
  );
}
