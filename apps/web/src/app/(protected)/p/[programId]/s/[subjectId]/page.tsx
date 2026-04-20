import { SubjectWorkspacePage } from "@/components/subjects/subject-workspace.page";

export default async function Page({
  params,
}: {
  params: Promise<{ programId: string; subjectId: string }>;
}) {
  const { programId, subjectId } = await params;

  return (
    <SubjectWorkspacePage programId={programId} subjectId={subjectId} />
  );
}
