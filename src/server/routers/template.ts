import { asc, desc, eq } from "drizzle-orm";
import z from "zod";
import { template } from "../db/schema";
import { createRouter, publicProcedure } from "../trpc";
import { renderFormat01 } from "@/templates/rendeFormat01";

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
      orderBy: [desc(template.updatedAt)],
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

  generatePDF: publicProcedure
    .input(
      z.object({
        code: z.string(),
        institutionName: z.string(),
        vision: z.string(),
        mission: z.string(),
      }),
    )
    .mutation(async ({ ctx }) => {
      const html = renderFormat01(data);

      const pdf = await generatePDF(html);

      return pdf;
    }),
});
