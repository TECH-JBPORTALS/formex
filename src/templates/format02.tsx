import Image from "next/image";

export type Format02Data = {
  institutionName: string;
  code: string;
  email?: string;
  phone?: string;
  formNo?: string;
  revision?: string;
  date?: string;
  logoUrl?: string;
  program: string;
  visionOfProgram: string;
  missionOfProgram: string;
  peos: { label: string; description: string }[];
  consistencyRows: { peo: string; m1: string; m2: string; mn: string }[];
};

export default function Format02({ data }: { data: Format02Data }) {
  return (
    <div
      style={{
        width: "210mm",
        minHeight: "297mm",
        padding: "10mm 15mm",
        fontFamily: "Arial, sans-serif",
        fontSize: "10pt",
        backgroundColor: "white",
        boxSizing: "border-box",
        margin: "0 auto",
      }}
    >
      {/* ── HEADER ── */}
      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          border: "1px solid black",
          marginBottom: "14pt",
        }}
      >
        <tbody>
          <tr>
            <td
              style={{
                width: "70pt",
                border: "1px solid black",
                textAlign: "center",
                verticalAlign: "middle",
                padding: "4pt",
              }}
            >
              {data.logoUrl ? (
                <Image
                  src={data.logoUrl}
                  alt="Logo"
                  width={55}
                  height={55}
                  style={{ objectFit: "contain" }}
                  unoptimized
                />
              ) : (
                <div
                  style={{
                    width: "55pt",
                    height: "55pt",
                    display: "inline-block",
                  }}
                />
              )}
            </td>
            <td
              style={{
                border: "1px solid black",
                textAlign: "center",
                verticalAlign: "middle",
                padding: "4pt",
              }}
            >
              <div style={{ fontSize: "11pt" }}>GOVERNMENT OF KARNATAKA</div>
              <div style={{ fontSize: "9pt" }}>
                Department of Collegiate and Technical Education
              </div>
              <div
                style={{
                  fontWeight: "bold",
                  fontSize: "10pt",
                  marginTop: "2pt",
                }}
              >
                GOVERNMENT/ AIDED/PRIVATE POLYTECHNIC,{" "}
                {data.institutionName || "__________"}
              </div>
              <div style={{ fontSize: "10pt" }}>- 00000</div>
              <div style={{ fontSize: "8.5pt", marginTop: "2pt" }}>
                E-Mail:{" "}
                {data.email || "-Institute /Dept. / Faculty (Official ID)."}
                &nbsp;&nbsp; Phone: {data.phone || ""}
              </div>
            </td>
            <td
              style={{
                width: "80pt",
                border: "1px solid black",
                verticalAlign: "top",
                padding: "4pt 6pt",
                fontSize: "9pt",
              }}
            >
              <div>Form No: {data.formNo ?? ""}</div>
              <div style={{ marginTop: "6pt" }}>
                Revision: {data.revision ?? ""}
              </div>
              <div style={{ marginTop: "6pt" }}>Date: {data.date ?? ""}</div>
            </td>
          </tr>
        </tbody>
      </table>

      {/* ── FORMAT TITLE ── */}
      <div style={{ textAlign: "center", marginBottom: "10pt" }}>
        <div style={{ fontWeight: "bold", fontSize: "11pt" }}>
          INS - FORMAT-2
        </div>
      </div>

      {/* ── INSTITUTION NAME, CODE, PROGRAM ── */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: "6pt",
          fontSize: "10pt",
        }}
      >
        <div>
          <strong>Institution Name:</strong>{" "}
          <span
            style={{
              borderBottom: "1px solid black",
              minWidth: "140pt",
              display: "inline-block",
            }}
          >
            {data.institutionName}
          </span>
        </div>
        <div>
          <strong>Institution code:</strong>{" "}
          <span
            style={{
              borderBottom: "1px solid black",
              minWidth: "80pt",
              display: "inline-block",
            }}
          >
            {data.code}
          </span>
        </div>
      </div>
      <div style={{ fontSize: "10pt", marginBottom: "12pt" }}>
        <strong>Program:</strong>{" "}
        <span
          style={{
            borderBottom: "1px solid black",
            minWidth: "200pt",
            display: "inline-block",
          }}
        >
          {data.program}
        </span>
      </div>

      {/* ── MAIN TITLE ── */}
      <div
        style={{
          textAlign: "center",
          fontWeight: "bold",
          fontSize: "11pt",
          marginBottom: "16pt",
        }}
      >
        Vision, Mission, And Program Education Objectives of the Program
      </div>

      {/* ── VISION ── */}
      <div style={{ marginBottom: "20pt" }}>
        <div
          style={{ fontWeight: "bold", fontSize: "10pt", marginBottom: "8pt" }}
        >
          &nbsp;Vision of the Program:
        </div>
        <div
          style={{
            fontSize: "10pt",
            lineHeight: "1.8",
            minHeight: "50pt",
            paddingLeft: "4pt",
            whiteSpace: "pre-wrap",
            wordBreak: "break-word",
          }}
        >
          {data.visionOfProgram}
        </div>
      </div>

      {/* ── MISSION ── */}
      <div style={{ marginBottom: "20pt" }}>
        <div
          style={{ fontWeight: "bold", fontSize: "10pt", marginBottom: "8pt" }}
        >
          Mission of the program:
        </div>
        <div
          style={{
            fontSize: "10pt",
            lineHeight: "1.8",
            minHeight: "50pt",
            paddingLeft: "4pt",
            whiteSpace: "pre-wrap",
            wordBreak: "break-word",
          }}
        >
          {data.missionOfProgram}
        </div>
      </div>

      {/* ── PEOs ── */}
      <div style={{ marginBottom: "16pt" }}>
        <div
          style={{ fontWeight: "bold", fontSize: "10pt", marginBottom: "8pt" }}
        >
          Program Education Objectives (PEO):
        </div>
        {data.peos.map((peo) => (
          <div
            key={peo.label}
            style={{
              fontSize: "10pt",
              marginBottom: "6pt",
              display: "flex",
              gap: "4pt",
            }}
          >
            <span style={{ fontWeight: "bold", whiteSpace: "nowrap" }}>
              {peo.label} -
            </span>
            <span style={{ whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
              {peo.description}
            </span>
          </div>
        ))}
      </div>

      {/* ── CONSISTENCY TABLE ── */}
      <div style={{ marginBottom: "20pt" }}>
        <div
          style={{ fontWeight: "bold", fontSize: "10pt", marginBottom: "8pt" }}
        >
          Establish consistency of PEOs with Mission of the Program/Department
        </div>
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            fontSize: "10pt",
          }}
        >
          <thead>
            <tr>
              {["PEO", "M1", "M2", "Mn"].map((h) => (
                <th
                  key={h}
                  style={{
                    border: "1px solid black",
                    padding: "6pt 10pt",
                    textAlign: "center",
                    fontWeight: "bold",
                    width: "25%",
                  }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.consistencyRows.map((row) => (
              <tr key={row.peo}>
                <td
                  style={{
                    border: "1px solid black",
                    padding: "8pt 10pt",
                    textAlign: "center",
                    fontWeight: "bold",
                  }}
                >
                  {row.peo}
                </td>
                <td
                  style={{
                    border: "1px solid black",
                    padding: "8pt 10pt",
                    textAlign: "center",
                  }}
                >
                  {row.m1}
                </td>
                <td
                  style={{
                    border: "1px solid black",
                    padding: "8pt 10pt",
                    textAlign: "center",
                  }}
                >
                  {row.m2}
                </td>
                <td
                  style={{
                    border: "1px solid black",
                    padding: "8pt 10pt",
                    textAlign: "center",
                  }}
                >
                  {row.mn}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ── SIGNATURES ── */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          fontSize: "10pt",
          fontWeight: "bold",
          marginTop: "30pt",
        }}
      >
        <div>Signature of the Program coordinator</div>
        <div>Signature of the Principal with Seal</div>
      </div>
    </div>
  );
}
