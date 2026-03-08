import { createRouter } from "./trpc";

export const appRouter = createRouter({
  // ...
});
// Export type router type signature,
// NOT the router itself.
export type AppRouter = typeof appRouter;
