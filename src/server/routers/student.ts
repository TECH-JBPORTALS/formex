import { desc, eq } from "drizzle-orm";
import z from "zod";
import { student } from "../db/schema";
import { createTRPCRouter, publicProcedure } from "../trpc";

export const studentRouter = createTRPCRouter({
  // 9.3 View Student List
  list: publicProcedure.query(({ ctx }) =>
    ctx.db.query.student.findMany({
      orderBy: [desc(student.createdAt)],
    }),
  ),

  // 9.1 Upload Student for Approval
  create: publicProcedure
    .input(
      z.object({
        fullName: z.string().min(1),
        dateOfBirth: z.string().min(1), // "YYYY-MM-DD" string — drizzle date() column is string
        institutionName: z.string().optional(),
        institutionCode: z.string().optional(),
        programName: z.string().optional(),
        semester: z.string().optional(),
        academicYear: z.string().optional(),
        slNo: z.number().int().positive().optional(),
      }),
    )
    .mutation(({ ctx, input }) =>
      ctx.db
        .insert(student)
        .values({
          fullName: input.fullName,
          dateOfBirth: input.dateOfBirth,
          institutionName: input.institutionName,
          institutionCode: input.institutionCode,
          programName: input.programName,
          semester: input.semester,
          academicYear: input.academicYear,
          slNo: input.slNo,
          isApproved: false,
        })
        .returning()
        .then((rows) => rows[0]),
    ),

  // 9.2 Approve — assigning register number marks student as approved
  approve: publicProcedure
    .input(
      z.object({
        id: z.string(),
        registerNumber: z.string().min(1),
        remarks: z.string().optional(),
      }),
    )
    .mutation(({ ctx, input }) =>
      ctx.db
        .update(student)
        .set({
          registerNumber: input.registerNumber,
          remarks: input.remarks ?? null,
          isApproved: true,
          updatedAt: new Date(),
        })
        .where(eq(student.id, input.id))
        .returning()
        .then((rows) => rows[0]),
    ),

  // 9.2 Update general student details
  update: publicProcedure
    .input(
      z.object({
        id: z.string(),
        fullName: z.string().min(1),
        dateOfBirth: z.string().min(1), // "YYYY-MM-DD" string
        institutionName: z.string().optional(),
        institutionCode: z.string().optional(),
        programName: z.string().optional(),
        semester: z.string().optional(),
        academicYear: z.string().optional(),
        slNo: z.number().int().positive().optional(),
        registerNumber: z.string().optional(),
        remarks: z.string().optional(),
      }),
    )
    .mutation(({ ctx, input }) =>
      ctx.db
        .update(student)
        .set({
          fullName: input.fullName,
          dateOfBirth: input.dateOfBirth,
          institutionName: input.institutionName,
          institutionCode: input.institutionCode,
          programName: input.programName,
          semester: input.semester,
          academicYear: input.academicYear,
          slNo: input.slNo,
          registerNumber: input.registerNumber ?? null,
          remarks: input.remarks ?? null,
          isApproved: !!input.registerNumber,
          updatedAt: new Date(),
        })
        .where(eq(student.id, input.id))
        .returning()
        .then((rows) => rows[0]),
    ),

  delete: publicProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(({ ctx, input }) =>
      ctx.db.delete(student).where(eq(student.id, input.id)),
    ),
});
