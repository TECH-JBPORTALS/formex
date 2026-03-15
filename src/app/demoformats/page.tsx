"use client";

import { printFormat } from "@/lib/pdf-generator";
import Format01 from "@/templates/format01";
import Format02 from "@/templates/format02";
import Format03 from "@/templates/format03";
import Format04 from "@/templates/format04";
import Format05 from "@/templates/format05";

export default function DemoPage() {
  return (
    <div style={{ backgroundColor: "#e5e7eb", padding: "24pt" }}>
      {/* ── FORMAT-01 ── */}
      <div style={{ marginBottom: "32pt" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "8pt",
          }}
        >
          <p
            style={{
              fontWeight: "bold",
              fontFamily: "Arial",
              fontSize: "14pt",
            }}
          >
            INS-FORMAT-01
          </p>
          <button
            type="button"
            onClick={() => printFormat("format-01")}
            style={{
              padding: "6pt 16pt",
              backgroundColor: "#1d4ed8",
              color: "white",
              border: "none",
              borderRadius: "4pt",
              cursor: "pointer",
              fontFamily: "Arial",
              fontSize: "9pt",
              fontWeight: "bold",
            }}
          >
            🖨 Print
          </button>
        </div>
        <div id="format-01" style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.15)" }}>
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
      </div>

      {/* ── FORMAT-02 ── */}
      <div style={{ marginBottom: "32pt" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "8pt",
          }}
        >
          <p
            style={{
              fontWeight: "bold",
              fontFamily: "Arial",
              fontSize: "14pt",
            }}
          >
            INS-FORMAT-02
          </p>
          <button
            type="button"
            onClick={() => printFormat("format-02")}
            style={{
              padding: "6pt 16pt",
              backgroundColor: "#1d4ed8",
              color: "white",
              border: "none",
              borderRadius: "4pt",
              cursor: "pointer",
              fontFamily: "Arial",
              fontSize: "9pt",
              fontWeight: "bold",
            }}
          >
            🖨 Print
          </button>
        </div>
        <div id="format-02" style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.15)" }}>
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
      </div>

      {/* ── FORMAT-03 ── */}
      <div style={{ marginBottom: "32pt" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "8pt",
          }}
        >
          <p
            style={{
              fontWeight: "bold",
              fontFamily: "Arial",
              fontSize: "14pt",
            }}
          >
            INS-FORMAT-03
          </p>
          <button
            type="button"
            onClick={() => printFormat("format-03")}
            style={{
              padding: "6pt 16pt",
              backgroundColor: "#1d4ed8",
              color: "white",
              border: "none",
              borderRadius: "4pt",
              cursor: "pointer",
              fontFamily: "Arial",
              fontSize: "9pt",
              fontWeight: "bold",
            }}
          >
            🖨 Print
          </button>
        </div>
        <div id="format-03" style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.15)" }}>
          <Format03
            data={{
              institutionName: "Government Polytechnic Bangalore",
              code: "GVT-001",
              academicYear: "2024-25",
              email: "gpt.blr@dte.kar.nic.in",
              phone: "080-23456789",
              formNo: "003",
              revision: "01",
              date: "01-06-2024",
              events: [
                {
                  week: 1,
                  day: "Monday",
                  date: "02-06-2024",
                  morningSession: "Orientation Program",
                  afternoonSession: "Campus Tour",
                },
                {
                  week: 1,
                  day: "Tuesday",
                  date: "03-06-2024",
                  morningSession: "Class Commencement",
                  afternoonSession: "Library Orientation",
                },
                {
                  week: 1,
                  day: "Wednesday",
                  date: "04-06-2024",
                  morningSession: "Regular Classes",
                  afternoonSession: "Regular Classes",
                },
                {
                  week: 1,
                  day: "Thursday",
                  date: "05-06-2024",
                  morningSession: "Regular Classes",
                  afternoonSession: "Regular Classes",
                },
                {
                  week: 1,
                  day: "Friday",
                  date: "06-06-2024",
                  morningSession: "Regular Classes",
                  afternoonSession: "Sports Activity",
                },
                {
                  week: 1,
                  day: "Saturday",
                  date: "07-06-2024",
                  morningSession: "Regular Classes",
                  afternoonSession: "",
                },
                {
                  week: 1,
                  day: "Sunday",
                  date: "08-06-2024",
                  morningSession: "",
                  afternoonSession: "",
                },
                {
                  week: 2,
                  day: "Monday",
                  date: "09-06-2024",
                  morningSession: "Regular Classes",
                  afternoonSession: "Regular Classes",
                },
                {
                  week: 2,
                  day: "Tuesday",
                  date: "10-06-2024",
                  morningSession: "Regular Classes",
                  afternoonSession: "Regular Classes",
                },
                {
                  week: 2,
                  day: "Wednesday",
                  date: "11-06-2024",
                  morningSession: "Regular Classes",
                  afternoonSession: "Regular Classes",
                },
                {
                  week: 2,
                  day: "Thursday",
                  date: "12-06-2024",
                  morningSession: "Regular Classes",
                  afternoonSession: "Regular Classes",
                },
                {
                  week: 2,
                  day: "Friday",
                  date: "13-06-2024",
                  morningSession: "Regular Classes",
                  afternoonSession: "Cultural Activity",
                },
                {
                  week: 2,
                  day: "Saturday",
                  date: "14-06-2024",
                  morningSession: "Regular Classes",
                  afternoonSession: "",
                },
                {
                  week: 2,
                  day: "Sunday",
                  date: "15-06-2024",
                  morningSession: "",
                  afternoonSession: "",
                },
              ],
            }}
          />
        </div>
      </div>

      {/* ── FORMAT-04 ── */}
      <div style={{ marginBottom: "32pt" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "8pt",
          }}
        >
          <p
            style={{
              fontWeight: "bold",
              fontFamily: "Arial",
              fontSize: "14pt",
            }}
          >
            INS-FORMAT-04
          </p>
          <button
            type="button"
            onClick={() => printFormat("format-04")}
            style={{
              padding: "6pt 16pt",
              backgroundColor: "#1d4ed8",
              color: "white",
              border: "none",
              borderRadius: "4pt",
              cursor: "pointer",
              fontFamily: "Arial",
              fontSize: "9pt",
              fontWeight: "bold",
            }}
          >
            🖨 Print
          </button>
        </div>
        <div id="format-04" style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.15)" }}>
          <Format04
            data={{
              institutionName: "Government Polytechnic Bangalore",
              code: "GVT-001",
              academicYear: "2024-25",
              email: "gpt.blr@dte.kar.nic.in",
              phone: "080-23456789",
              formNo: "004",
              revision: "01",
              date: "01-06-2024",
              events: [
                {
                  week: 1,
                  day: "Monday",
                  date: "02-06-2024",
                  morningSession: "Orientation Program",
                  afternoonSession: "Campus Tour",
                },
                {
                  week: 1,
                  day: "Tuesday",
                  date: "03-06-2024",
                  morningSession: "Class Commencement",
                  afternoonSession: "Library Orientation",
                },
                {
                  week: 1,
                  day: "Wednesday",
                  date: "04-06-2024",
                  morningSession: "Regular Classes",
                  afternoonSession: "Regular Classes",
                },
                {
                  week: 1,
                  day: "Thursday",
                  date: "05-06-2024",
                  morningSession: "Regular Classes",
                  afternoonSession: "Regular Classes",
                },
                {
                  week: 1,
                  day: "Friday",
                  date: "06-06-2024",
                  morningSession: "Regular Classes",
                  afternoonSession: "Sports Activity",
                },
                {
                  week: 1,
                  day: "Saturday",
                  date: "07-06-2024",
                  morningSession: "Regular Classes",
                  afternoonSession: "",
                },
                {
                  week: 1,
                  day: "Sunday",
                  date: "08-06-2024",
                  morningSession: "",
                  afternoonSession: "",
                },
                {
                  week: 2,
                  day: "Monday",
                  date: "09-06-2024",
                  morningSession: "Regular Classes",
                  afternoonSession: "Regular Classes",
                },
                {
                  week: 2,
                  day: "Tuesday",
                  date: "10-06-2024",
                  morningSession: "Regular Classes",
                  afternoonSession: "Regular Classes",
                },
                {
                  week: 2,
                  day: "Wednesday",
                  date: "11-06-2024",
                  morningSession: "Regular Classes",
                  afternoonSession: "Regular Classes",
                },
                {
                  week: 2,
                  day: "Thursday",
                  date: "12-06-2024",
                  morningSession: "Regular Classes",
                  afternoonSession: "Regular Classes",
                },
                {
                  week: 2,
                  day: "Friday",
                  date: "13-06-2024",
                  morningSession: "Regular Classes",
                  afternoonSession: "Cultural Activity",
                },
                {
                  week: 2,
                  day: "Saturday",
                  date: "14-06-2024",
                  morningSession: "Regular Classes",
                  afternoonSession: "",
                },
                {
                  week: 2,
                  day: "Sunday",
                  date: "15-06-2024",
                  morningSession: "",
                  afternoonSession: "",
                },
              ],
            }}
          />
        </div>
      </div>

      {/* ── FORMAT-05 ── */}
      <div style={{ marginBottom: "32pt" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "8pt",
          }}
        >
          <p
            style={{
              fontWeight: "bold",
              fontFamily: "Arial",
              fontSize: "14pt",
            }}
          >
            INS-FORMAT-05
          </p>
          <button
            type="button"
            onClick={() => printFormat("format-05")}
            style={{
              padding: "6pt 16pt",
              backgroundColor: "#1d4ed8",
              color: "white",
              border: "none",
              borderRadius: "4pt",
              cursor: "pointer",
              fontFamily: "Arial",
              fontSize: "9pt",
              fontWeight: "bold",
            }}
          >
            🖨 Print
          </button>
        </div>
        <div id="format-05" style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.15)" }}>
          <Format05
            data={{
              institutionName: "Government Polytechnic Bangalore",
              code: "GVT-001",
              academicYear: "2024-25",
              withEffectFrom: "02-06-2024",
              email: "gpt.blr@dte.kar.nic.in",
              phone: "080-23456789",
              formNo: "005",
              revision: "01",
              date: "01-06-2024",
              yearFrom: "2024",
              yearTo: "2025",
              program: "Diploma in Computer Science Engineering",
              semester: "3rd Semester",
              lhDhNo: "CSE-301",
              rows: [
                {
                  day: "TIME",
                  period1: "8:30-9:30",
                  period2: "9:30-10:30",
                  period3: "10:30-11:30",
                  period4: "11:30-12:30",
                  period5: "1:30-2:30",
                  period6: "2:30-3:30",
                  period7: "3:30-4:30",
                },
                {
                  day: "MON",
                  period1: "Maths",
                  period2: "Physics",
                  period3: "C Programming",
                  period4: "English",
                  period5: "DBMS",
                  period6: "Lab",
                  period7: "Lab",
                },
                {
                  day: "TUE",
                  period1: "C Programming",
                  period2: "Maths",
                  period3: "Physics",
                  period4: "DBMS",
                  period5: "English",
                  period6: "Lab",
                  period7: "Lab",
                },
                {
                  day: "WED",
                  period1: "Physics",
                  period2: "DBMS",
                  period3: "Maths",
                  period4: "C Programming",
                  period5: "Maths",
                  period6: "English",
                  period7: "Lab",
                },
                {
                  day: "THU",
                  period1: "DBMS",
                  period2: "English",
                  period3: "Physics",
                  period4: "Maths",
                  period5: "C Programming",
                  period6: "Lab",
                  period7: "Lab",
                },
                {
                  day: "FRI",
                  period1: "English",
                  period2: "C Programming",
                  period3: "DBMS",
                  period4: "Physics",
                  period5: "Maths",
                  period6: "Lab",
                  period7: "Lab",
                },
                {
                  day: "SAT",
                  period1: "Maths",
                  period2: "Physics",
                  period3: "C Programming",
                  period4: "DBMS",
                  period5: "",
                  period6: "",
                  period7: "",
                },
              ],
            }}
          />
        </div>
      </div>
    </div>
  );
}
