"use client";

import { CalendarDays, NotebookPen } from "lucide-react";
import Container from "@/components/container";
import { CalendarUploadCard } from "@/components/dashboard/calendar-upload-card";
import { FeedbackQuestionsCard } from "@/components/dashboard/feedback-questions-card";
import Header from "@/components/header";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb";

export function PrincipalDashboard() {
  return (
    <>
      <Header>
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbPage>Home</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </Header>

      <Container className="py-6 md:py-8">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 md:gap-8">
          <div className="grid auto-rows-fr grid-cols-1 gap-6 md:grid-cols-2 md:gap-6 lg:gap-8">
            <FeedbackQuestionsCard className="h-full min-h-0 md:col-span-2" />
            <CalendarUploadCard
              className="h-full min-h-0"
              kind="dcet_events"
              title="DCET Calendar of Events"
              description="One file per institution (PDF or image). Replace or remove anytime."
              icon={<CalendarDays className="size-5" strokeWidth={1.75} />}
            />
            <CalendarUploadCard
              className="h-full min-h-0"
              kind="academic_calendar"
              title="Academic Calendar"
              description="One file per institution (PDF or image). Replace or remove anytime."
              icon={<NotebookPen className="size-5" strokeWidth={1.75} />}
            />
          </div>
        </div>
      </Container>
    </>
  );
}
