import { templateRouter } from "./routers/template";
import { createRouter } from "./trpc";

export const appRouter = createRouter({
  template: templateRouter,
});
// Export type router type signature,
// NOT the router itself.
export type AppRouter = typeof appRouter;
