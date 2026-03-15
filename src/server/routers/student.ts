// src/server/api/routers/student.ts
import { z } from "zod";
import { eq, like, and } from "drizzle-orm";
import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { students } from "@/server/db/schema";

export const studentRouter = createTRPCRouter({

  /** List all students with optional filters */
  getAll: publicProcedure
    .input(
      z.object({
        semester: z.enum(["1","2","3","4","5","6","7","8"]).optional(),
        section:  z.string().optional(),
        branch:   z.string().optional(),
        search:   z.string().optional(),
      }).optional()
    )
    .query(async ({ ctx, input }) => {
      const conditions = [];
      if (input?.semester) conditions.push(eq(students.semester, input.semester));
      if (input?.section)  conditions.push(eq(students.section, input.section));
      if (input?.branch)   conditions.push(eq(students.branch, input.branch));
      if (input?.search)   conditions.push(like(students.name, `%${input.search}%`));

      return ctx.db.query.students.findMany({
        where: conditions.length ? and(...conditions) : undefined,
        orderBy: (s, { asc }) => [asc(s.name)],
      });
    }),

  /** Get single student by ID */
  getById: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
      return ctx.db.query.students.findFirst({
        where: eq(students.id, input.id),
      });
    }),

  /** Create a new student */
  create: publicProcedure
    .input(z.object({
      usn:      z.string().min(1).max(20),
      name:     z.string().min(1).max(120),
      email:    z.string().email().optional(),
      year:     z.enum(["1st", "2nd"]),
      semester: z.enum(["1","2","3","4","5","6","7","8"]),
      section:  z.string().min(1).max(5),
      branch:   z.string().min(1).max(60),
    }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db.insert(students).values(input);
      return { success: true };
    }),

  /** Update an existing student */
  update: publicProcedure
    .input(z.object({
      id:       z.number(),
      name:     z.string().min(1).max(120).optional(),
      email:    z.string().email().optional(),
      year:     z.enum(["1st", "2nd"]).optional(),
      semester: z.enum(["1","2","3","4","5","6","7","8"]).optional(),
      section:  z.string().min(1).max(5).optional(),
      branch:   z.string().min(1).max(60).optional(),
      isActive: z.boolean().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;
      await ctx.db.update(students).set(data).where(eq(students.id, id));
      return { success: true };
    }),

  /** Delete a student */
  delete: publicProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db.delete(students).where(eq(students.id, input.id));
      return { success: true };
    }),
});