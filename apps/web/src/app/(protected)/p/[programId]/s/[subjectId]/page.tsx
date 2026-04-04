import { SubjectPage } from "@/components/subjects/subjects.page";

export default async function Page({
  params,
}: {
  params: Promise<{ subjectId: string }>;
}) {
  const { subjectId } = await params;
  return <SubjectPage {...{ subjectId }} />;
}
