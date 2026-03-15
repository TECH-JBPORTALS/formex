import { relations, sql } from "drizzle-orm";
import {
  boolean,
  index,
  integer,
  pgEnum,
  pgTable,
  text,
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
export const posts = pgTable(
  "post",
  (d) => ({
    id: d.integer().primaryKey().generatedByDefaultAsIdentity(),
    name: d.varchar({ length: 256 }),
    createdById: d
      .varchar({ length: 255 })
      .notNull()
      .references(() => user.id),
    createdAt: d
      .timestamp({ withTimezone: true })
      .$defaultFn(() => new Date())
      .notNull(),
    updatedAt: d.timestamp({ withTimezone: true }).$onUpdate(() => new Date()),
  }),
  (t) => [
    index("created_by_idx").on(t.createdById),
    index("name_idx").on(t.name),
  ],
);

export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified")
    .$defaultFn(() => false)
    .notNull(),
  image: text("image"),
  createdAt: timestamp("created_at")
    .$defaultFn(() => /* @__PURE__ */ new Date())
    .notNull(),
  updatedAt: timestamp("updated_at")
    .$defaultFn(() => /* @__PURE__ */ new Date())
    .notNull(),
});

export const session = pgTable("session", {
  id: text("id").primaryKey(),
  expiresAt: timestamp("expires_at").notNull(),
  token: text("token").notNull().unique(),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
});

export const account = pgTable("account", {
  id: text("id").primaryKey(),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: timestamp("access_token_expires_at"),
  refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
  scope: text("scope"),
  password: text("password"),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
});

export const verification = pgTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").$defaultFn(
    () => /* @__PURE__ */ new Date(),
  ),
  updatedAt: timestamp("updated_at").$defaultFn(
    () => /* @__PURE__ */ new Date(),
  ),
});

export const userRelations = relations(user, ({ many }) => ({
  account: many(account),
  session: many(session),
}));

export const accountRelations = relations(account, ({ one }) => ({
  user: one(user, { fields: [account.userId], references: [user.id] }),
}));

export const sessionRelations = relations(session, ({ one }) => ({
  user: one(user, { fields: [session.userId], references: [user.id] }),
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
