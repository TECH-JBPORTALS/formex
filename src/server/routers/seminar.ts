import { desc, eq } from "drizzle-orm";
import z from "zod";
import { seminar } from "../db/schema";
import { createTRPCRouter, publicProcedure } from "../trpc";

const seminarInput = z.object({
  institutionName: z.string().min(1),
  institutionCode: z.string().min(1),
  academicYear: z.string().min(1),
  programName: z.string().min(1),
  semester: z.string().min(1),
  courseCoordinatorName: z.string().min(1),
  course: z.string().min(1),
  slNo: z.number().int().positive(),
  gap: z.string().min(1),
  actionTaken: z.string().min(1),
  date: z.string().min(1), // "YYYY-MM-DD"
  resourcePersonName: z.string().min(1),
  resourcePersonDesignation: z.string().min(1),
  mode: z.enum(["Online", "Offline"]),
  studentsAttended: z.number().int().nonnegative(),
  relevanceToPO: z.string().min(1),
});

export const seminarRouter = createTRPCRouter({
  // 10.3 View Conducted Seminars / Workshops
  list: publicProcedure.query(({ ctx }) =>
    ctx.db.query.seminar.findMany({
      orderBy: [desc(seminar.createdAt)],
    }),
  ),

  // 10.1 Record Seminar / Workshop Details
  create: publicProcedure.input(seminarInput).mutation(({ ctx, input }) =>
    ctx.db
      .insert(seminar)
      .values(input)
      .returning()
      .then((rows) => rows[0]),
  ),

  // 10.2 Update Seminar / Workshop Information
  update: publicProcedure
    .input(seminarInput.extend({ id: z.string().uuid() }))
    .mutation(({ ctx, input }) => {
      const { id, ...rest } = input;
      return ctx.db
        .update(seminar)
        .set({ ...rest, updatedAt: new Date() })
        .where(eq(seminar.id, id))
        .returning()
        .then((rows) => rows[0]);
    }),

  delete: publicProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(({ ctx, input }) =>
      ctx.db.delete(seminar).where(eq(seminar.id, input.id)),
    ),
});
