"use client";

import Format04 from "@/templates/format04";

export default function Format04Page() {
  return (
    <div>
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
  );
}
