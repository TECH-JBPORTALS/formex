import { PDFPreview } from "@/components/pdf-preview";
import Format01 from "@/templates/format01";

export default function Page() {
  return (
    <PDFPreview>
      <Format01
        data={{
          code: "364",
          institutionName: "KS Polytechnic",
          mission: "This is my mission",
          vision: "This is my vission",
        }}
      />
    </PDFPreview>
  );
}
