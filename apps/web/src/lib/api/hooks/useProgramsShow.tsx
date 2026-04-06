import React from "react";
import { useProgramsShowSuspense } from "../generated/program/program";

export function useProgramsShow(programId: string) {
  const { data: programShow, ...props } = useProgramsShowSuspense(programId);
  const program = programShow?.status == 200 ? programShow.data.data : null;

  return { data: program, ...props };
}
