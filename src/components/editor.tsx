"use client";
import { DocxEditor } from "@eigenpal/docx-js-editor";
import "@eigenpal/docx-js-editor/styles.css";

export function Editor({ buffer }: { buffer: ArrayBuffer | undefined }) {
  return <DocxEditor documentBuffer={buffer} showToolbar />;
}
