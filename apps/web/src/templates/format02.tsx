"use client";

type Format02Props = {
  data: Record<string, unknown>;
};

/**
 * Program vision & PEOs — full print layout can be restored later; this keeps routes compiling.
 */
export default function Format02({ data }: Format02Props) {
  const peos = Array.isArray(data.peos) ? data.peos : [];
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
        Format 02 — Program vision &amp; PEOs
      </h1>
      <p className="mt-3 text-[9pt] text-neutral-700">
        <strong>{String(data.institutionName ?? "")}</strong> ·{" "}
        {String(data.code ?? "")}
      </p>
      <p className="mt-2 text-[9pt]">
        <strong>Program:</strong> {String(data.program ?? "")}
      </p>
      <p className="mt-3 text-[9pt] leading-snug">
        {String(data.visionOfProgram ?? "")}
      </p>
      <p className="mt-2 text-[9pt] leading-snug">
        {String(data.missionOfProgram ?? "")}
      </p>
      <h2 className="mt-4 border-b border-black pb-1 text-[10pt] font-semibold">
        PEOs ({peos.length})
      </h2>
      <ul className="mt-2 list-inside list-decimal space-y-1 text-[9pt]">
        {peos.map((peo) => {
          const label =
            typeof peo === "object" && peo !== null && "label" in peo
              ? String((peo as { label: string }).label)
              : "peo";
          const desc =
            typeof peo === "object" && peo !== null && "description" in peo
              ? String((peo as { description: string }).description)
              : String(peo);
          return (
            <li key={`${label}-${desc.slice(0, 32)}`}>
              {typeof peo === "object" && peo !== null && "label" in peo ? (
                <>
                  <strong>{String((peo as { label: string }).label)}:</strong>{" "}
                  {String((peo as { description: string }).description)}
                </>
              ) : (
                String(peo)
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
