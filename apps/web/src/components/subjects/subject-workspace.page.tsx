"use client";

import Link from "next/link";
import { parseAsString, throttle, useQueryState } from "nuqs";
import Container from "@/components/container";
import { CourseMonthlyAttendanceBySubjectSection } from "@/components/course-monthly-attendance/course-monthly-attendance-by-subject.section";
import { CourseOutcomesBySubjectSection } from "@/components/course-outcomes/course-outcomes-by-subject.section";
import Header from "@/components/header";
import { ResultAnalysisBySubjectSection } from "@/components/result-analysis/result-analysis-by-subject.section";
import { SpinnerPage } from "@/components/spinner-page";
import { SubjectFeedbackLinkReviewPage } from "@/components/subjects/subject-feedback-link-review.page";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useSubjectsShow } from "@/lib/api/generated/subject/subject";
import { useProgramsShow } from "@/lib/api/hooks/useProgramsShow";

export function SubjectWorkspacePage({
  programId,
  subjectId,
}: {
  programId: string;
  subjectId: string;
}) {
  const [section, setSection] = useQueryState(
    "section",
    parseAsString
      .withDefault("course-outcomes")
      .withOptions({ limitUrlUpdates: throttle(300) }),
  );

  const { data: program } = useProgramsShow(programId);
  const subjectQuery = useSubjectsShow(subjectId, {
    query: { enabled: !!subjectId },
  });
  const subject =
    subjectQuery.data?.status === 200 ? subjectQuery.data.data.data : null;
  const activeSection =
    section === "student-feedback"
      ? "student-feedback"
      : section === "monthly-attendance"
        ? "monthly-attendance"
        : section === "result-analysis"
          ? "result-analysis"
          : "course-outcomes";

  return (
    <>
      <Header>
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href="/">Home</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href={`/p/${programId}`}>
                  {program?.name ?? "Program"}
                </Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href={`/p/${programId}/subjects`}>Subjects</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{subject?.name ?? "Subject"}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </Header>

      <Tabs
        value={activeSection}
        onValueChange={(value) => void setSection(value)}
      >
        <TabsList
          variant="line"
          className="w-full justify-start border-b group-data-horizontal/tabs:h-12"
        >
          <TabsTrigger value="course-outcomes">Course Outcomes</TabsTrigger>
          <TabsTrigger value="monthly-attendance">
            Monthly Attendance
          </TabsTrigger>
          <TabsTrigger value="result-analysis">Result Analysis</TabsTrigger>
          <TabsTrigger value="student-feedback">Student Feedback</TabsTrigger>
        </TabsList>
      </Tabs>
      <Container>
        <div className="mt-4">
          {activeSection === "course-outcomes" ? (
            subjectQuery.isLoading ? (
              <SpinnerPage />
            ) : (
              <CourseOutcomesBySubjectSection subjectId={subjectId} />
            )
          ) : activeSection === "monthly-attendance" ? (
            subjectQuery.isLoading ? (
              <SpinnerPage />
            ) : (
              <CourseMonthlyAttendanceBySubjectSection
                programId={programId}
                subjectId={subjectId}
              />
            )
          ) : activeSection === "result-analysis" ? (
            subjectQuery.isLoading ? (
              <SpinnerPage />
            ) : (
              <ResultAnalysisBySubjectSection
                programId={programId}
                subjectId={subjectId}
              />
            )
          ) : (
            <SubjectFeedbackLinkReviewPage
              programId={programId}
              subjectId={subjectId}
              hidePageShell
            />
          )}
        </div>
      </Container>
    </>
  );
}
