// src/server/db/schema.ts
import { relations, sql } from "drizzle-orm";
import {
  index,
  integer,
  pgEnum,
  pgTableCreator,
  text,
  timestamp,
  varchar,
  real,
  boolean,
} from "drizzle-orm/pg-core";

/**
 * T3 multi-project schema convention.
 * Prefix all tables so multiple T3 apps can share one DB.
 */
export const createTable = pgTableCreator((name) => `cie_mgmt_${name}`);

// ─────────────────────────────────────────────
// ENUM TYPES
// ─────────────────────────────────────────────

export const yearEnum     = pgEnum("year",      ["1st", "2nd"]);
export const semesterEnum = pgEnum("semester",  ["1", "2", "3", "4", "5", "6", "7", "8"]);
export const testTypeEnum = pgEnum("test_type", ["CIE1", "CIE2", "CIE3"]);
export const gradeEnum    = pgEnum("grade",     ["O", "A+", "A", "B+", "B", "C", "P", "F"]);

// ─────────────────────────────────────────────
// 1. STUDENTS
// ─────────────────────────────────────────────

export const students = createTable(
  "student",
  {
    id:        integer("id").primaryKey().generatedByDefaultAsIdentity(),
    usn:       varchar("usn", { length: 20 }).notNull().unique(),
    name:      varchar("name", { length: 120 }).notNull(),
    email:     varchar("email", { length: 120 }),
    year:      yearEnum("year").notNull(),
    semester:  semesterEnum("semester").notNull(),
    section:   varchar("section", { length: 5 }).notNull(),
    branch:    varchar("branch", { length: 60 }).notNull(),
    isActive:  boolean("is_active").default(true).notNull(),
    createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
    updatedAt: timestamp("updated_at").$onUpdateFn(() => new Date()),
  },
  (t) => ({
    usnIdx:    index("usn_idx").on(t.usn),
    semSecIdx: index("sem_sec_idx").on(t.semester, t.section),
  })
);

// ─────────────────────────────────────────────
// 2. SUBJECTS
// ─────────────────────────────────────────────

export const subjects = createTable(
  "subject",
  {
    id:        integer("id").primaryKey().generatedByDefaultAsIdentity(),
    code:      varchar("code", { length: 15 }).notNull().unique(),
    name:      varchar("name", { length: 120 }).notNull(),
    semester:  semesterEnum("semester").notNull(),
    credits:   integer("credits").notNull().default(3),
    isPathway: boolean("is_pathway").default(false).notNull(),
    createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
    updatedAt: timestamp("updated_at").$onUpdateFn(() => new Date()),
  },
  (t) => ({
    codeIdx: index("code_idx").on(t.code),
    semIdx:  index("sem_idx").on(t.semester),
  })
);

// ─────────────────────────────────────────────
// 3. CIE WRITTEN TEST  (Epic 1 — 1st & 2nd Year)
// ─────────────────────────────────────────────

export const cieWrittenTests = createTable(
  "cie_written",
  {
    id:            integer("id").primaryKey().generatedByDefaultAsIdentity(),
    studentId:     integer("student_id").notNull().references(() => students.id, { onDelete: "cascade" }),
    subjectId:     integer("subject_id").notNull().references(() => subjects.id, { onDelete: "cascade" }),
    testType:      testTypeEnum("test_type").notNull(),
    maxMarks:      integer("max_marks").notNull().default(30),
    marksObtained: real("marks_obtained").notNull(),
    grade:         gradeEnum("grade"),
    isPassed:      boolean("is_passed").default(false).notNull(),
    conductedDate: timestamp("conducted_date"),
    academicYear:  varchar("academic_year", { length: 10 }).notNull(),
    remarks:       text("remarks"),
    createdAt:     timestamp("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
    updatedAt:     timestamp("updated_at").$onUpdateFn(() => new Date()),
  },
  (t) => ({
    writtenUq:  index("written_student_subject_test_uq").on(t.studentId, t.subjectId, t.testType, t.academicYear),
    studentIdx: index("written_student_idx").on(t.studentId),
    subjectIdx: index("written_subject_idx").on(t.subjectId),
  })
);

// ─────────────────────────────────────────────
// 4. CIE SKILL TEST  (Epic 2 — 1st & 2nd Year)
// ─────────────────────────────────────────────

export const cieSkillTests = createTable(
  "cie_skill",
  {
    id:             integer("id").primaryKey().generatedByDefaultAsIdentity(),
    studentId:      integer("student_id").notNull().references(() => students.id, { onDelete: "cascade" }),
    subjectId:      integer("subject_id").notNull().references(() => subjects.id, { onDelete: "cascade" }),
    testType:       testTypeEnum("test_type").notNull(),
    maxMarks:       integer("max_marks").notNull().default(20),
    marksObtained:  real("marks_obtained").notNull(),
    skillComponent: varchar("skill_component", { length: 100 }),
    grade:          gradeEnum("grade"),
    isPassed:       boolean("is_passed").default(false).notNull(),
    conductedDate:  timestamp("conducted_date"),
    academicYear:   varchar("academic_year", { length: 10 }).notNull(),
    remarks:        text("remarks"),
    createdAt:      timestamp("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
    updatedAt:      timestamp("updated_at").$onUpdateFn(() => new Date()),
  },
  (t) => ({
    skillUq:    index("skill_student_subject_test_uq").on(t.studentId, t.subjectId, t.testType, t.academicYear),
    studentIdx: index("skill_student_idx").on(t.studentId),
    subjectIdx: index("skill_subject_idx").on(t.subjectId),
  })
);

// ─────────────────────────────────────────────
// 5. CIE PATHWAY COURSE  (Epic 3 — 5th Semester)
// ─────────────────────────────────────────────

export const ciePathwayTests = createTable(
  "cie_pathway",
  {
    id:                  integer("id").primaryKey().generatedByDefaultAsIdentity(),
    studentId:           integer("student_id").notNull().references(() => students.id, { onDelete: "cascade" }),
    subjectId:           integer("subject_id").notNull().references(() => subjects.id, { onDelete: "cascade" }),
    assessmentComponent: varchar("assessment_component", { length: 100 }).notNull(),
    maxMarks:            integer("max_marks").notNull().default(50),
    marksObtained:       real("marks_obtained").notNull(),
    grade:               gradeEnum("grade"),
    isPassed:            boolean("is_passed").default(false).notNull(),
    conductedDate:       timestamp("conducted_date"),
    academicYear:        varchar("academic_year", { length: 10 }).notNull(),
    remarks:             text("remarks"),
    createdAt:           timestamp("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
    updatedAt:           timestamp("updated_at").$onUpdateFn(() => new Date()),
  },
  (t) => ({
    pathwayUq:  index("pathway_student_subject_comp_uq").on(t.studentId, t.subjectId, t.assessmentComponent, t.academicYear),
    studentIdx: index("pathway_student_idx").on(t.studentId),
    subjectIdx: index("pathway_subject_idx").on(t.subjectId),
  })
);

// ─────────────────────────────────────────────
// RELATIONS
// ─────────────────────────────────────────────

export const studentsRelations = relations(students, ({ many }) => ({
  writtenTests: many(cieWrittenTests),
  skillTests:   many(cieSkillTests),
  pathwayTests: many(ciePathwayTests),
}));

export const subjectsRelations = relations(subjects, ({ many }) => ({
  writtenTests: many(cieWrittenTests),
  skillTests:   many(cieSkillTests),
  pathwayTests: many(ciePathwayTests),
}));

export const cieWrittenRelations = relations(cieWrittenTests, ({ one }) => ({
  student: one(students, { fields: [cieWrittenTests.studentId], references: [students.id] }),
  subject: one(subjects, { fields: [cieWrittenTests.subjectId], references: [subjects.id] }),
}));

export const cieSkillRelations = relations(cieSkillTests, ({ one }) => ({
  student: one(students, { fields: [cieSkillTests.studentId], references: [students.id] }),
  subject: one(subjects, { fields: [cieSkillTests.subjectId], references: [subjects.id] }),
}));

export const ciePathwayRelations = relations(ciePathwayTests, ({ one }) => ({
  student: one(students, { fields: [ciePathwayTests.studentId], references: [students.id] }),
  subject: one(subjects, { fields: [ciePathwayTests.subjectId], references: [subjects.id] }),
}));

// ─────────────────────────────────────────────
// TYPE EXPORTS
// ─────────────────────────────────────────────

export type Student       = typeof students.$inferSelect;
export type NewStudent    = typeof students.$inferInsert;
export type Subject       = typeof subjects.$inferSelect;
export type NewSubject    = typeof subjects.$inferInsert;
export type CieWritten    = typeof cieWrittenTests.$inferSelect;
export type NewCieWritten = typeof cieWrittenTests.$inferInsert;
export type CieSkill      = typeof cieSkillTests.$inferSelect;
export type NewCieSkill   = typeof cieSkillTests.$inferInsert;
export type CiePathway    = typeof ciePathwayTests.$inferSelect;
export type NewCiePathway = typeof ciePathwayTests.$inferInsert;