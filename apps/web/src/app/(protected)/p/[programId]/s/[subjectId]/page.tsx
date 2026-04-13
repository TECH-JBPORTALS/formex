import { BridgesBySubjectPage } from "@/components/bridges/bridges-by-subject.page";

export default async function Page({
  params,
}: {
  params: Promise<{ programId: string; subjectId: string }>;
}) {
  const { programId, subjectId } = await params;
  return <BridgesBySubjectPage programId={programId} subjectId={subjectId} />;
}
