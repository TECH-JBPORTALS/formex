import { template } from "../db/schema";
import { createRouter, publicProcedure } from "../trpc";

export const templateRouter = createRouter({
  new: publicProcedure.mutation(({ ctx }) =>
    ctx.db
      .insert(template)
      .values({ title: "Untitled" })
      .returning()
      .then((r) => r[0]),
  ),

  list: publicProcedure.query(({ ctx }) => ctx.db.query.template.findMany()),
});
