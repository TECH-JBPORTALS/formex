import { notFound } from "next/navigation";
import type { ComponentType } from "react";
import Format01Page from "@/components/tempalate-pages/format01-page";
import Format02Page from "@/components/tempalate-pages/format02-page";
import Format03Page from "@/components/tempalate-pages/format03-page";
import Format04Page from "@/components/tempalate-pages/format04-page";
import Format05Page from "@/components/tempalate-pages/format05-page";

const bySlug: Record<string, ComponentType> = {
  "format-01": Format01Page,
  "format-02": Format02Page,
  "format-03": Format03Page,
  "format-04": Format04Page,
  "format-05": Format05Page,
};

export default async function FormatRoutePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const Comp = bySlug[slug];
  if (!Comp) {
    notFound();
  }
  return <Comp />;
}
