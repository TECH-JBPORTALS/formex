import { initTRPC } from "@trpc/server";
import z, { ZodError } from "zod";

// Lazy import — db is resolved at call-time, not at module evaluation time.
// This breaks the Turbopack circular initialization chain:
// routers → db/schema → db/index → trpc → (already evaluating) → ❌
// With lazy import, trpc.ts has zero top-level side-effects from db.
const getDb = () => import("./db").then((m) => m.db);

export const createTRPCContext = async () => {
  return { db: await getDb() };
};

export type Context = Awaited<ReturnType<typeof createTRPCContext>>;

const t = initTRPC.context<Context>().create({
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
