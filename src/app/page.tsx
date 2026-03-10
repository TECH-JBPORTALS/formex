import NewTemplateButton from "@/components/template/new-template-button";
import { TemplateList } from "@/components/template/template-list";

export default function Home() {
  return (
    <main className="flex flex-col min-h-screen w-full">
      <header className="fixed top-0 h-14 border-b bg-background w-full px-6 flex justify-between items-center">
        <h1 className="text-lg font-bold font-mono">Formex</h1>
        <NewTemplateButton />
      </header>
      <div className="pt-14">
        <TemplateList />
      </div>
    </main>
  );
}
