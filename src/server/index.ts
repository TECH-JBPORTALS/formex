import { studentRouter } from "./routers/student";
import { templateRouter } from "./routers/template";
import { createRouter } from "./trpc";

export const appRouter = createRouter({
  template: templateRouter,
  student: studentRouter,
});
// Export type router type signature,
// NOT the router itself.
export type AppRouter = typeof appRouter;
