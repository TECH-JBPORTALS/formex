"use client";

import Format01 from "@/templates/format01";
import { RightPanel } from "../right-panel";

export default function Format01Page() {
  return (
    <div>
      <Format01
        data={{
          institutionName: "Government Polytechnic Bangalore",
          code: "GVT-001",
          email: "gpt.blr@dte.kar.nic.in",
          phone: "080-23456789",
          formNo: "001",
          revision: "01",
          date: "01-06-2024",
        }}
      />
      <RightPanel />
    </div>
  );
}
