import { initTRPC } from "@trpc/server";
import z, { ZodError } from "zod";
import type { db as DbType } from "./db";

// db is passed in at request time via createTRPCContext in the route handler
// Do NOT import db here — it causes a Turbopack circular initialization error
export type Context = {
  db: typeof DbType;
};

export const t = initTRPC.context<Context>().create({
  errorFormatter(opts) {
    const { shape, error } = opts;
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError:
          error.code === "BAD_REQUEST" && error.cause instanceof ZodError
            ? z.treeifyError(error.cause)
            : null,
      },
    };
  },
});

export const createRouter = t.router;
export const publicProcedure = t.procedure;