"use client";

import {
  DocxEditor,
  PluginHost,
  templatePlugin,
} from "@eigenpal/docx-js-editor";
import "@eigenpal/docx-js-editor/styles.css";
import type React from "react";
import { Spinner } from "./ui/spinner";

interface EditorProps extends React.ComponentProps<typeof DocxEditor> {}

export function Editor(editorProps: EditorProps) {
  return (
    <PluginHost plugins={[templatePlugin]}>
      <DocxEditor
        {...editorProps}
        showToolbar
        loadingIndicator={
          <div className="h-svh w-full flex items-center justify-center">
            <Spinner className="size-8" />
          </div>
        }
      />
    </PluginHost>
  );
}
