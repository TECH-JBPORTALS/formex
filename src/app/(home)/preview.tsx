"use client";
import { useDocumentStore } from "@/stores/document";
import { Format01 } from "@/templates/format01";

export function Preview() {
  const { vision, mission, institutionName, institutionCode } =
    useDocumentStore((s) => s);

  return (
    <Format01
      data={{
        code: institutionCode,
        institutionName: institutionName,
        mission,
        vision,
      }}
    />
  );
}
