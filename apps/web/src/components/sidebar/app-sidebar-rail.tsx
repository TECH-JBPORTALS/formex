"use client";

import { useParams } from "next/navigation";
import { Protect } from "@/components/auth/protect";
import { useSession } from "@/lib/api/hooks/useSession";
import { canAccessProgramSidebar } from "@/lib/auth/roles";
import { PrincipalSidebar } from "./principal-sidebar";
import { ProgramSidebar } from "./program-sidebar";
import { ProgramCoordinatorSidebar } from "./program-coordinator-sidebar";
import { StaffSidebar } from "./staff-sidebar";

export function AppSidebarRail() {
  const { programId } = useParams<{ programId: string }>();
  const session = useSession();
  const role = session?.current_institution_role;

  const institutionSidebar =
    role === "principal" ? (
      <PrincipalSidebar />
    ) : role === "program_coordinator" ? (
      <ProgramCoordinatorSidebar />
    ) : (
      <StaffSidebar />
    );

  return (
    <>
      {institutionSidebar}
      <Protect allowedRoles={["principal", "program_coordinator", "course_coordinator"]}>
        {programId && canAccessProgramSidebar(role) ? (
          <ProgramSidebar programId={programId} />
        ) : null}
      </Protect>
    </>
  );
}
