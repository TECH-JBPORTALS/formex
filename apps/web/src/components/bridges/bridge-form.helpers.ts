"use client";

import type { Bridge, BridgreStoreBody, BridgesUpdateBody } from "@/lib/api/generated/models";

function toDateTimeLocalInputValue(value?: string | null): string {
  if (!value) {
    return "";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const pad = (n: number) => String(n).padStart(2, "0");
  const year = date.getFullYear();
  const month = pad(date.getMonth() + 1);
  const day = pad(date.getDate());
  const hours = pad(date.getHours());
  const minutes = pad(date.getMinutes());

  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

export function isoFromDateTimeLocal(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return new Date().toISOString();
  }
  return date.toISOString();
}

export function bridgeCreateDefaults(): BridgreStoreBody {
  return {
    curriculum_gap: "",
    details: "",
    conducted_date: new Date().toISOString(),
    venue: "",
    resource_person_name: "",
    company_name: "",
    designation: "",
    students_present: 0,
    relevance: "",
    course_coordinator_id: "",
  };
}

export function bridgeUpdateDefaults(bridge: Bridge): BridgesUpdateBody {
  return {
    curriculum_gap: bridge.curriculum_gap ?? "",
    details: bridge.details ?? "",
    conducted_date: bridge.conducted_date
      ? new Date(bridge.conducted_date).toISOString()
      : new Date().toISOString(),
    venue: bridge.venue ?? "",
    resource_person_name: bridge.resource_person_name ?? "",
    company_name: bridge.company_name ?? "",
    designation: bridge.designation ?? "",
    students_present: Number(bridge.students_present ?? 0),
    relevance: bridge.relevance ?? "",
    academic_year: Number(bridge.academic_year ?? new Date().getFullYear()),
    course_coordinator_id: bridge.course_coordinator_id ?? "",
  };
}

export { toDateTimeLocalInputValue };
