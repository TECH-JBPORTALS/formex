"use client";

type Format05Props = {
  data: Record<string, unknown>;
};

export default function Format05({ data }: Format05Props) {
  const rows = Array.isArray(data.rows) ? data.rows : [];
  const keys =
    rows.length > 0 ? Object.keys(rows[0] as Record<string, unknown>) : [];

  return (
    <div
      className="mx-auto bg-white text-black shadow-sm"
      style={{
        width: "210mm",
        minHeight: "297mm",
        padding: "10mm 15mm",
        boxSizing: "border-box",
        fontFamily: "Arial, sans-serif",
        fontSize: "9pt",
      }}
    >
      <h1 className="border-b border-black pb-2 text-sm font-bold">
        Format 05 — LH / DH timetable
      </h1>
      <p className="mt-3 text-[9pt]">
        <strong>{String(data.institutionName ?? "")}</strong> ·{" "}
        {String(data.program ?? "")}
      </p>
      <p className="text-[9pt]">
        {String(data.semester ?? "")} · {String(data.lhDhNo ?? "")} · AY{" "}
        {String(data.academicYear ?? "")}
      </p>
      <div className="mt-4 overflow-auto border border-neutral-300">
        <table className="w-full min-w-max border-collapse text-[8pt]">
          <tbody>
            {rows.map((row, i) => {
              const r = row as Record<string, unknown>;
              const rowKey = String(r.day ?? r.period1 ?? i);
              return (
                <tr
                  key={`${rowKey}-${String(r.period2 ?? "")}`}
                  className={
                    i === 0 ? "bg-neutral-100 font-semibold" : undefined
                  }
                >
                  {keys.map((k) => (
                    <td key={k} className="border border-neutral-300 p-1">
                      {String(r[k] ?? "")}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
