import { courseReportRouter } from "./routers/course-report";
import { programRouter } from "./routers/program";
import { seminarRouter } from "./routers/seminar";
import { studentRouter } from "./routers/student";
import { createRouter } from "./trpc";

export const appRouter = createRouter({
  student: studentRouter,
  seminar: seminarRouter,
  courseReport: courseReportRouter,
  program: programRouter,
});

export type AppRouter = typeof appRouter;
