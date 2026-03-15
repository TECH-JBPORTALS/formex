// src/server/api/routers/cieSkill.ts
// Epic 2: CIE Skill Test Management — 1st & 2nd Year

import { z } from "zod";
import { eq, and, sql } from "drizzle-orm";
import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { cieSkillTests } from "@/server/db/schema";

// ─────────────────────────────────────────────
// HELPER
// ─────────────────────────────────────────────

function computeGrade(obtained: number, max: number): "O" | "A+" | "A" | "B+" | "B" | "C" | "P" | "F" {
  const pct = (obtained / max) * 100;
  if (pct >= 90) return "O";
  if (pct >= 80) return "A+";
  if (pct >= 70) return "A";
  if (pct >= 60) return "B+";
  if (pct >= 55) return "B";
  if (pct >= 50) return "C";
  if (pct >= 40) return "P";
  return "F";
}

// ─────────────────────────────────────────────
// ROUTER
// ─────────────────────────────────────────────

export const cieSkillRouter = createTRPCRouter({

  // 2.1 — Create Skill Test Record
  create: publicProcedure
    .input(
      z.object({
        studentId:      z.number(),
        subjectId:      z.number(),
        testType:       z.enum(["CIE1", "CIE2", "CIE3"]),
        maxMarks:       z.number().min(1).default(20),
        marksObtained:  z.number().min(0),
        skillComponent: z.string().max(100).optional(),
        conductedDate:  z.date().optional(),
        academicYear:   z.string().min(1).max(10),
        remarks:        z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const grade    = computeGrade(input.marksObtained, input.maxMarks);
      const isPassed = input.marksObtained >= input.maxMarks * 0.4;

      await ctx.db.insert(cieSkillTests).values({
        studentId:      input.studentId,
        subjectId:      input.subjectId,
        testType:       input.testType,
        maxMarks:       input.maxMarks,
        marksObtained:  input.marksObtained,
        skillComponent: input.skillComponent,
        conductedDate:  input.conductedDate,
        academicYear:   input.academicYear,
        remarks:        input.remarks,
        grade,
        isPassed,
      });
      return { success: true };
    }),

  // 2.2 — View Skill Test Results
  getAll: publicProcedure
    .input(
      z.object({
        subjectId:      z.number().optional(),
        testType:       z.enum(["CIE1", "CIE2", "CIE3"]).optional(),
        skillComponent: z.string().optional(),
        academicYear:   z.string().optional(),
      }).optional()
    )
    .query(async ({ ctx, input }) => {
      return ctx.db.query.cieSkillTests.findMany({
        where: (w, { and, eq }) => {
          const conds = [];
          if (input?.subjectId)      conds.push(eq(w.subjectId,      input.subjectId!));
          if (input?.testType)       conds.push(eq(w.testType,       input.testType!));
          if (input?.skillComponent) conds.push(eq(w.skillComponent, input.skillComponent!));
          if (input?.academicYear)   conds.push(eq(w.academicYear,   input.academicYear!));
          return conds.length ? and(...conds) : undefined;
        },
        with: { student: true, subject: true },
        orderBy: (w, { desc }) => [desc(w.createdAt)],
      });
    }),

  // Get single record by ID
  getById: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
      return ctx.db.query.cieSkillTests.findFirst({
        where: eq(cieSkillTests.id, input.id),
        with: { student: true, subject: true },
      });
    }),

  // 2.3 — Update Skill Test Data
  update: publicProcedure
    .input(
      z.object({
        id:             z.number(),
        marksObtained:  z.number().min(0).optional(),
        maxMarks:       z.number().min(1).optional(),
        skillComponent: z.string().max(100).optional(),
        testType:       z.enum(["CIE1", "CIE2", "CIE3"]).optional(),
        conductedDate:  z.date().optional(),
        remarks:        z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, marksObtained, maxMarks, ...rest } = input;

      let derived: {
        marksObtained?: number;
        maxMarks?: number;
        grade?: "O" | "A+" | "A" | "B+" | "B" | "C" | "P" | "F";
        isPassed?: boolean;
      } = {};

      if (marksObtained !== undefined || maxMarks !== undefined) {
        const existing = await ctx.db.query.cieSkillTests.findFirst({
          where: eq(cieSkillTests.id, id),
        });
        if (!existing) throw new Error("Record not found");

        const newObtained = marksObtained ?? existing.marksObtained;
        const newMax      = maxMarks      ?? existing.maxMarks;

        derived = {
          marksObtained: newObtained,
          maxMarks:      newMax,
          grade:         computeGrade(newObtained, newMax),
          isPassed:      newObtained >= newMax * 0.4,
        };
      }

      await ctx.db
        .update(cieSkillTests)
        .set({ ...rest, ...derived })
        .where(eq(cieSkillTests.id, id));

      return { success: true };
    }),

  // 2.4 — Delete Skill Test Record
  delete: publicProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db
        .delete(cieSkillTests)
        .where(eq(cieSkillTests.id, input.id));
      return { success: true };
    }),

  // 2.5 — Generate Skill Test Summary Report
  getSummaryReport: publicProcedure
    .input(
      z.object({
        subjectId:    z.number(),
        testType:     z.enum(["CIE1", "CIE2", "CIE3"]),
        academicYear: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      const whereClause = and(
        eq(cieSkillTests.subjectId,    input.subjectId),
        eq(cieSkillTests.testType,     input.testType),
        eq(cieSkillTests.academicYear, input.academicYear)
      );

      const [stats] = await ctx.db
        .select({
          totalStudents: sql<number>`COUNT(*)`,
          avgMarks:      sql<number>`ROUND(AVG(${cieSkillTests.marksObtained}), 2)`,
          passCount:     sql<number>`SUM(CASE WHEN ${cieSkillTests.isPassed} = 1 THEN 1 ELSE 0 END)`,
          failCount:     sql<number>`SUM(CASE WHEN ${cieSkillTests.isPassed} = 0 THEN 1 ELSE 0 END)`,
          maxScore:      sql<number>`MAX(${cieSkillTests.marksObtained})`,
          minScore:      sql<number>`MIN(${cieSkillTests.marksObtained})`,
          gradeO:        sql<number>`SUM(CASE WHEN ${cieSkillTests.grade} = 'O'  THEN 1 ELSE 0 END)`,
          gradeAPlus:    sql<number>`SUM(CASE WHEN ${cieSkillTests.grade} = 'A+' THEN 1 ELSE 0 END)`,
          gradeA:        sql<number>`SUM(CASE WHEN ${cieSkillTests.grade} = 'A'  THEN 1 ELSE 0 END)`,
          gradeBPlus:    sql<number>`SUM(CASE WHEN ${cieSkillTests.grade} = 'B+' THEN 1 ELSE 0 END)`,
          gradeB:        sql<number>`SUM(CASE WHEN ${cieSkillTests.grade} = 'B'  THEN 1 ELSE 0 END)`,
          gradeC:        sql<number>`SUM(CASE WHEN ${cieSkillTests.grade} = 'C'  THEN 1 ELSE 0 END)`,
          gradeP:        sql<number>`SUM(CASE WHEN ${cieSkillTests.grade} = 'P'  THEN 1 ELSE 0 END)`,
          gradeF:        sql<number>`SUM(CASE WHEN ${cieSkillTests.grade} = 'F'  THEN 1 ELSE 0 END)`,
        })
        .from(cieSkillTests)
        .where(whereClause);

      const records = await ctx.db.query.cieSkillTests.findMany({
        where: whereClause,
        with: { student: true, subject: true },
        orderBy: (w, { desc }) => [desc(w.marksObtained)],
      });

      const total = Number(stats?.totalStudents ?? 0);
      const pass  = Number(stats?.passCount     ?? 0);

      return {
        stats: {
          totalStudents: total,
          avgMarks:      Number(stats?.avgMarks  ?? 0),
          passCount:     pass,
          failCount:     Number(stats?.failCount ?? 0),
          passRate:      total > 0 ? +((pass / total) * 100).toFixed(1) : 0,
          maxScore:      Number(stats?.maxScore  ?? 0),
          minScore:      Number(stats?.minScore  ?? 0),
          gradeDistribution: {
            O:    Number(stats?.gradeO     ?? 0),
            "A+": Number(stats?.gradeAPlus ?? 0),
            A:    Number(stats?.gradeA     ?? 0),
            "B+": Number(stats?.gradeBPlus ?? 0),
            B:    Number(stats?.gradeB     ?? 0),
            C:    Number(stats?.gradeC     ?? 0),
            P:    Number(stats?.gradeP     ?? 0),
            F:    Number(stats?.gradeF     ?? 0),
          },
        },
        records,
      };
    }),
});