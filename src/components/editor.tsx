"use client";
import { DocxEditor } from "@eigenpal/docx-js-editor";
import "@eigenpal/docx-js-editor/styles.css";

export function Editor({
  buffer,
  setBuffer,
}: {
  buffer: ArrayBuffer | undefined;
  setBuffer: (buffer: ArrayBuffer | undefined) => void;
}) {
  return (
    <DocxEditor
      documentBuffer={buffer}
      onChange={(d) => {
        setBuffer(d.originalBuffer);
      }}
      showToolbar
    />
  );
}
