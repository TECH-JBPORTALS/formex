"use client";

import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Editor } from "@/components/editor";
import { useTRPC } from "@/trpc/client";

export function ClientPage() {
  const { templateId } = useParams<{ templateId: string }>();
  const trpc = useTRPC();
  const { data, isLoading } = useQuery(
    trpc.template.getById.queryOptions({ templateId }),
  );
  const [buffer, setBuffer] = useState<ArrayBuffer>();
  const [isBufferLoading, setBufferLoading] = useState(false);

  useEffect(() => {
    if (!isLoading && data?.file) {
      setBufferLoading(true);
      fetch(data.file.url)
        .then((res) => res.arrayBuffer())
        .then(setBuffer)
        .finally(() => setBufferLoading(false));
    }
  }, [isLoading, data?.file]);

  if (isLoading || isBufferLoading)
    return (
      <div className="h-svh flex items-center justify-center">
        Template Loading...
      </div>
    );

  return <Editor buffer={buffer} />;
}
