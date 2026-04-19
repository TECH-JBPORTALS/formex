import { SubjectFeedbackLinkReviewPage } from "@/components/subjects/subject-feedback-link-review.page";

export default async function Page({
  params,
}: {
  params: Promise<{ programId: string; subjectId: string }>;
}) {
  const { programId, subjectId } = await params;

  return (
    <SubjectFeedbackLinkReviewPage
      programId={programId}
      subjectId={subjectId}
    />
  );
}
