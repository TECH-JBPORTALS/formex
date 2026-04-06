"use client";

import React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { useSession } from "@/lib/api/hooks/useSession";
import { useAcademicYearSwitch } from "../providers/academic-year-switch-provider";

function academicYearMenuRange(selected: number | null | undefined): number[] {
  const y = new Date().getFullYear();
  const s = selected ?? y;
  const lo = Math.min(s, y - 2);
  const hi = Math.max(s, y + 1);
  const out: number[] = [];
  for (let n = lo; n <= hi; n++) {
    out.push(n);
  }
  return out;
}

export function AcademicYearSelect() {
  const session = useSession();
  const { setAcademicYear } = useAcademicYearSwitch();

  const selectedAcademicYear =
    session?.current_academic_year ?? new Date().getFullYear();

  return (
    <Select
      value={String(selectedAcademicYear)}
      onValueChange={(value) => setAcademicYear(Number(value))}
    >
      <SelectTrigger size="sm" className="w-full">
        <SelectValue placeholder="Academic Year" />
      </SelectTrigger>
      <SelectContent>
        {academicYearMenuRange(selectedAcademicYear).map((acadyear) => {
          return (
            <SelectItem key={acadyear} value={String(acadyear)}>
              Academic Year - {acadyear}
            </SelectItem>
          );
        })}
      </SelectContent>
    </Select>
  );
}
