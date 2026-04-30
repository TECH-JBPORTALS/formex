"use client";

import { useEffect, useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { RoomReport } from "@/lib/api/generated/models";
import {
  getRoomReportListByProgramQueryKey,
  useRoomReportsUpdate,
} from "@/lib/api/generated/room-report/room-report";
import { useSubjectListByProgram } from "@/lib/api/generated/subject/subject";
import { Button } from "../ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "../ui/command";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../ui/popover";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "../ui/sheet";
import {
  roomReportToFormValues,
  toRoomReportPayload,
  type RoomReportFormValues,
} from "./room-report-form.helpers";

export function EditRoomReportSheet({
  roomReport,
  programId,
  semester,
  open,
  onOpenChange,
}: {
  roomReport: RoomReport;
  programId: string;
  semester: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const queryClient = useQueryClient();
  const [subjectOpen, setSubjectOpen] = useState(false);
  const [values, setValues] = useState<RoomReportFormValues>(
    {
      ...roomReportToFormValues(roomReport),
      program_id: programId,
      semester: String(semester),
    },
  );
  const subjectsQuery = useSubjectListByProgram(values.program_id, {
    query: { enabled: values.program_id.length > 0 },
  });
  const allSubjects =
    subjectsQuery.data?.status === 200 ? subjectsQuery.data.data.data : [];
  const subjects = useMemo(() => {
    const semester = Number(values.semester);
    if (!Number.isFinite(semester)) {
      return allSubjects;
    }
    return allSubjects.filter((subject) => subject.semester === semester);
  }, [allSubjects, values.semester]);

  useEffect(() => {
    if (open) {
      setValues({
        ...roomReportToFormValues(roomReport),
        program_id: programId,
        semester: String(semester),
      });
    }
  }, [open, programId, roomReport, semester]);

  const updateMutation = useRoomReportsUpdate(
    {
      mutation: {
        onSuccess: async (res) => {
          if (res.status !== 200) {
            toast.error("Could not update room report");
            return;
          }
          await queryClient.invalidateQueries({
            queryKey: getRoomReportListByProgramQueryKey(programId),
          });
          toast.success("Room report updated");
          onOpenChange(false);
        },
        onError: (error) => {
          toast.error(error instanceof Error ? error.message : "Could not update room report");
        },
      },
    },
    queryClient,
  );

  function updateValue<K extends keyof RoomReportFormValues>(
    key: K,
    next: RoomReportFormValues[K],
  ) {
    setValues((prev) => ({ ...prev, [key]: next }));
  }

  async function onSave() {
    const payload = toRoomReportPayload(values);
    await updateMutation.mutateAsync({
      roomReport: roomReport.id,
      data: payload,
    });
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="flex w-full flex-col gap-0 overflow-hidden sm:max-w-lg">
        <SheetHeader>
          <SheetTitle>Edit room report</SheetTitle>
          <SheetDescription>Room {roomReport.room_number}</SheetDescription>
        </SheetHeader>

        <div className="flex flex-1 flex-col gap-3 overflow-y-auto px-4 pb-4">
          <div className="space-y-1">
            <Label>Subject</Label>
            <Popover open={subjectOpen} onOpenChange={setSubjectOpen}>
              <PopoverTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full justify-start text-left font-normal"
                  disabled={!values.program_id || !values.semester}
                >
                  {subjects.find((subject) => subject.id === values.subject_id)?.name ??
                    "Search subject"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-(--radix-popover-trigger-width) p-0">
                <Command>
                  <CommandInput placeholder="Search subject..." />
                  <CommandList>
                    <CommandEmpty>No subject found.</CommandEmpty>
                    <CommandGroup>
                      {subjects.map((subject) => (
                        <CommandItem
                          key={subject.id}
                          value={`${subject.name} ${subject.code}`}
                          onSelect={() => {
                            updateValue("subject_id", subject.id);
                            setSubjectOpen(false);
                          }}
                        >
                          {subject.name} ({subject.code})
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>

          {values.subject_id ? (
            <>
              <div className="space-y-1">
                <Label>Room Number</Label>
                <Input
                  placeholder="Room number"
                  value={values.room_number}
                  onChange={(event) => updateValue("room_number", event.target.value)}
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <Label>Strength</Label>
                  <Input
                    type="number"
                    min={1}
                    placeholder="Total students"
                    value={values.strength}
                    onChange={(event) => updateValue("strength", event.target.value)}
                  />
                </div>
                <div className="space-y-1">
                  <Label>Present</Label>
                  <Input
                    type="number"
                    min={1}
                    placeholder="Students present"
                    value={values.present}
                    onChange={(event) => updateValue("present", event.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-1">
                <Label>Attendance register</Label>
                <Select
                  value={values.attendance_register}
                  onValueChange={(next) =>
                    updateValue(
                      "attendance_register",
                      next as RoomReportFormValues["attendance_register"],
                    )
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select attendance register" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="maintained">Maintained</SelectItem>
                    <SelectItem value="not_maintained">Not maintained</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label>Topic Planned</Label>
                <Input
                  placeholder="Topic planned"
                  value={values.topic_planned}
                  onChange={(event) => updateValue("topic_planned", event.target.value)}
                />
              </div>
              <div className="space-y-1">
                <Label>Topic Taught</Label>
                <Input
                  placeholder="Topic taught"
                  value={values.topic_taught}
                  onChange={(event) => updateValue("topic_taught", event.target.value)}
                />
              </div>
              <div className="space-y-1">
                <Label>Pedagogy Used</Label>
                <Input
                  placeholder="Pedagogy used"
                  value={values.pedagogy_used}
                  onChange={(event) => updateValue("pedagogy_used", event.target.value)}
                />
              </div>
              <div className="space-y-1">
                <Label>Aids Used</Label>
                <Input
                  placeholder="Aids used"
                  value={values.aids_used}
                  onChange={(event) => updateValue("aids_used", event.target.value)}
                />
              </div>
              <div className="space-y-1">
                <Label>Principal Remarks</Label>
                <Input
                  placeholder="Principal remarks"
                  value={values.principal_remarks}
                  onChange={(event) =>
                    updateValue("principal_remarks", event.target.value)
                  }
                />
              </div>
              <div className="space-y-1">
                <Label>Report Date</Label>
                <Input
                  type="date"
                  value={values.report_date}
                  onChange={(event) => updateValue("report_date", event.target.value)}
                />
              </div>
            </>
          ) : (
            <p className="text-sm text-muted-foreground">
              Search and select a subject to continue.
            </p>
          )}
        </div>

        <SheetFooter className="border-t px-4 py-4 sm:flex-row">
          <Button onClick={() => void onSave()} disabled={updateMutation.isPending}>
            {updateMutation.isPending ? "Saving..." : "Save changes"}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
