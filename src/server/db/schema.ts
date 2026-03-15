import { relations, sql } from "drizzle-orm";
import {
  integer,
  pgEnum,
  pgTable,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

export const institution = pgTable("institution", (d) => ({
  id: d.uuid().defaultRandom().primaryKey(),
  name: d.text().notNull(),
  code: d.text().notNull(),
  email: d.text().notNull(),
  phone: d.text().notNull(),
  createdAt: d.timestamp({ withTimezone: true }).defaultNow().notNull(),
  updatedAt: d
    .timestamp({ withTimezone: true })
    .$onUpdate(() => sql`CURRENT_TIMESTAMP`),
}));

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

// ── Programs (Sidebar branches) ──────────────────────────────────────────────
export const program = pgTable("program", (d) => ({
  id: d.uuid().defaultRandom().primaryKey(),
  name: d.text().notNull(),
  createdAt: d.timestamp({ withTimezone: true }).defaultNow().notNull(),
  updatedAt: d
    .timestamp({ withTimezone: true })
    .$onUpdate(() => sql`CURRENT_TIMESTAMP`),
}));

// --- ADDED TIMETABLE LOGIC BELOW ---

export const timetableTypeEnum = pgEnum("timetable_type", [
  "CLASS",
  "LAB",
  "PERSONNEL",
  "MASTER",
]);
export const dayEnum = pgEnum("day_of_week", [
  "MONDAY",
  "TUESDAY",
  "WEDNESDAY",
  "THURSDAY",
  "FRIDAY",
  "SATURDAY",
  "SUNDAY",
]);

export const timetables = pgTable("timetables", {
  id: uuid("id").primaryKey().defaultRandom(),
  type: timetableTypeEnum("type").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  entityId: uuid("entity_id"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .$defaultFn(() => new Date()),
  updatedAt: timestamp("updated_at", { withTimezone: true }).$onUpdate(
    () => new Date(),
  ),
});

export const timetableSessions = pgTable(
  "timetable_session",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    timetableId: uuid("timetable_id")
      .references(() => timetables.id, { onDelete: "cascade" })
      .notNull(),
    day: dayEnum("day").notNull(),
    startTime: varchar("start_time", { length: 5 }).notNull(),
    endTime: varchar("end_time", { length: 5 }).notNull(),
    subjectName: varchar("subject_name", { length: 255 }).notNull(),
    instructorId: uuid("instructor_id"),
    location: varchar("location", { length: 100 }).notNull(),
    isLab: integer("is_lab").default(0),
  },
  (table) => ({
    locationTimeSlotIdx: uniqueIndex("location_time_slot_idx").on(
      table.location,
      table.day,
      table.startTime,
    ),
  }),
);

export const timetableRelations = relations(timetables, ({ many }) => ({
  sessions: many(timetableSessions),
}));

export const timetableSessionRelations = relations(
  timetableSessions,
  ({ one }) => ({
    timetable: one(timetables, {
      fields: [timetableSessions.timetableId],
      references: [timetables.id],
    }),
  }),
);
