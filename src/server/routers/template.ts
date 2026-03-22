import { createId } from "@paralleldrive/cuid2";
import { TRPCError } from "@trpc/server";
import { Document, Packer, Paragraph } from "docx";
import { UTFile } from "uploadthing/server";
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

      const blob = await Packer.toBlob(doc);

      const newDocFile = new UTFile([blob], "Untitled.docx", {
        customId: createId(),
        type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      });

      const insertedFile = await ctx.utapi.uploadFiles(newDocFile);

      if (!insertedFile.data?.customId || insertedFile.error)
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: insertedFile.error?.message,
        });

      const newTemplate = await tx
        .insert(template)
        .values({ title: "Untitled", fileId: insertedFile.data.customId })
        .returning();

      if (!newTemplate[0])
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Couldn't able to create new file at this moment!",
        });

      return newTemplate[0];
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

        const file = await ctx.utapi.getSignedURL(template.fileId, {
          keyType: "customId",
        });

        return {
          template,
          file,
        };
      }),
    ),
});
