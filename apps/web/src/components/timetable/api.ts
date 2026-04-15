"use client";

import { ensureSanctumCsrf } from "@/lib/api/csrf";
import { $api } from "@/lib/api/mutator";

export type TimetableApiSlotSubject = {
  subject_id: string;
  subject_name: string;
  course_coordinator_id: string;
  course_coordinator_name: string;
  batch: string;
  room_no: string;
};

export type TimetableApiSlot = {
  day: string;
  start_hour_no: number;
  end_hour_no: number;
  subjects: TimetableApiSlotSubject[];
};

export type TimetableApiResponse = {
  data: {
    id?: string;
    semester: number;
    academic_year: number;
    slots: TimetableApiSlot[];
  };
};

type ApiEnvelope<T> = {
  data: T;
  status: number;
};

export async function getProgramTimetable(
  programId: string,
  semester: number,
): Promise<TimetableApiResponse["data"]> {
  const response = await $api<ApiEnvelope<TimetableApiResponse>>(
    `/programs/${programId}/timetable?semester=${semester}`,
  );

  if (response.status !== 200) {
    throw new Error("Could not load timetable.");
  }

  return response.data.data;
}

export type SaveTimetableSlotPayload = {
  semester: number;
  day: string;
  start_hour_no: number;
  end_hour_no: number;
  subjects: Array<{
    subject_id: string;
    course_coordinator_id: string;
    batch: string;
    room_no: string;
  }>;
};

export async function saveProgramTimetableSlot(
  programId: string,
  payload: SaveTimetableSlotPayload,
): Promise<void> {
  await ensureSanctumCsrf();

  const response = await $api<ApiEnvelope<{ message?: string }>>(
    `/programs/${programId}/timetable`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    },
  );

  if (response.status !== 200) {
    const message = response.data?.message ?? "Could not save timetable slot.";
    throw new Error(message);
  }
}

export type PersonalTimetableApiRow = {
  sl_no: number;
  program_name: string;
  semester: number;
  course_name: string;
  no_of_students: number;
  room_no: string;
  day_slots: Record<string, Record<string, boolean>>;
};

export type PersonalTimetableApiResponse = {
  data: {
    academic_year: number;
    days: string[];
    rows: PersonalTimetableApiRow[];
  };
};

export async function getPersonalTimetable(): Promise<
  PersonalTimetableApiResponse["data"]
> {
  const response = await $api<ApiEnvelope<PersonalTimetableApiResponse>>(
    "/timetable/personal",
  );

  if (response.status !== 200) {
    throw new Error("Could not load personal timetable.");
  }

  return response.data.data;
}
