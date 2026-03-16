import { notFound } from "next/navigation";
import { PDFPreview } from "@/components/pdf-preview";
import { getTemplatePage } from "@/components/tempalate-pages";

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const format = getTemplatePage(slug);

  if (!format) notFound();

  return (
    <PDFPreview>
      <format.page />
    </PDFPreview>
  );
}
