import { studentRouter } from "./routers/student";
import { templateRouter } from "./routers/template";
import { timetableRouter } from "@/server/routers/timetable"; 
import { createRouter } from "./trpc";

export const appRouter = createRouter({
  template: templateRouter,
  student: studentRouter,
});
// Export type router type signature,
// NOT the router itself.
export type AppRouter = typeof appRouter;
