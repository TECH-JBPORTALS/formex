import { asc, desc, eq } from "drizzle-orm";
import z from "zod";
import { template } from "../db/schema";
import { createRouter, publicProcedure } from "../trpc";

export const templateRouter = createRouter({
  new: publicProcedure.mutation(({ ctx }) =>
    ctx.db
      .insert(template)
      .values({ title: "Untitled", updatedAt: null })
      .returning()
      .then((r) => r[0]),
  ),

  list: publicProcedure.query(({ ctx }) =>
    ctx.db.query.template.findMany({
      orderBy: [asc(template.updatedAt), desc(template.createdAt)],
    }),
  ),

  getById: publicProcedure
    .input(z.object({ templateId: z.string() }))
    .query(({ ctx, input }) =>
      ctx.db.query.template.findFirst({
        where: eq(template.id, input.templateId),
      }),
    ),

  update: publicProcedure
    .input(
      z.object({
        stateJSON: z.any(),
        templateId: z.string().min(1),
      }),
    )
    .mutation(({ ctx, input }) =>
      ctx.db
        .update(template)
        .set({ stateJSON: input.stateJSON })
        .where(eq(template.id, input.templateId)),
    ),
});
