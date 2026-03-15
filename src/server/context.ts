// Separated from trpc.ts to break Turbopack circular initialization:
// trpc.ts must NOT import from ./db — doing so creates a cycle:
// courseReport → db/schema → db/index → trpc → routers → index
import { db } from "./db";

export const createTRPCContext = async () => {
  return { db };
};