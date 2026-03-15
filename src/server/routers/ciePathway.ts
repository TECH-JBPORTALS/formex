// src/server/api/routers/ciePathway.ts
/** biome-ignore-all lint/style/noNonNullAssertion: <explanation> */
// Epic 3: CIE Pathway Course Management — 5th Semester

import { z } from "zod";
import { eq, and, sql } from "drizzle-orm";
import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { ciePathwayTests } from "@/server/db/schema";

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

export const ciePathwayRouter = createTRPCRouter({

  // 3.1 — Create Pathway Course CIE Record
  create: publicProcedure
    .input(
      z.object({
        studentId:           z.number(),
        subjectId:           z.number(),
        assessmentComponent: z.string().min(1).max(100),
        maxMarks:            z.number().min(1).default(50),
        marksObtained:       z.number().min(0),
        conductedDate:       z.date().optional(),
        academicYear:        z.string().min(1).max(10),
        remarks:             z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const grade    = computeGrade(input.marksObtained, input.maxMarks);
      const isPassed = input.marksObtained >= input.maxMarks * 0.4;

      await ctx.db.insert(ciePathwayTests).values({
        studentId:           input.studentId,
        subjectId:           input.subjectId,
        assessmentComponent: input.assessmentComponent,
        maxMarks:            input.maxMarks,
        marksObtained:       input.marksObtained,
        conductedDate:       input.conductedDate,
        academicYear:        input.academicYear,
        remarks:             input.remarks,
        grade,
        isPassed,
      });
      return { success: true };
    }),

  // 3.2 — View Pathway Course Data
  getAll: publicProcedure
    .input(
      z.object({
        subjectId:           z.number().optional(),
        assessmentComponent: z.string().optional(),
        academicYear:        z.string().optional(),
      }).optional()
    )
    .query(async ({ ctx, input }) => {
      return ctx.db.query.ciePathwayTests.findMany({
        where: (w, { and, eq }) => {
          const conds = [];
          if (input?.subjectId)           conds.push(eq(w.subjectId,           input.subjectId!));
          if (input?.assessmentComponent) conds.push(eq(w.assessmentComponent, input.assessmentComponent!));
          if (input?.academicYear)        conds.push(eq(w.academicYear,        input.academicYear!));
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
      return ctx.db.query.ciePathwayTests.findFirst({
        where: eq(ciePathwayTests.id, input.id),
        with: { student: true, subject: true },
      });
    }),

  // 3.3 — Update Pathway Course CIE Data
  update: publicProcedure
    .input(
      z.object({
        id:                  z.number(),
        marksObtained:       z.number().min(0).optional(),
        maxMarks:            z.number().min(1).optional(),
        assessmentComponent: z.string().max(100).optional(),
        conductedDate:       z.date().optional(),
        remarks:             z.string().optional(),
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
        const existing = await ctx.db.query.ciePathwayTests.findFirst({
          where: eq(ciePathwayTests.id, id),
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
        .update(ciePathwayTests)
        .set({ ...rest, ...derived })
        .where(eq(ciePathwayTests.id, id));

      return { success: true };
    }),

  // 3.4 — Delete Pathway Course Record
  delete: publicProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db
        .delete(ciePathwayTests)
        .where(eq(ciePathwayTests.id, input.id));
      return { success: true };
    }),

  // 3.5 — Generate Pathway Course Performance Report
  getPerformanceReport: publicProcedure
    .input(
      z.object({
        subjectId:           z.number(),
        academicYear:        z.string(),
        assessmentComponent: z.string().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const baseWhere = and(
        eq(ciePathwayTests.subjectId,    input.subjectId),
        eq(ciePathwayTests.academicYear, input.academicYear),
        input.assessmentComponent
          ? eq(ciePathwayTests.assessmentComponent, input.assessmentComponent)
          : undefined
      );

      // Overall aggregate stats — all aggregates via raw sql<> to avoid dialect conflicts
      const [stats] = await ctx.db
        .select({
          totalStudents: sql<number>`COUNT(*)`,
          avgMarks:      sql<number>`ROUND(AVG(${ciePathwayTests.marksObtained}), 2)`,
          passCount:     sql<number>`SUM(CASE WHEN ${ciePathwayTests.isPassed} = 1 THEN 1 ELSE 0 END)`,
          failCount:     sql<number>`SUM(CASE WHEN ${ciePathwayTests.isPassed} = 0 THEN 1 ELSE 0 END)`,
          maxScore:      sql<number>`MAX(${ciePathwayTests.marksObtained})`,
          minScore:      sql<number>`MIN(${ciePathwayTests.marksObtained})`,
          gradeO:        sql<number>`SUM(CASE WHEN ${ciePathwayTests.grade} = 'O'  THEN 1 ELSE 0 END)`,
          gradeAPlus:    sql<number>`SUM(CASE WHEN ${ciePathwayTests.grade} = 'A+' THEN 1 ELSE 0 END)`,
          gradeA:        sql<number>`SUM(CASE WHEN ${ciePathwayTests.grade} = 'A'  THEN 1 ELSE 0 END)`,
          gradeBPlus:    sql<number>`SUM(CASE WHEN ${ciePathwayTests.grade} = 'B+' THEN 1 ELSE 0 END)`,
          gradeB:        sql<number>`SUM(CASE WHEN ${ciePathwayTests.grade} = 'B'  THEN 1 ELSE 0 END)`,
          gradeC:        sql<number>`SUM(CASE WHEN ${ciePathwayTests.grade} = 'C'  THEN 1 ELSE 0 END)`,
          gradeP:        sql<number>`SUM(CASE WHEN ${ciePathwayTests.grade} = 'P'  THEN 1 ELSE 0 END)`,
          gradeF:        sql<number>`SUM(CASE WHEN ${ciePathwayTests.grade} = 'F'  THEN 1 ELSE 0 END)`,
        })
        .from(ciePathwayTests)
        .where(baseWhere);

      // Per-component breakdown for bar/radar charts on the frontend
      const componentBreakdown = await ctx.db
        .select({
          assessmentComponent: ciePathwayTests.assessmentComponent,
          avgMarks:  sql<number>`ROUND(AVG(${ciePathwayTests.marksObtained}), 2)`,
          passCount: sql<number>`SUM(CASE WHEN ${ciePathwayTests.isPassed} = 1 THEN 1 ELSE 0 END)`,
          total:     sql<number>`COUNT(*)`,
        })
        .from(ciePathwayTests)
        .where(
          and(
            eq(ciePathwayTests.subjectId,    input.subjectId),
            eq(ciePathwayTests.academicYear, input.academicYear)
          )
        )
        .groupBy(ciePathwayTests.assessmentComponent);

      // Full student-level records
      const records = await ctx.db.query.ciePathwayTests.findMany({
        where: baseWhere,
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
        componentBreakdown: componentBreakdown.map((c) => ({
          component: c.assessmentComponent,
          avgMarks:  Number(c.avgMarks  ?? 0),
          passCount: Number(c.passCount ?? 0),
          total:     Number(c.total     ?? 0),
          passRate:  Number(c.total) > 0
            ? +((Number(c.passCount) / Number(c.total)) * 100).toFixed(1)
            : 0,
        })),
        records,
      };
    }),
});