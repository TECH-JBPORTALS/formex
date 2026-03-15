"use client";

import { useQuery } from "@tanstack/react-query";
import { useTRPC } from "@/trpc/client";
import { Loader2, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function CourseReportPrintPage() {
  const trpc = useTRPC();
  const { data: reports = [], isLoading } = useQuery(
    trpc.courseReport.list.queryOptions(),
  );

  const first = reports[0];

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white p-8">
      {/* Print Controls */}
      <div className="print:hidden mb-8 flex items-center justify-between rounded-lg bg-muted p-4">
        <div>
          <h2 className="text-lg font-semibold">Report Preview</h2>
          <p className="text-sm text-muted-foreground">
            Monthly Course Coordinator Report · INS-FORMAT-11
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => window.history.back()}>
            Back
          </Button>
          <Button onClick={() => window.print()}>
            <Printer className="mr-2 h-4 w-4" /> Print Report
          </Button>
        </div>
      </div>

      {/* Format Header */}
      <div className="mb-6 text-center">
        <p className="text-sm font-semibold">INS - FORMAT-11</p>
        <h1 className="mt-1 text-base font-bold uppercase">
          Monthly Course Coordinator Report
        </h1>
      </div>

      {/* Meta Fields */}
      {first && (
        <div className="mb-6 grid grid-cols-2 gap-x-12 gap-y-2 text-sm">
          <div className="flex gap-2">
            <span className="font-semibold whitespace-nowrap">Institution Name:</span>
            <span className="border-b border-black flex-1">{first.institutionName}</span>
          </div>
          <div className="flex gap-2">
            <span className="font-semibold whitespace-nowrap">Institution Code:</span>
            <span className="border-b border-black flex-1">{first.institutionCode}</span>
          </div>
          <div className="flex gap-2">
            <span className="font-semibold whitespace-nowrap">Academic Year:</span>
            <span className="border-b border-black flex-1">{first.academicYear}</span>
          </div>
          <div className="flex gap-2">
            <span className="font-semibold whitespace-nowrap">Name of Programme:</span>
            <span className="border-b border-black flex-1">{first.programName}</span>
          </div>
          <div className="flex gap-2">
            <span className="font-semibold whitespace-nowrap">Semester:</span>
            <span className="border-b border-black flex-1">{first.semester}</span>
          </div>
          <div className="flex gap-2">
            <span className="font-semibold whitespace-nowrap">Month:</span>
            <span className="border-b border-black flex-1">{first.month}</span>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="rounded-lg border">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow>
              <TableHead className="border text-center font-bold text-foreground w-[50px]">Sl.No</TableHead>
              <TableHead className="border font-bold text-foreground">Name of Course Coordinator</TableHead>
              <TableHead className="border font-bold text-foreground">Course Taken</TableHead>
              <TableHead className="border text-center font-bold text-foreground">Sessions as per Syllabus</TableHead>
              <TableHead className="border text-center font-bold text-foreground">No. of Sessions Taken</TableHead>
              <TableHead className="border text-center font-bold text-foreground">Sessions to be Taken</TableHead>
              <TableHead className="border text-center font-bold text-foreground">% of Concepts Covered</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {reports.length > 0 ? (
              reports.map((r) => (
                <TableRow key={r.id}>
                  <TableCell className="border text-center">{r.slNo}</TableCell>
                  <TableCell className="border font-medium">{r.courseCoordinatorName}</TableCell>
                  <TableCell className="border">{r.courseTaken}</TableCell>
                  <TableCell className="border text-center">{r.sessionsAsPerSyllabus}</TableCell>
                  <TableCell className="border text-center">{r.sessionsTaken}</TableCell>
                  <TableCell className="border text-center">{r.sessionsToBeTaken}</TableCell>
                  <TableCell className="border text-center">
                    <span className={Number(r.percentageCovered) >= 75 ? "text-green-700 font-semibold" : "text-amber-600 font-semibold"}>
                      {Number(r.percentageCovered).toFixed(2)}%
                    </span>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                  No reports found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Signature Footer */}
      <div className="mt-20 grid grid-cols-2 gap-20">
        <div className="border-t border-black pt-2 text-center text-sm font-semibold">
          Prepared By (Course Coordinator)
        </div>
        <div className="border-t border-black pt-2 text-center text-sm font-semibold">
          Authorized Signature with Seal
        </div>
      </div>

      <style jsx global>{`
        @media print {
          body { background: white !important; padding: 0 !important; }
          .print\\:hidden { display: none !important; }
          table { border-collapse: collapse; width: 100%; }
          th, td { border: 1px solid #000 !important; padding: 6px 8px !important; }
          .text-green-700 { color: #15803d !important; }
          .text-amber-600 { color: #d97706 !important; }
        }
      `}</style>
    </div>
  );
}
