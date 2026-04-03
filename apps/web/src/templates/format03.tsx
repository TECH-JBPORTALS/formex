"use client";

type Format03Props = {
  data: Record<string, unknown>;
};

export default function Format03({ data }: Format03Props) {
  const events = Array.isArray(data.events) ? data.events : [];
  return (
    <div
      className="mx-auto bg-white text-black shadow-sm"
      style={{
        width: "210mm",
        minHeight: "297mm",
        padding: "10mm 15mm",
        boxSizing: "border-box",
        fontFamily: "Arial, sans-serif",
        fontSize: "10pt",
      }}
    >
      <h1 className="border-b border-black pb-2 text-sm font-bold">
        Format 03 — Academic calendar
      </h1>
      <p className="mt-3 text-[9pt]">
        <strong>{String(data.institutionName ?? "")}</strong> · AY{" "}
        {String(data.academicYear ?? "")}
      </p>
      <p className="text-[9pt] text-neutral-600">
        Form {String(data.formNo ?? "")} · Rev {String(data.revision ?? "")}
      </p>
      <p className="mt-4 text-[9pt] font-semibold">
        Scheduled events ({events.length})
      </p>
      <div className="mt-2 max-h-[200mm] overflow-auto border border-neutral-300 text-[8pt]">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-neutral-400 bg-neutral-100">
              <th className="border p-1 text-left">Week</th>
              <th className="border p-1 text-left">Day</th>
              <th className="border p-1 text-left">Date</th>
              <th className="border p-1 text-left">Morning</th>
              <th className="border p-1 text-left">Afternoon</th>
            </tr>
          </thead>
          <tbody>
						{events.map((ev) => {
							const row = ev as Record<string, unknown>;
							const rk = `${row.week}-${row.day}-${row.date}-${String(row.morningSession ?? "")}`;
							return (
								<tr key={rk} className="border-b border-neutral-200">
                  <td className="border p-1">{String(row.week ?? "")}</td>
                  <td className="border p-1">{String(row.day ?? "")}</td>
                  <td className="border p-1">{String(row.date ?? "")}</td>
                  <td className="border p-1">
                    {String(row.morningSession ?? "")}
                  </td>
                  <td className="border p-1">
                    {String(row.afternoonSession ?? "")}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
