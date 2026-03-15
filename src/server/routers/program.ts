import { desc, eq } from "drizzle-orm";
import z from "zod";
import { program } from "../db/schema";
import { createRouter, publicProcedure } from "../trpc";

export const programRouter = createRouter({
  // List all programs
  list: publicProcedure.query(({ ctx }) =>
    ctx.db.query.program.findMany({
      orderBy: [desc(program.createdAt)],
    }),
  ),

  // Get single program by id
  byId: publicProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(({ ctx, input }) =>
      ctx.db.query.program.findFirst({
        where: eq(program.id, input.id),
      }),
    ),

  // Create a new program
  create: publicProcedure
    .input(
      z.object({
        name: z.string().min(1, "Program name is required"),
      }),
    )
    .mutation(({ ctx, input }) =>
      ctx.db
        .insert(program)
        .values({
          name: input.name,
        })
        .returning()
        .then((rows) => rows[0]),
    ),

  // Update a program name
  update: publicProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        name: z.string().min(1, "Program name is required"),
      }),
    )
    .mutation(({ ctx, input }) =>
      ctx.db
        .update(program)
        .set({
          name: input.name,
          updatedAt: new Date(),
        })
        .where(eq(program.id, input.id))
        .returning()
        .then((rows) => rows[0]),
    ),

  // Delete a program
  delete: publicProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(({ ctx, input }) =>
      ctx.db.delete(program).where(eq(program.id, input.id)),
    ),
});
