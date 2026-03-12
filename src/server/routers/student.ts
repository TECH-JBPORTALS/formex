import { desc, eq } from "drizzle-orm";
import z from "zod";

import { student } from "../db/schema";
import { createRouter, publicProcedure } from "../trpc";

export const studentRouter = createRouter({
  list: publicProcedure.query(({ ctx }) =>
    ctx.db.query.student.findMany({
      orderBy: [desc(student.createdAt)],
    }),
  ),

  create: publicProcedure
    .input(
      z.object({
        fullName: z.string().min(1),
        // Accept ISO date string from the UI and coerce to Date
        dateOfBirth: z.coerce.date(),
      }),
    )
    .mutation(({ ctx, input }) =>
      ctx.db
        .insert(student)
        .values({
          fullName: input.fullName,
          dateOfBirth: input.dateOfBirth,
        })
        .returning()
        .then((rows) => rows[0]),
    ),

  update: publicProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        fullName: z.string().min(1),
        dateOfBirth: z.coerce.date(),
      }),
    )
    .mutation(({ ctx, input }) =>
      ctx.db
        .update(student)
        .set({
          fullName: input.fullName,
          dateOfBirth: input.dateOfBirth,
        })
        .where(eq(student.id, input.id))
        .returning()
        .then((rows) => rows[0]),
    ),

  delete: publicProcedure
    .input(
      z.object({
        id: z.string().uuid(),
      }),
    )
    .mutation(({ ctx, input }) =>
      ctx.db.delete(student).where(eq(student.id, input.id)),
    ),
});

