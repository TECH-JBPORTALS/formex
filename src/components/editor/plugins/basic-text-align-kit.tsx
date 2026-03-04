import { TextAlignPlugin } from "@platejs/basic-styles/react";
import { KEYS } from "platejs";

export const BasicTextAlignKit = TextAlignPlugin.configure({
  inject: {
    nodeProps: {
      nodeKey: "align",
      defaultNodeValue: "start",
      styleKey: "textAlign",
      validNodeValues: ["start", "left", "center", "right", "end", "justify"],
    },
    targetPlugins: [...KEYS.heading, KEYS.p],
  },
});
