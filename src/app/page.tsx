import { Toaster } from "sonner";
import { PlateEditor } from "@/components/editor/plate-editor";

export default function Home() {
  return (
    <div className="min-h-screen bg-zinc-50 w-full">
      <PlateEditor />
      <Toaster />
    </div>
  );
}
