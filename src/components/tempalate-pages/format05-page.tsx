"use client";

import Format05 from "@/templates/format05";

export default function Format05Page() {
  return (
    <div>
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
  );
}
