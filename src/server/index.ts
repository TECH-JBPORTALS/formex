import { courseReportRouter } from "./routers/course-report";
import { programRouter } from "./routers/program";
import { seminarRouter } from "./routers/seminar";
import { studentRouter } from "./routers/student";
import { templateRouter } from "./routers/template";
import { createTRPCRouter } from "./trpc";

export const appRouter = createTRPCRouter({
  student: studentRouter,
  seminar: seminarRouter,
  courseReport: courseReportRouter,
  program: programRouter,
  template: templateRouter,
});

export type AppRouter = typeof appRouter;
