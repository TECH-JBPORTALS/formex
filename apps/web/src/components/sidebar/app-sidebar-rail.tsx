"use client";

import { useParams } from "next/navigation";
import { PrincipalSidebar } from "./principal-sidebar";
import { ProgramSidebar } from "./program-sidebar";

export function AppSidebarRail() {
  const { programId } = useParams<{ programId: string }>();

  return (
    <>
      <PrincipalSidebar />
      {programId ? <ProgramSidebar programId={programId} /> : null}
    </>
  );
}
