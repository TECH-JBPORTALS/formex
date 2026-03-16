"use client";

import Format02 from "@/templates/format02";

export default function Format02Page() {
  return (
    <div>
      <Format02
        data={{
          institutionName: "Government Polytechnic Bangalore",
          code: "GVT-001",
          email: "gpt.blr@dte.kar.nic.in",
          phone: "080-23456789",
          formNo: "002",
          revision: "01",
          date: "01-06-2024",
          program: "Diploma in Computer Science Engineering",
          visionOfProgram:
            "To produce competent computer science diploma engineers with strong technical skills and ethical values who contribute to the digital transformation of society.",
          missionOfProgram:
            "To provide quality education in computer science through updated curriculum, experienced faculty, and hands-on training.",
          peos: [
            {
              label: "PEO 1",
              description:
                "Apply technical knowledge to solve real-world computer science problems.",
            },
            {
              label: "PEO 2",
              description:
                "Demonstrate professional competence in software development and hardware maintenance.",
            },
            {
              label: "PEO 3",
              description:
                "Exhibit ethical behavior and effective communication in professional environments.",
            },
            {
              label: "PEO n",
              description:
                "Pursue lifelong learning and adapt to evolving technologies.",
            },
          ],
          consistencyRows: [
            { peo: "PEO 1", m1: "✓", m2: "✓", mn: "" },
            { peo: "PEO 2", m1: "✓", m2: "", mn: "✓" },
            { peo: "PEO 3", m1: "", m2: "✓", mn: "✓" },
            { peo: "PEO n", m1: "✓", m2: "✓", mn: "✓" },
          ],
        }}
      />
    </div>
  );
}
