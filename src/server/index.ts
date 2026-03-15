import { courseReportRouter } from "./routers/course-report";
import { seminarRouter } from "./routers/seminar";
import { studentRouter } from "./routers/student";
import { templateRouter } from "./routers/template";
import { timetableRouter } from "@/server/routers/timetable";
import { programRouter } from "./routers/program";
import { createRouter } from "./trpc";

export const appRouter = createRouter({
  template: templateRouter,
  student: studentRouter,
  seminar: seminarRouter,
  courseReport: courseReportRouter,
  program: programRouter,
});

export type AppRouter = typeof appRouter;