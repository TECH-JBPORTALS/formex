import { BracesIcon } from "lucide-react";

export default function Page() {
  return (
    <div className="flex flex-col gap-3 items-center justify-center w-full min-h-full">
      <BracesIcon className="size-14 text-muted-foreground" />
      <h1 className="text-2xl font-semibold">Welcome to Formex</h1>
      <p className="text-sm text-muted-foreground">
        Select any fromat or branch to continue your work
      </p>
    </div>
  );
}
