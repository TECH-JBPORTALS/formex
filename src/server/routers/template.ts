import { TRPCError } from "@trpc/server";
import { Document, Packer, Paragraph } from "docx";
import { z } from "zod/v4";
import { template } from "../db/schema";
import { createTRPCRouter, protectedProcedure } from "../trpc";

export const templateRouter = createTRPCRouter({
  create: protectedProcedure.mutation(({ ctx }) => {
    return ctx.db.transaction(async (tx) => {
      const doc = new Document({
        sections: [
          {
            children: [new Paragraph("Type your template here...")],
          },
        ],
      });

      const file = await Packer.toBuffer(doc);

      const newTemplate = await tx
        .insert(template)
        .values({
          title: "Untitled",
          file,
          mimeType:
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        })
        .returning({ id: template.id, title: template.title });

      if (!newTemplate[0])
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Couldn't able to create new file at this moment!",
        });

      return newTemplate[0];
    });
  }),

  update: protectedProcedure
    .input(
      z.object({
        templateId: z.string(),
        docBuffer: z.array(z.number()),
        title: z.string().optional(),
      }),
    )
    .mutation(({ ctx, input }) => {
      return ctx.db.transaction(async (tx) => {
        const singleTemplate = await tx.query.template.findFirst({
          where: ({ id }, { eq }) => eq(id, input.templateId),
        });

        if (!singleTemplate)
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "No template found",
          });

        const title = input.title ?? singleTemplate.title;

        await tx
          .update(template)
          .set({ title, file: Buffer.from(input.docBuffer) })
          .returning();
      });
    }),

  getById: protectedProcedure
    .input(z.object({ templateId: z.string() }))
    .query(({ ctx, input }) =>
      ctx.db.transaction(async (tx) => {
        const template = await tx.query.template.findFirst({
          where: ({ id }, { eq }) => eq(id, input.templateId),
        });

        if (!template)
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "No template found",
          });

        return { ...template, file: Array.from(template.file) };
      }),
    ),

  list: protectedProcedure.query(({ ctx }) =>
    ctx.db.query.template.findMany({
      columns: {
        file: false,
      },
      orderBy: ({ createdAt }, { desc }) => desc(createdAt),
    }),
  ),
});
