"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import Container from "@/components/container";
import Header from "@/components/header";
import { SpinnerPage } from "@/components/spinner-page";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getPersonalTimetable } from "./api";

const HOURS = [1, 2, 3, 4, 5, 6, 7];

function dayLabel(day: string): string {
  return day.slice(0, 3);
}

export function PersonalTimetablePage() {
  const personalTimetableQuery = useQuery({
    queryKey: ["personal-timetable"],
    queryFn: getPersonalTimetable,
  });

  return (
    <>
      <Header>
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href="/">Home</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Personal Timetable</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </Header>

      <Container className="space-y-4">
        {personalTimetableQuery.isLoading ? (
          <SpinnerPage />
        ) : personalTimetableQuery.isError ? (
          <p className="text-sm text-destructive">
            Could not load personal timetable.
          </p>
        ) : (
          <div className="rounded-md border">
            <Table className="w-full table-fixed border-collapse">
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12 border text-center">
                    Sl. No.
                  </TableHead>
                  <TableHead className="w-36 border">
                    Name of the Program
                  </TableHead>
                  <TableHead className="w-20 border text-center">
                    Semester
                  </TableHead>
                  <TableHead className="w-36 border">
                    Name of the Course
                  </TableHead>
                  <TableHead className="w-24 border text-center">
                    No. of Students
                  </TableHead>
                  <TableHead className="w-20 border text-center">
                    Room No.
                  </TableHead>
                  <TableHead className="w-16 border text-center">
                    Period
                  </TableHead>
                  <TableHead className="w-12 border text-center">1</TableHead>
                  <TableHead className="w-12 border text-center">2</TableHead>
                  <TableHead className="w-12 border text-center">3</TableHead>
                  <TableHead className="w-12 border text-center">4</TableHead>
                  <TableHead className="w-14 border text-center"></TableHead>
                  <TableHead className="w-12 border text-center">5</TableHead>
                  <TableHead className="w-12 border text-center">6</TableHead>
                  <TableHead className="w-12 border text-center">7</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {personalTimetableQuery.data?.rows.length ? (
                  (() => {
                    const rows = personalTimetableQuery.data.rows;
                    const days = personalTimetableQuery.data.days;
                    const totalDayRows = rows.length * days.length;

                    return rows.flatMap((row, rowIndex) =>
                      days.map((day, dayIndex) => (
                        <TableRow key={`${row.sl_no}-${day}`}>
                          {dayIndex === 0 ? (
                            <>
                              <TableCell
                                rowSpan={days.length}
                                className="border text-center align-middle"
                              >
                                {row.sl_no}
                              </TableCell>
                              <TableCell
                                rowSpan={days.length}
                                className="border align-middle"
                              >
                                {row.program_name}
                              </TableCell>
                              <TableCell
                                rowSpan={days.length}
                                className="border text-center align-middle"
                              >
                                {row.semester}
                              </TableCell>
                              <TableCell
                                rowSpan={days.length}
                                className="border align-middle"
                              >
                                {row.course_name}
                              </TableCell>
                              <TableCell
                                rowSpan={days.length}
                                className="border text-center align-middle"
                              >
                                {row.no_of_students}
                              </TableCell>
                              <TableCell
                                rowSpan={days.length}
                                className="border text-center align-middle"
                              >
                                {row.room_no}
                              </TableCell>
                            </>
                          ) : null}

                          <TableCell className="border text-center font-medium">
                            {dayLabel(day)}
                          </TableCell>

                          {HOURS.slice(0, 4).map((hour) => (
                            <TableCell
                              key={`${day}-${hour}`}
                              className="border text-center"
                            >
                              {row.day_slots[day]?.[String(hour)] ? "X" : ""}
                            </TableCell>
                          ))}

                          {rowIndex === 0 && dayIndex === 0 ? (
                            <TableCell
                              rowSpan={totalDayRows}
                              className="border text-center align-middle"
                            >
                              Break
                            </TableCell>
                          ) : null}

                          {HOURS.slice(4).map((hour) => (
                            <TableCell
                              key={`${day}-${hour}`}
                              className="border text-center"
                            >
                              {row.day_slots[day]?.[String(hour)] ? "X" : ""}
                            </TableCell>
                          ))}
                        </TableRow>
                      )),
                    );
                  })()
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={15}
                      className="text-muted-foreground border text-center"
                    >
                      No assigned subjects found for your role.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </Container>
    </>
  );
}
