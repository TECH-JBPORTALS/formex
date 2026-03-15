import { desc, eq } from "drizzle-orm";
import z from "zod";
import { courseReport } from "../db/schema";
import { createRouter, publicProcedure } from "../trpc";

const courseReportInput = z.object({
  institutionName: z.string().min(1),
  institutionCode: z.string().min(1),
  academicYear: z.string().min(1),
  programName: z.string().min(1),
  semester: z.string().min(1),
  month: z.string().min(1), // e.g. "June 2024"
  slNo: z.number().int().min(0),
  courseCoordinatorName: z.string().min(1),
  courseTaken: z.string().min(1),
  sessionsAsPerSyllabus: z.number().int().nonnegative(),
  sessionsTaken: z.number().int().nonnegative(),
  sessionsToBeTaken: z.number().int().nonnegative(),
  percentageCovered: z.string().min(1), // stored as numeric string e.g. "87.50"
});

export const courseReportRouter = createRouter({
  // 11.3 View Monthly Course Reports
  list: publicProcedure.query(({ ctx }) =>
    ctx.db.query.courseReport.findMany({
      orderBy: [desc(courseReport.createdAt)],
    }),
  ),

  // 11.1 Create Monthly Course Coordinator Report
  create: publicProcedure.input(courseReportInput).mutation(({ ctx, input }) =>
    ctx.db
      .insert(courseReport)
      .values(input)
      .returning()
      .then((rows) => rows[0]),
  ),

  // 11.2 Update Monthly Report
  update: publicProcedure
    .input(courseReportInput.extend({ id: z.string().uuid() }))
    .mutation(({ ctx, input }) => {
      const { id, ...rest } = input;
      return ctx.db
        .update(courseReport)
        .set({ ...rest, updatedAt: new Date() })
        .where(eq(courseReport.id, id))
        .returning()
        .then((rows) => rows[0]);
    }),

  delete: publicProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(({ ctx, input }) =>
      ctx.db.delete(courseReport).where(eq(courseReport.id, input.id)),
    ),
});
