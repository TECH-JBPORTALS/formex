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

type PlacementIndexRow = {
  academic_year: number;
  total_students_count: number;
  placed_count: number;
  higher_studies_count: number;
  entrepreneur_count: number;
  weighted_total: number;
  placement_index: number;
};

type ProgramPlacementIndexResponse = {
  data: {
    data: {
      program_id: string;
      lyg: PlacementIndexRow;
      lyg_m1: PlacementIndexRow;
      lyg_m2: PlacementIndexRow;
      average_placement_index: number;
    };
  };
  status: number;
  headers: Headers;
};

function formatIndex(value: number): string {
  return Number.isFinite(value) ? value.toFixed(2) : "0.00";
}

export function ProgramPlacementIndexPage() {
  const { programId } = useParams<{ programId: string }>();
  const { data: auth } = useAuthUser();
  const { data: program } = useProgramsShow(programId);

  const currentAcademicYear =
    auth?.status === 200 && auth.data.current_academic_year != null
      ? auth.data.current_academic_year
      : new Date().getFullYear();

  const placementIndexQ = useQuery({
    queryKey: ["program-placement-index", programId, currentAcademicYear],
    queryFn: async () => {
      return $api<ProgramPlacementIndexResponse>(
        `/programs/${programId}/placement-index?academic_year=${currentAcademicYear}`,
      );
    },
    enabled: !!programId,
  });

  const payload =
    placementIndexQ.data?.status === 200 ? placementIndexQ.data.data.data : null;

  const rowPI = (key: "lyg" | "lyg_m1" | "lyg_m2") => {
    const row = payload?.[key];
    if (!row || row.total_students_count <= 0) {
      return 0;
    }
    return ((1.25 * row.placed_count) + row.higher_studies_count + row.entrepreneur_count) / row.total_students_count;
  };

  const averagePlacementIndex = (rowPI("lyg") + rowPI("lyg_m1") + rowPI("lyg_m2")) / 3;

  if (placementIndexQ.isLoading) {
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
              Showing placement index for academic year {currentAcademicYear}.
            </p>
            <Button asChild>
              <Link href={`/p/${programId}/placement-index`}>
                Manage Placement Index Data
              </Link>
            </Button>
          </div>

          <div className="overflow-hidden rounded-md border">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="bg-muted/50">
                  <th className="border p-3 text-left font-semibold">Item</th>
                  <th className="border p-3 text-center font-semibold">LYG</th>
                  <th className="border p-3 text-center font-semibold">LYGm1</th>
                  <th className="border p-3 text-center font-semibold">LYGm2</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border p-3">Total No. of Final Year Students (N)</td>
                  <td className="border p-3 text-center">{payload?.lyg.total_students_count ?? 0}</td>
                  <td className="border p-3 text-center">{payload?.lyg_m1.total_students_count ?? 0}</td>
                  <td className="border p-3 text-center">{payload?.lyg_m2.total_students_count ?? 0}</td>
                </tr>
                <tr>
                  <td className="border p-3">No. of students placed in companies or Government Sector (X)</td>
                  <td className="border p-3 text-center">{payload?.lyg.placed_count ?? 0}</td>
                  <td className="border p-3 text-center">{payload?.lyg_m1.placed_count ?? 0}</td>
                  <td className="border p-3 text-center">{payload?.lyg_m2.placed_count ?? 0}</td>
                </tr>
                <tr>
                  <td className="border p-3">No. of students admitted to higher studies (Y)</td>
                  <td className="border p-3 text-center">{payload?.lyg.higher_studies_count ?? 0}</td>
                  <td className="border p-3 text-center">{payload?.lyg_m1.higher_studies_count ?? 0}</td>
                  <td className="border p-3 text-center">{payload?.lyg_m2.higher_studies_count ?? 0}</td>
                </tr>
                <tr>
                  <td className="border p-3">No. of students turned entrepreneur in the respective field of engineering/technology (Z)</td>
                  <td className="border p-3 text-center">{payload?.lyg.entrepreneur_count ?? 0}</td>
                  <td className="border p-3 text-center">{payload?.lyg_m1.entrepreneur_count ?? 0}</td>
                  <td className="border p-3 text-center">{payload?.lyg_m2.entrepreneur_count ?? 0}</td>
                </tr>
                <tr>
                  <td className="border p-3 text-center font-semibold">1.25X + Y + Z</td>
                  <td className="border p-3 text-center">{formatIndex(payload?.lyg.weighted_total ?? 0)}</td>
                  <td className="border p-3 text-center">{formatIndex(payload?.lyg_m1.weighted_total ?? 0)}</td>
                  <td className="border p-3 text-center">{formatIndex(payload?.lyg_m2.weighted_total ?? 0)}</td>
                </tr>
                <tr>
                  <td className="border p-3 font-semibold">Placement Index (P) : (1.25X + Y + Z) / N</td>
                  <td className="border p-3 text-center">{formatIndex(rowPI("lyg"))}</td>
                  <td className="border p-3 text-center">{formatIndex(rowPI("lyg_m1"))}</td>
                  <td className="border p-3 text-center">{formatIndex(rowPI("lyg_m2"))}</td>
                </tr>
                <tr>
                  <td className="border p-3 font-semibold">Average placement = (P1 + P2 + P3) / 3</td>
                  <td className="border p-3 text-center font-semibold" colSpan={3}>
                    {formatIndex(averagePlacementIndex)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </Container>
    </>
  );
}
