import { BasicTextAlignKit } from "./plugins/basic-text-align-kit";
import { BasicNodesKit } from "./plugins/basic-nodes-kit";
import type { Value } from "platejs";
import { useEditorRef, type TPlateEditor } from "platejs/react";

export const EditorKit = [...BasicNodesKit, BasicTextAlignKit];

export type Editor = TPlateEditor<Value, (typeof EditorKit)[number]>;
export const useEditor = useEditorRef<Editor>;
