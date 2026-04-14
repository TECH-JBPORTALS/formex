"use client";

import { TableCell } from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import type { TimetableDay, TimetableSlot } from "./useTimetableStore";

type TimetableCellProps = {
  day: TimetableDay;
  startHour: number;
  colSpan?: number;
  slot?: TimetableSlot;
  selected?: boolean;
  disabled?: boolean;
  onClick?: () => void;
};

export function TimetableCell({
  day,
  startHour,
  colSpan = 1,
  slot,
  selected = false,
  disabled = false,
  onClick,
}: TimetableCellProps) {
  if (disabled) {
    return (
      <TableCell className="bg-muted/40 text-muted-foreground select-none">
        Lunch Break
      </TableCell>
    );
  }

  const hasContent = Boolean(slot);

  return (
    <TableCell colSpan={colSpan} className="w-auto p-0 whitespace-normal">
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type="button"
            onClick={onClick}
            className={cn(
              "hover:bg-muted/60 flex h-full min-h-20 w-full flex-col rounded-lg border border-dashed p-1 text-left transition-colors md:min-h-24 md:rounded-xl",
              hasContent
                ? "border-border bg-card"
                : "border-muted-foreground/30 bg-background",
              selected && "border-primary ring-primary/20 border-2 ring-2",
            )}
          >
            {!hasContent ? (
              <div className="text-muted-foreground flex flex-1 flex-col items-center justify-center gap-1 text-xs">
                <span>Click to add</span>
              </div>
            ) : (
              <div className="flex min-h-0 flex-1 flex-col gap-1">
                {slot?.subjects.map((entry, index) => (
                  <div
                    key={`${entry.subjectId}-${entry.batchNumber}-${index}`}
                    className="flex min-h-0 flex-1 flex-col justify-between rounded-md border bg-background p-1.5"
                  >
                    <p
                      title={entry.subjectName}
                      className="truncate text-[10px] font-medium md:text-xs"
                    >
                      {entry.subjectName} ({entry.batchNumber})
                    </p>

                    <p
                      title={entry.roomNumber}
                      className="text-muted-foreground mt-0.5 truncate text-[10px] md:text-xs"
                    >
                      Room: {entry.roomNumber}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </button>
        </TooltipTrigger>
        <TooltipContent side="top" className="max-w-sm">
          {slot ? (
            <div className="space-y-1">
              <p className="font-medium">
                {day}: H{slot.startHour} to H{slot.endHour}
              </p>
              {slot.subjects.map((entry, index) => (
                <div
                  key={`${entry.subjectId}-${index}`}
                  className="text-xs space-y-0.5"
                >
                  <p>
                    {entry.subjectName} ({entry.batchNumber}) -{" "}
                    {entry.roomNumber}
                  </p>
                  <i className="text-xs">{entry.coordinatorName}</i>
                </div>
              ))}
            </div>
          ) : (
            <p>
              {day} H{startHour}
            </p>
          )}
        </TooltipContent>
      </Tooltip>
    </TableCell>
  );
}
