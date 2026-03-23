"use client";
import { DocxEditor } from "@eigenpal/docx-js-editor";
import "@eigenpal/docx-js-editor/styles.css";
import { Spinner } from "./ui/spinner";

export function Editor({ buffer }: { buffer: ArrayBuffer | undefined }) {
  return (
    <DocxEditor
      documentBuffer={buffer}
      showToolbar
      loadingIndicator={
        <div className="h-svh w-full flex items-center justify-center">
          <Spinner className="size-8" />
        </div>
      }
    />
  );
}
