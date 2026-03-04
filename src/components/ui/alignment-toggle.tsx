import { useSelectionFragmentProp } from "platejs/react";
import {
  AlignCenterIcon,
  AlignJustifyIcon,
  AlignLeftIcon,
  AlignRightIcon,
} from "lucide-react";
import { ToolbarToggleGroup, ToolbarToggleItem } from "./toolbar";
import type { Alignment } from "@platejs/basic-styles";
import { useEditor } from "../editor/editor-kit";

const items = [
  {
    icon: AlignLeftIcon,
    value: "left",
  },
  {
    icon: AlignCenterIcon,
    value: "center",
  },
  {
    icon: AlignRightIcon,
    value: "right",
  },
  {
    icon: AlignJustifyIcon,
    value: "justify",
  },
];

export function AlignmentToggle() {
  const editor = useEditor();
  const alignment = (useSelectionFragmentProp({
    defaultValue: "start",
    getProp: (node) => node.align as string,
  }) ?? "start") as Alignment;

  return (
    <ToolbarToggleGroup value={alignment} type="single">
      {items.map((item) => (
        <ToolbarToggleItem
          key={item.value}
          value={item.value}
          onClick={() => {
            editor.tf.textAlign.setNodes(item.value as Alignment);
            editor.tf.focus();
          }}
        >
          <item.icon />
        </ToolbarToggleItem>
      ))}
    </ToolbarToggleGroup>
  );
}
