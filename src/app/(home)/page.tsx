"use client";

import { useState } from "react";
import { Editor } from "@/components/editor";

export default function Page() {
  const [buffer, setBuffer] = useState<ArrayBuffer>();
  return (
    <div className="flex flex-col gap-3 items-center justify-center w-full min-h-full">
      <Editor setBuffer={setBuffer} buffer={buffer} />
    </div>
  );
}
