"use client";

import Format01 from "@/templates/format01";

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
          vision:
            "To be a centre of excellence in technical education, producing competent diploma engineers with strong ethical values, ready to contribute to the technological and economic development of the nation.",
          mission:
            "To impart quality technical education through well-qualified faculty, state-of-the-art infrastructure, and industry-aligned curriculum. To nurture innovation, critical thinking, and professional ethics among students.",
        }}
      />
    </div>
  );
}
