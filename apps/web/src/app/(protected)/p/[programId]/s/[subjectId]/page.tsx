import { SubjectPage } from "@/components/subject/subject.page";

export default async function Page({
  params,
}: {
  params: Promise<{ subjectId: string }>;
}) {
  const { subjectId } = await params;
  return <SubjectPage {...{ subjectId }} />;
}
