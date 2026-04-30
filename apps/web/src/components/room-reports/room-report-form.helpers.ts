"use client";

import type { RoomReport } from "@/lib/api/generated/models";

export type RoomReportFormValues = {
  program_id: string;
  subject_id: string;
  room_number: string;
  semester: string;
  strength: string;
  present: string;
  attendance_register: "maintained" | "not_maintained";
  topic_planned: string;
  topic_taught: string;
  pedagogy_used: string;
  aids_used: string;
  teaching_skill: "satisfactory" | "good";
  interaction: "satisfactory" | "good";
  learning_outcome: "achieved" | "not_achieved";
  valuation: "done" | "not_done";
  principal_remarks: string;
  report_date: string;
};

export function roomReportDefaults(): RoomReportFormValues {
  return {
    program_id: "",
    subject_id: "",
    room_number: "",
    semester: "1",
    strength: "1",
    present: "1",
    attendance_register: "maintained",
    topic_planned: "",
    topic_taught: "",
    pedagogy_used: "",
    aids_used: "",
    teaching_skill: "satisfactory",
    interaction: "satisfactory",
    learning_outcome: "achieved",
    valuation: "done",
    principal_remarks: "",
    report_date: new Date().toISOString().slice(0, 10),
  };
}

export function roomReportToFormValues(row: RoomReport): RoomReportFormValues {
  return {
    program_id: row.program_id ?? "",
    subject_id: row.subject_id ?? "",
    room_number: row.room_number ?? "",
    semester: String(row.semester ?? 1),
    strength: String(row.strength ?? 1),
    present: String(row.present ?? 1),
    attendance_register:
      row.attendance_register === "not_maintained"
        ? "not_maintained"
        : "maintained",
    topic_planned: row.topic_planned ?? "",
    topic_taught: row.topic_taught ?? "",
    pedagogy_used: row.pedagogy_used ?? "",
    aids_used: row.aids_used ?? "",
    teaching_skill: row.teaching_skill === "good" ? "good" : "satisfactory",
    interaction: row.interaction === "good" ? "good" : "satisfactory",
    learning_outcome:
      row.learning_outcome === "not_achieved" ? "not_achieved" : "achieved",
    valuation: row.valuation === "not_done" ? "not_done" : "done",
    principal_remarks: row.principal_remarks ?? "",
    report_date: (row.report_date ?? "").slice(0, 10),
  };
}

export function toRoomReportPayload(values: RoomReportFormValues) {
  return {
    program_id: values.program_id,
    subject_id: values.subject_id,
    room_number: values.room_number.trim(),
    semester: Number(values.semester),
    strength: Number(values.strength),
    present: Number(values.present),
    attendance_register: values.attendance_register,
    topic_planned: values.topic_planned.trim(),
    topic_taught: values.topic_taught.trim(),
    pedagogy_used: values.pedagogy_used.trim(),
    aids_used: values.aids_used.trim(),
    teaching_skill: values.teaching_skill,
    interaction: values.interaction,
    learning_outcome: values.learning_outcome,
    valuation: values.valuation,
    principal_remarks: values.principal_remarks.trim(),
    report_date: values.report_date,
  };
}
