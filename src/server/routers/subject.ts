// src/server/api/routers/subject.ts
import { z } from "zod";
import { eq, and } from "drizzle-orm";
import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { subjects } from "@/server/db/schema";

export const subjectRouter = createTRPCRouter({

  /** List subjects — optionally filter by semester or pathway flag */
  getAll: publicProcedure
    .input(
      z.object({
        semester:  z.enum(["1","2","3","4","5","6","7","8"]).optional(),
        isPathway: z.boolean().optional(),
      }).optional()
    )
    .query(async ({ ctx, input }) => {
      const conditions = [];
      if (input?.semester !== undefined) conditions.push(eq(subjects.semester, input.semester));
      if (input?.isPathway !== undefined) conditions.push(eq(subjects.isPathway, input.isPathway));

      return ctx.db.query.subjects.findMany({
        where: conditions.length ? and(...conditions) : undefined,
        orderBy: (s, { asc }) => [asc(s.semester), asc(s.name)],
      });
    }),

  /** Get single subject by ID */
  getById: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
      return ctx.db.query.subjects.findFirst({
        where: eq(subjects.id, input.id),
      });
    }),

  /** Create a new subject */
  create: publicProcedure
    .input(z.object({
      code:      z.string().min(1).max(15),
      name:      z.string().min(1).max(120),
      semester:  z.enum(["1","2","3","4","5","6","7","8"]),
      credits:   z.number().min(1).max(10).default(3),
      isPathway: z.boolean().default(false),
    }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db.insert(subjects).values(input);
      return { success: true };
    }),

  /** Update a subject */
  update: publicProcedure
    .input(z.object({
      id:        z.number(),
      name:      z.string().min(1).max(120).optional(),
      semester:  z.enum(["1","2","3","4","5","6","7","8"]).optional(),
      credits:   z.number().min(1).max(10).optional(),
      isPathway: z.boolean().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;
      await ctx.db.update(subjects).set(data).where(eq(subjects.id, id));
      return { success: true };
    }),

  /** Delete a subject */
  delete: publicProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db.delete(subjects).where(eq(subjects.id, input.id));
      return { success: true };
    }),
});