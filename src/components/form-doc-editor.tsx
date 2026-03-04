"use client";

import { type Value } from "platejs";
import { Plate, usePlateEditor } from "platejs/react";

import { Editor, EditorContainer } from "@/components/ui/editor";
import { FixedToolbar } from "@/components/ui/fixed-toolbar";
import { MarkToolbarButton } from "@/components/ui/mark-toolbar-button";
import { ToolbarButton, ToolbarGroup } from "./ui/toolbar";
import { AlignmentToggle } from "./ui/alignment-toggle";
import { EditorKit } from "./editor/editor-kit";

const initialValue: Value = [
  {
    type: "h4",
    children: [{ text: "INS Format 23" }],
  },
];

export default function FormDocEditor() {
  const editor = usePlateEditor({
    plugins: EditorKit, // Add the mark plugins
    value: initialValue, // Set initial content
  });

  return (
    <Plate editor={editor}>
      <FixedToolbar className="justify-center rounded-t-lg">
        <ToolbarGroup>
          <MarkToolbarButton nodeType="bold" tooltip="Bold (⌘+B)">
            B
          </MarkToolbarButton>
          <MarkToolbarButton nodeType="italic" tooltip="Italic (⌘+I)">
            I
          </MarkToolbarButton>
          <MarkToolbarButton nodeType="underline" tooltip="Underline (⌘+U)">
            U
          </MarkToolbarButton>
        </ToolbarGroup>
        <ToolbarGroup>
          <ToolbarButton
            onClick={() => editor.tf.toggleBlock("h2")}
            tooltip="Heading 2 (⌘+⌥+2)"
          >
            H2
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.tf.toggleBlock("h3")}
            tooltip="Heading 3 (⌘+⌥+3)"
          >
            H3
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.tf.toggleBlock("h4")}
            tooltip="Heading 4 (⌘+⌥+4)"
          >
            H4
          </ToolbarButton>
        </ToolbarGroup>
        <AlignmentToggle />
      </FixedToolbar>
      <div className="w-full flex flex-col items-center bg-zinc-100">
        {/* Provides editor context */}
        <EditorContainer className="h-svh w-1/2 shadow-md bg-white">
          {/* Styles the editor area */}
          <Editor placeholder="Type your amazing content here..." />
        </EditorContainer>
      </div>
    </Plate>
  );
}
