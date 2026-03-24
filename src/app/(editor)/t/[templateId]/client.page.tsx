"use client";

import type { DocxEditorRef } from "@eigenpal/docx-js-editor";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Editor } from "@/components/editor";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { useTRPC } from "@/trpc/client";

export function ClientPage() {
  const { templateId } = useParams<{ templateId: string }>();
  const trpc = useTRPC();
  const editorRef = useRef<DocxEditorRef>(null);
  const { data, isLoading } = useQuery(
    trpc.template.getById.queryOptions({ templateId }),
  );
  const { mutateAsync: updateTemplate } = useMutation(
    trpc.template.update.mutationOptions({
      onSuccess() {
        toast.success("File saved successful");
      },
    }),
  );

  const [document, setDocument] = useState<Blob>();
  const [saving, setSaving] = useState(false);

  const onSave = useCallback(async () => {
    setSaving(true);
    if (editorRef.current) await editorRef.current.save();
    setSaving(false);
  }, []);

  useEffect(() => {
    if (data?.file) {
      const blob = new Blob([new Uint8Array(data.file)], {
        type: data.mimeType,
      });
      setDocument(blob);
    }
  }, [data?.file, data?.mimeType]);

  if (isLoading)
    return (
      <div className="h-svh w-full flex items-center justify-center">
        <Spinner className="size-8" />
      </div>
    );

  return (
    <Editor
      ref={editorRef}
      documentBuffer={document}
      onSave={async (buffer) => {
        const uint8 = new Uint8Array(buffer);

        await updateTemplate({
          templateId,
          docBuffer: Array.from(uint8), // ✅ correct
        });
      }}
      renderTitleBarRight={() => (
        <div className="space-x-2.5">
          <Button disabled={saving} onClick={onSave} size={"lg"}>
            {saving ? "Saving..." : "Save"}
          </Button>
        </div>
      )}
    />
  );
}
