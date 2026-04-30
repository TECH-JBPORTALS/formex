"use client";

import { useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { toast } from "sonner";
import { $api } from "@/lib/api/mutator";
import { Button } from "../ui/button";
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
  SheetTrigger,
} from "../ui/sheet";
import {
  getRoomReportListByProgramQueryKey,
} from "@/lib/api/generated/room-report/room-report";
import { useSubjectListByProgram } from "@/lib/api/generated/subject/subject";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import {
  roomReportDefaults,
  type RoomReportFormValues,
  toRoomReportPayload,
} from "./room-report-form.helpers";

export function CreateRoomReportSheet({
  children,
  programId,
  semester,
}: {
  children: ReactNode;
  programId: string;
  semester: number;
}) {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [subjectOpen, setSubjectOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [values, setValues] = useState<RoomReportFormValues>(() => ({
    ...roomReportDefaults(),
    program_id: programId,
    semester: String(semester),
  }));
  const subjectsQuery = useSubjectListByProgram(programId, {
    query: { enabled: programId.length > 0 },
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

  function resetFlow() {
    setValues({
      ...roomReportDefaults(),
      program_id: programId,
      semester: String(semester),
    });
    setIsSaving(false);
  }

  function updateValue<K extends keyof RoomReportFormValues>(
    key: K,
    next: RoomReportFormValues[K],
  ) {
    setValues((prev) => ({ ...prev, [key]: next }));
  }

  function onOpenChange(next: boolean) {
    setOpen(next);
    if (!next) {
      resetFlow();
    }
  }

  async function onSave() {
    const payload = toRoomReportPayload(values);
    if (
      !payload.program_id ||
      !payload.subject_id ||
      !payload.room_number ||
      !payload.topic_planned ||
      !payload.topic_taught ||
      !payload.pedagogy_used ||
      !payload.aids_used ||
      !payload.principal_remarks ||
      !payload.report_date
    ) {
      toast.error("Fill all required fields.");
      return;
    }

    setIsSaving(true);
    try {
      const response = await $api<{ status: number; data: { message?: string } }>(
        "/room-reports",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        },
      );

      if (response.status >= 400) {
        toast.error(response.data?.message ?? "Could not create room report");
        return;
      }

      await queryClient.invalidateQueries({
        queryKey: getRoomReportListByProgramQueryKey(programId),
      });
      toast.success("Room report created");
      setOpen(false);
      resetFlow();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not create room report");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetTrigger asChild>{children}</SheetTrigger>
      <SheetContent className="flex w-full flex-col gap-0 overflow-hidden sm:max-w-lg">
        <SheetHeader>
          <SheetTitle>New room report</SheetTitle>
          <SheetDescription>Fill report details for program and subject.</SheetDescription>
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
          <Button onClick={() => void onSave()} disabled={isSaving}>
            {isSaving ? "Saving..." : "Save room report"}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
