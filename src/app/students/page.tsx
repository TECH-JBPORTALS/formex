import { ArrowLeft } from "lucide-react";
import Link from "next/link";

import { StudentTable } from "@/components/student/student-table";
import { Button } from "@/components/ui/button";

export default function StudentsPage() {
  return (
    <main className="flex flex-col min-h-screen w-full bg-muted/40">
      <header className="sticky top-0 z-30 h-14 border-b bg-background/80 backdrop-blur px-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button asChild variant="ghost" size="icon-sm">
            <Link href="/">
              <ArrowLeft className="h-4 w-4" />
              <span className="sr-only">Back to dashboard</span>
            </Link>
          </Button>
          <div>
            <h1 className="text-lg font-semibold tracking-tight">Students</h1>
            <p className="text-xs text-muted-foreground">
              View, create, update and delete student records.
            </p>
          </div>
        </div>
      </header>
      <div className="flex-1 px-4 py-6 md:px-8">
        <StudentTable />
      </div>
    </main>
  );
}
