"use client";

import type { ReactNode } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { TooltipProvider } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { TimetableCell } from "./TimetableCell";
import { TimetableSheet } from "./TimetableSheet";
import {
  DAYS,
  occupiedKey,
  slotKey,
  type TimetableDay,
  type TimetableSlot,
  type TimetableSubjectOption,
  useTimetableStore,
} from "./useTimetableStore";

type TimetableTableProps = {
  className?: string;
  withSheet?: boolean;
  subjectOptions?: TimetableSubjectOption[];
  onSaveSlot?: (slot: TimetableSlot) => Promise<void> | void;
  isSavingSlot?: boolean;
};

function renderHourBlock(params: {
  day: TimetableDay;
  start: number;

  end: number;
  selectedDay: TimetableDay | null;
  selectedStartHour: number | null;
  timetable: ReturnType<typeof useTimetableStore.getState>["timetable"];
  occupiedHours: ReturnType<typeof useTimetableStore.getState>["occupiedHours"];
  onCellClick: (day: TimetableDay, hour: number) => void;
}) {
  const {
    day,
    start,
    end,
    selectedDay,
    selectedStartHour,
    timetable,
    occupiedHours,
    onCellClick,
  } = params;

  const rendered: ReactNode[] = [];
  let hour = start;

  while (hour <= end) {
    const currentHour = hour;
    const key = slotKey(day, currentHour);
    const slot = timetable[key];

    if (slot) {
      const slotSpan = slot.endHour - slot.startHour + 1;
      const colSpan = Math.min(slotSpan, end - currentHour + 1);
      rendered.push(
        <TimetableCell
          key={`${day}-${currentHour}`}
          day={day}
          startHour={currentHour}
          slot={slot}
          colSpan={colSpan}
          selected={selectedDay === day && selectedStartHour === currentHour}
          onClick={() => onCellClick(day, currentHour)}
        />,
      );
      hour += colSpan;
      continue;
    }

    const occupiedBy = occupiedHours[occupiedKey(day, currentHour)];
    if (occupiedBy && occupiedBy !== currentHour) {
      hour += 1;
      continue;
    }

    rendered.push(
      <TimetableCell
        key={`${day}-${currentHour}`}
        day={day}
        startHour={currentHour}
        selected={selectedDay === day && selectedStartHour === currentHour}
        onClick={() => onCellClick(day, currentHour)}
      />,
    );
    hour += 1;
  }

  return rendered;
}

export function TimetableTable({
  className,
  withSheet = true,
  subjectOptions = [],
  onSaveSlot,
  isSavingSlot = false,
}: TimetableTableProps) {
  const timetable = useTimetableStore((state) => state.timetable);
  const occupiedHours = useTimetableStore((state) => state.occupiedHours);
  const selectedCell = useTimetableStore((state) => state.selectedCell);
  const selectCell = useTimetableStore((state) => state.selectCell);

  const selectedDay = selectedCell?.day ?? null;
  const selectedStartHour = selectedCell?.startHour ?? null;

  return (
    <TooltipProvider delayDuration={100}>
      <div className={cn("space-y-4", className)}>
        <Table className="w-full table-fixed border-separate border-spacing-1 text-xs md:text-sm">
          <TableHeader>
            <TableRow className="bg-muted/40 hover:bg-muted/40">
              <TableHead className="w-20 md:w-24">Day</TableHead>
              <TableHead>H1</TableHead>
              <TableHead>H2</TableHead>
              <TableHead>H3</TableHead>
              <TableHead>H4</TableHead>
              <TableHead className="w-14 md:w-20"></TableHead>
              <TableHead>H5</TableHead>
              <TableHead>H6</TableHead>
              <TableHead>H7</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {DAYS.map((day, dayIndex) => (
              <TableRow key={day} className="hover:bg-transparent">
                <TableCell className="bg-muted/30 font-medium">{day}</TableCell>

                {renderHourBlock({
                  day,
                  start: 1,
                  end: 4,
                  selectedDay,
                  selectedStartHour,
                  timetable,
                  occupiedHours,
                  onCellClick: selectCell,
                })}

                {dayIndex === 0 ? (
                  <TableCell
                    rowSpan={DAYS.length}
                    className="bg-muted/40 text-muted-foreground w-14 p-0 align-middle text-center select-none md:w-20"
                  >
                    <div className="[writing-mode:vertical-lr] mx-auto flex w-full items-center py-2 font-mono text-[10px] font-medium tracking-wide uppercase md:text-sm">
                      Lunch Break
                    </div>
                  </TableCell>
                ) : null}

                {renderHourBlock({
                  day,
                  start: 5,
                  end: 7,
                  selectedDay,
                  selectedStartHour,
                  timetable,
                  occupiedHours,
                  onCellClick: selectCell,
                })}
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {withSheet ? (
          <TimetableSheet
            subjectOptions={subjectOptions}
            onSaveSlot={onSaveSlot}
            isSaving={isSavingSlot}
          />
        ) : null}
      </div>
    </TooltipProvider>
  );
}
