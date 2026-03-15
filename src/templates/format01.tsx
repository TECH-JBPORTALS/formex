import Image from "next/image";

export type Format01Data = {
  institutionName: string;
  code: string;
  email?: string;
  phone?: string;
  formNo?: string;
  revision?: string;
  date?: string;
  logoUrl?: string;
  vision: string;
  mission: string;
};

export default function Format01({ data }: { data: Format01Data }) {
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
          marginBottom: "16pt",
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
      <div style={{ textAlign: "center", marginBottom: "14pt" }}>
        <div style={{ fontWeight: "bold", fontSize: "11pt" }}>
          INS - FORMAT-01
        </div>
      </div>

      {/* ── INSTITUTION NAME & CODE ── */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: "20pt",
          fontSize: "10pt",
        }}
      >
        <div>
          <strong>Institution Name:</strong>{" "}
          <span
            style={{
              borderBottom: "1px solid black",
              minWidth: "150pt",
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

      {/* ── MAIN TITLE ── */}
      <div
        style={{
          textAlign: "center",
          fontWeight: "bold",
          fontSize: "11pt",
          marginBottom: "24pt",
        }}
      >
        Vision and Mission of the institute
      </div>

      {/* ── VISION ── */}
      <div style={{ marginBottom: "60pt" }}>
        <div
          style={{ fontWeight: "bold", fontSize: "10pt", marginBottom: "12pt" }}
        >
          Vision of the Institute:
        </div>
        <div
          style={{
            fontSize: "10pt",
            lineHeight: "1.8",
            minHeight: "80pt",
            paddingLeft: "4pt",
            whiteSpace: "pre-wrap",
            wordBreak: "break-word",
          }}
        >
          {data.vision}
        </div>
      </div>

      {/* ── MISSION ── */}
      <div style={{ marginBottom: "60pt" }}>
        <div
          style={{ fontWeight: "bold", fontSize: "10pt", marginBottom: "12pt" }}
        >
          Mission of the Institute:
        </div>
        <div
          style={{
            fontSize: "10pt",
            lineHeight: "1.8",
            minHeight: "80pt",
            paddingLeft: "4pt",
            whiteSpace: "pre-wrap",
            wordBreak: "break-word",
          }}
        >
          {data.mission}
        </div>
      </div>

      {/* ── SIGNATURE ── */}
      <div
        style={{
          textAlign: "right",
          fontSize: "10pt",
          fontWeight: "bold",
          marginTop: "40pt",
        }}
      >
        Signature of the Principal with Seal
      </div>
    </div>
  );
}
