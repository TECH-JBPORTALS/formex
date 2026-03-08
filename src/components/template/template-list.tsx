"use client";

import { useQuery } from "@tanstack/react-query";
import { useTRPC } from "@/trpc/client";

export function TemplateList() {
  const trpc = useTRPC();
  const { data: templates, isLoading } = useQuery(
    trpc.template.list.queryOptions(),
  );

  if (isLoading) return <div>Loading...</div>;
  return (
    <>
      {templates?.map((t) => (
        <div key={t.id}>{t.title}</div>
      ))}
    </>
  );
}
