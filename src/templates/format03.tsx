import Image from "next/image";

export type Format03Event = {
  week: number;
  day: string;
  date: string;
  morningSession: string;
  afternoonSession: string;
};

export type Format03Data = {
  institutionName: string;
  code: string;
  academicYear: string;
  email?: string;
  phone?: string;
  formNo?: string;
  revision?: string;
  date?: string;
  logoUrl?: string;
  events: Format03Event[];
};

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

export default function Format03({ data }: { data: Format03Data }) {
  const weeks = Array.from(new Set(data.events.map((e) => e.week))).sort((a, b) => a - b);

  return (
    <div
      style={{
        width: "210mm",
        minHeight: "297mm",
        padding: "10mm 12mm",
        fontFamily: "Arial, sans-serif",
        fontSize: "9pt",
        backgroundColor: "white",
        boxSizing: "border-box",
        margin: "0 auto",
      }}
    >
      {/* ── HEADER ── */}
      <table style={{ width: "100%", borderCollapse: "collapse", border: "1px solid black", marginBottom: "10pt" }}>
        <tbody>
          <tr>
            <td style={{ width: "65pt", border: "1px solid black", textAlign: "center", verticalAlign: "middle", padding: "3pt" }}>
              {data.logoUrl ? (
                <Image src={data.logoUrl} alt="Logo" width={50} height={50} style={{ objectFit: "contain" }} unoptimized />
              ) : (
                <div style={{ width: "50pt", height: "50pt", display: "inline-block" }} />
              )}
            </td>
            <td style={{ border: "1px solid black", textAlign: "center", verticalAlign: "middle", padding: "3pt" }}>
              <div style={{ fontSize: "10.5pt" }}>GOVERNMENT OF KARNATAKA</div>
              <div style={{ fontSize: "8.5pt" }}>Department of Collegiate and Technical Education</div>
              <div style={{ fontWeight: "bold", fontSize: "9.5pt", marginTop: "2pt" }}>
                GOVERNMENT/ AIDED/PRIVATE POLYTECHNIC, {data.institutionName || "__________"}
              </div>
              <div style={{ fontSize: "9pt" }}>- 00000</div>
              <div style={{ fontSize: "8pt", marginTop: "2pt" }}>
                E-Mail: {data.email || "-Institute /Dept. / Faculty (Official ID)."}&nbsp;&nbsp; Phone: {data.phone || ""}
              </div>
            </td>
            <td style={{ width: "75pt", border: "1px solid black", verticalAlign: "top", padding: "4pt 5pt", fontSize: "8.5pt" }}>
              <div>Form No: {data.formNo ?? ""}</div>
              <div style={{ marginTop: "5pt" }}>Revision: {data.revision ?? ""}</div>
              <div style={{ marginTop: "5pt" }}>Date: {data.date ?? ""}</div>
            </td>
          </tr>
        </tbody>
      </table>

      {/* ── FORMAT TITLE ── */}
      <div style={{ textAlign: "center", marginBottom: "6pt" }}>
        <div style={{ fontWeight: "bold", fontSize: "10.5pt" }}>INS - FORMAT-3</div>
        <div style={{ fontWeight: "bold", fontSize: "10.5pt", marginTop: "2pt" }}>Academic Calendar of the Institution</div>
      </div>

      {/* ── META ROW ── */}
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: "9.5pt", marginBottom: "6pt", fontWeight: "bold" }}>
        <div>Institution Name: <span style={{ fontWeight: "normal" }}>{data.institutionName}</span></div>
        <div>Institution code: <span style={{ fontWeight: "normal" }}>{data.code}</span></div>
        <div>Academic year: <span style={{ fontWeight: "normal" }}>{data.academicYear}</span></div>
      </div>

      {/* ── CALENDAR TABLE ── */}
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "8.5pt", marginBottom: "8pt" }}>
        <thead>
          <tr>
            <th rowSpan={2} style={{ border: "1px solid black", textAlign: "center", padding: "3pt 4pt", width: "30pt", fontWeight: "bold" }}>Week</th>
            <th rowSpan={2} style={{ border: "1px solid black", textAlign: "center", padding: "3pt 4pt", width: "55pt", fontWeight: "bold" }}>Day</th>
            <th rowSpan={2} style={{ border: "1px solid black", textAlign: "center", padding: "3pt 4pt", width: "45pt", fontWeight: "bold" }}>Date</th>
            <th colSpan={2} style={{ border: "1px solid black", textAlign: "center", padding: "3pt 4pt", fontWeight: "bold" }}>Activities</th>
          </tr>
          <tr>
            <th style={{ border: "1px solid black", textAlign: "center", padding: "3pt 4pt", width: "50%", fontWeight: "bold" }}>Morning Session</th>
            <th style={{ border: "1px solid black", textAlign: "center", padding: "3pt 4pt", width: "50%", fontWeight: "bold" }}>Afternoon Session</th>
          </tr>
        </thead>
        <tbody>
          {weeks.map((week) => {
            const weekEvents = data.events.filter((e) => e.week === week);
            return DAYS.map((day, dayIdx) => {
              const ev = weekEvents.find((e) => e.day === day);
              const isSunday = day === "Sunday";
              return (
                <tr key={`${week}-${day}`} style={{ backgroundColor: isSunday ? "#BDD7EE" : "transparent" }}>
                  {dayIdx === 0 && (
                    <td rowSpan={7} style={{ border: "1px solid black", textAlign: "center", verticalAlign: "middle", padding: "3pt", fontWeight: "500" }}>
                      {week}
                    </td>
                  )}
                  <td style={{ border: "1px solid black", padding: "3pt 5pt" }}>{day}</td>
                  <td style={{ border: "1px solid black", padding: "3pt 5pt", textAlign: "center" }}>{ev?.date ?? ""}</td>
                  <td style={{ border: "1px solid black", padding: "3pt 5pt", wordBreak: "break-word" }}>{ev?.morningSession ?? ""}</td>
                  <td style={{ border: "1px solid black", padding: "3pt 5pt", wordBreak: "break-word" }}>{ev?.afternoonSession ?? ""}</td>
                </tr>
              );
            });
          })}
        </tbody>
      </table>

      {/* ── NOTE & SIGNATURE ── */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginTop: "10pt" }}>
        <div style={{ maxWidth: "68%", fontSize: "8.5pt" }}>
          <strong>Note</strong> All the Co-Curricular (Including Curriculum gap), Extra Curricular activities for odd &amp; even Semester are to be planned at the commencement the academic year in line with the BTE academic calendar of events.
        </div>
        <div style={{ fontSize: "9.5pt", fontWeight: "bold", textAlign: "right" }}>
          Signature of the Principal with Seal
        </div>
      </div>
    </div>
  );
}