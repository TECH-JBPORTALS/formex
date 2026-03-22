import { TRPCError } from "@trpc/server";
import { UTFile } from "uploadthing/server";
import { template } from "../db/schema";
import { createTRPCRouter, protectedProcedure } from "../trpc";

export const templateRouter = createTRPCRouter({
  create: protectedProcedure.mutation(({ ctx }) =>
    ctx.db.transaction(async (tx) => {
      const newDocFile = new UTFile(
        ["Type you template here..."],
        "Untitled.doc",
      );

      const insertedFile = await ctx.utapi.uploadFiles(newDocFile);

      if (!insertedFile.data?.customId)
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Couldn't able to create new file at this moment!",
        });

      const newTemplate = await ctx.db
        .insert(template)
        .values({ title: "Untitled", fileId: insertedFile.data.customId });
    }),
  ),
});
