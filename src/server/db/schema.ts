import { sql } from "drizzle-orm";
import { pgTable } from "drizzle-orm/pg-core";

// ── Existing: Template (untouched) ──────────────────────────────────────────
export const template = pgTable("template", (d) => ({
  id: d.uuid().defaultRandom().primaryKey(),
  title: d.text().notNull(),
  stateJSON: d.jsonb().default([]),
  createdAt: d.timestamp({ withTimezone: true }).defaultNow().notNull(),
  updatedAt: d
    .timestamp({ withTimezone: true })
    .$onUpdate(() => sql`CURRENT_TIMESTAMP`),
}));

// ── Epic 9: Approved Key List of Students (INS-FORMAT-9) ────────────────────
export const student = pgTable("student", (d) => ({
  id: d.uuid().defaultRandom().primaryKey(),
  fullName: d.text().notNull(),
  dateOfBirth: d.date().notNull(),

  // INS-FORMAT-9 header fields
  institutionName: d.text(),
  institutionCode: d.text(),
  programName: d.text(),
  semester: d.text(),
  academicYear: d.text(),

  // INS-FORMAT-9 row fields
  slNo: d.integer(),
  registerNumber: d.text().unique(),
  remarks: d.text(),
  isApproved: d.boolean().default(false).notNull(),

  createdAt: d.timestamp({ withTimezone: true }).defaultNow().notNull(),
  updatedAt: d
    .timestamp({ withTimezone: true })
    .$onUpdate(() => sql`CURRENT_TIMESTAMP`),
}));

// ── Epic 10: Seminars & Workshops (INS-FORMAT-11) ───────────────────────────
export const seminar = pgTable("seminar", (d) => ({
  id: d.uuid().defaultRandom().primaryKey(),

  // Header fields
  institutionName: d.text().notNull(),
  institutionCode: d.text().notNull(),
  academicYear: d.text().notNull(),
  programName: d.text().notNull(),
  semester: d.text().notNull(),
  courseCoordinatorName: d.text().notNull(),
  course: d.text().notNull(),

  // Row fields
  slNo: d.integer().notNull(),
  gap: d.text().notNull(),
  actionTaken: d.text().notNull(),
  date: d.date().notNull(),
  resourcePersonName: d.text().notNull(),
  resourcePersonDesignation: d.text().notNull(),
  mode: d.text().notNull(), // "Online" | "Offline"
  studentsAttended: d.integer().notNull(),
  relevanceToPO: d.text().notNull(),

  createdAt: d.timestamp({ withTimezone: true }).defaultNow().notNull(),
  updatedAt: d
    .timestamp({ withTimezone: true })
    .$onUpdate(() => sql`CURRENT_TIMESTAMP`),
}));

// ── Epic 11: Monthly Course Coordinator Reports ──────────────────────────────
export const courseReport = pgTable("course_report", (d) => ({
  id: d.uuid().defaultRandom().primaryKey(),

  // Header fields
  institutionName: d.text().notNull(),
  institutionCode: d.text().notNull(),
  academicYear: d.text().notNull(),
  programName: d.text().notNull(),
  semester: d.text().notNull(),
  month: d.text().notNull(), // e.g. "June 2024"

  // Row fields
  slNo: d.integer().notNull(),
  courseCoordinatorName: d.text().notNull(),
  courseTaken: d.text().notNull(),
  sessionsAsPerSyllabus: d.integer().notNull(),
  sessionsTaken: d.integer().notNull(),
  sessionsToBeTaken: d.integer().notNull(),
  percentageCovered: d.numeric({ precision: 5, scale: 2 }).notNull(),

  createdAt: d.timestamp({ withTimezone: true }).defaultNow().notNull(),
  updatedAt: d
    .timestamp({ withTimezone: true })
    .$onUpdate(() => sql`CURRENT_TIMESTAMP`),
}));