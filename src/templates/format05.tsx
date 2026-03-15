import Image from "next/image";

export type TimetableDay = "TIME" | "MON" | "TUE" | "WED" | "THU" | "FRI" | "SAT";

export type Format05Row = {
  day: TimetableDay;
  period1: string;
  period2: string;
  period3: string;
  period4: string;
  period5: string;
  period6: string;
  period7: string;
};

export type Format05Data = {
  institutionName: string;
  code: string;
  academicYear: string;
  withEffectFrom: string;
  email?: string;
  phone?: string;
  formNo?: string;
  revision?: string;
  date?: string;
  logoUrl?: string;
  yearFrom: string;
  yearTo: string;
  program: string;
  semester: string;
  lhDhNo: string;
  rows: Format05Row[];
};

const DAY_ORDER: TimetableDay[] = ["TIME", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

export default function Format05({ data }: { data: Format05Data }) {
  const getRow = (day: TimetableDay): Format05Row =>
    data.rows.find((r) => r.day === day) ?? {
      day,
      period1: "",
      period2: "",
      period3: "",
      period4: "",
      period5: "",
      period6: "",
      period7: "",
    };

  const cell: React.CSSProperties = {
    border: "1px solid black",
    padding: "6pt 3pt",
    textAlign: "center",
    fontSize: "8pt",
    verticalAlign: "middle",
    wordBreak: "break-word",
  };

  const headerCell: React.CSSProperties = {
    ...cell,
    fontWeight: "bold",
    fontSize: "8.5pt",
  };

  return (
    <div
      style={{
        width: "297mm",
        minHeight: "210mm",
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
        <div style={{ fontWeight: "bold", fontSize: "10.5pt" }}>INS - FORMAT-5</div>
        <div style={{ fontWeight: "bold", fontSize: "10.5pt", marginTop: "2pt" }}>
          Class Time Table for The Year: {data.yearFrom || "202 _"}- {data.yearTo || "202 _"}
        </div>
      </div>

      {/* ── META ROW 1 ── */}
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: "9.5pt", marginBottom: "5pt", fontWeight: "bold" }}>
        <div>Institution Name: <span style={{ fontWeight: "normal" }}>{data.institutionName}</span></div>
        <div>Institution code: <span style={{ fontWeight: "normal" }}>{data.code}</span></div>
        <div>Academic year: <span style={{ fontWeight: "normal" }}>{data.academicYear}</span></div>
        <div>With effect from: <span style={{ fontWeight: "normal" }}>{data.withEffectFrom}</span></div>
      </div>

      {/* ── META ROW 2 ── */}
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: "9.5pt", marginBottom: "10pt", fontWeight: "bold" }}>
        <div>Name of the Program: <span style={{ fontWeight: "normal" }}>{data.program}</span></div>
        <div>Semester: <span style={{ fontWeight: "normal" }}>{data.semester}</span></div>
        <div>L.H./DH No: <span style={{ fontWeight: "normal" }}>{data.lhDhNo}</span></div>
      </div>

      {/* ── TIMETABLE ── */}
      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          fontSize: "8.5pt",
          marginBottom: "10pt",
          tableLayout: "fixed",
        }}
      >
        <colgroup>
          <col style={{ width: "7%" }} />
          <col style={{ width: "8%" }} />
          <col style={{ width: "9.5%" }} />
          <col style={{ width: "9.5%" }} />
          <col style={{ width: "9.5%" }} />
          <col style={{ width: "9.5%" }} />
          <col style={{ width: "5%" }} />
          <col style={{ width: "9.5%" }} />
          <col style={{ width: "9.5%" }} />
          <col style={{ width: "9.5%" }} />
        </colgroup>
        <thead>
          <tr>
            <th style={headerCell}>DAY</th>
            <th style={headerCell}>PERIOD</th>
            <th style={headerCell}>1</th>
            <th style={headerCell}>2</th>
            <th style={headerCell}>3</th>
            <th style={headerCell}>4</th>
            <th
              style={{
                ...headerCell,
                writingMode: "vertical-rl",
                textOrientation: "mixed",
                transform: "rotate(180deg)",
                whiteSpace: "nowrap",
                padding: "8pt 3pt",
                fontSize: "7.5pt",
              }}
              rowSpan={DAY_ORDER.length + 1}
            >
              LUNCH BREAK
            </th>
            <th style={headerCell}>5</th>
            <th style={headerCell}>6</th>
            <th style={headerCell}>7</th>
          </tr>
        </thead>
        <tbody>
          {DAY_ORDER.map((day) => {
            const row = getRow(day);
            return (
              <tr key={day}>
                <td style={{ ...cell, fontWeight: "bold", fontSize: "8.5pt" }}>{day}</td>
                <td style={{ ...cell, fontWeight: day === "TIME" ? "bold" : "normal" }}>
                  {day === "TIME" ? "TIME" : ""}
                </td>
                <td style={cell}>{row.period1}</td>
                <td style={cell}>{row.period2}</td>
                <td style={cell}>{row.period3}</td>
                <td style={cell}>{row.period4}</td>
                <td style={cell}>{row.period5}</td>
                <td style={cell}>{row.period6}</td>
                <td style={cell}>{row.period7}</td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* ── NOTES ── */}
      <div style={{ fontSize: "8.5pt", marginBottom: "16pt" }}>
        <div><strong>Note :1)</strong> Duration of each period is one hour.</div>
        <div style={{ marginLeft: "32pt" }}><strong>2)</strong> Monday to Friday contact hours - 7 Hours</div>
        <div style={{ marginLeft: "32pt" }}><strong>3)</strong> Saturday Contact Hours – 5 hours</div>
        <div style={{ marginLeft: "32pt" }}><strong>4)</strong> Total Contact Hours / week – 40 Hours.</div>
      </div>

      {/* ── SIGNATURES ── */}
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: "9.5pt", fontWeight: "bold" }}>
        <div>Signature of the Program coordinator with Seal</div>
        <div>Signature of Principal with Seal</div>
      </div>
    </div>
  );
}