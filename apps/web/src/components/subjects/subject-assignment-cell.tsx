"use client";

import { Tick02Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useEffect, useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  Avatar,
  AvatarFallback,
  AvatarGroup,
  AvatarGroupCount,
} from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Spinner } from "@/components/ui/spinner";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ensureSanctumCsrf } from "@/lib/api/csrf";
import {
  getFacultyIndexQueryKey,
  useFacultyIndex,
  useFacultyUpdate,
} from "@/lib/api/generated/institution-faculty/institution-faculty";

export type AssignedStaff = {
  id: string;
  name: string;
  role: string;
};

type SubjectAssignmentCellProps = {
  subjectId: string;
  initialAssignedStaff: AssignedStaff[];
};

function distinct(values: string[]): string[] {
  return Array.from(new Set(values));
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean).slice(0, 2);

  if (parts.length === 0) {
    return "?";
  }

  return parts.map((part) => part[0]?.toUpperCase() ?? "").join("");
}

export function SubjectAssignmentCell({
  subjectId,
  initialAssignedStaff,
}: SubjectAssignmentCellProps) {
  const queryClient = useQueryClient();
  const [comboboxOpen, setComboboxOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [pendingFacultyId, setPendingFacultyId] = useState<string | null>(null);
  const [assignedStaff, setAssignedStaff] =
    useState<AssignedStaff[]>(initialAssignedStaff);

  const facultyQuery = useFacultyIndex({
    query: {
      enabled: comboboxOpen,
    },
  });
  const updateMutation = useFacultyUpdate();

  useEffect(() => {
    setAssignedStaff(initialAssignedStaff);
  }, [initialAssignedStaff]);

  const allFaculty =
    facultyQuery.data?.status === 200 ? facultyQuery.data.data.data : [];
  const availableStaff = allFaculty.filter((faculty) =>
    ["course_coordinator", "program_coordinator"].includes(faculty.role),
  );

  const assignedStaffIds = useMemo(
    () => new Set(assignedStaff.map((staff) => staff.id)),
    [assignedStaff],
  );

  const staffOptions = availableStaff.map((faculty) => ({
    value: faculty.id,
    label: faculty.name,
    searchValue: `${faculty.name} ${faculty.email}`,
  }));

  async function toggleCoordinatorAssignment(id: string) {
    if (isSaving) {
      return;
    }

    const faculty = availableStaff.find((entry) => entry.id === id);
    if (!faculty) {
      return;
    }

    const currentlyAssigned = assignedStaffIds.has(id);
    const currentSubjectIdsSet = new Set(
      faculty.subjects.map((subject) => subject.id),
    );
    if (currentlyAssigned) {
      currentSubjectIdsSet.add(subjectId);
    } else {
      currentSubjectIdsSet.delete(subjectId);
    }

    const currentSubjectIds = Array.from(currentSubjectIdsSet);
    const nextSubjectIds = currentlyAssigned
      ? currentSubjectIds.filter(
          (subjectEntryId) => subjectEntryId !== subjectId,
        )
      : distinct([...currentSubjectIds, subjectId]);

    if (nextSubjectIds.length === 0) {
      toast.error(
        `Cannot remove ${faculty.name}; at least one subject is required.`,
      );
      return;
    }

    try {
      setIsSaving(true);
      setPendingFacultyId(faculty.id);
      await ensureSanctumCsrf();
      const response = await updateMutation.mutateAsync({
        faculty: faculty.id,
        data: {
          role:
            faculty.role === "program_coordinator"
              ? "program_coordinator"
              : "course_coordinator",
          program_ids:
            faculty.role === "program_coordinator"
              ? faculty.programs.map((program) => program.id)
              : [],
          subject_ids: nextSubjectIds,
        },
      });

      if (response.status !== 200) {
        toast.error(
          response.data?.message ??
            `Could not update subject assignments for ${faculty.name}.`,
        );
        return;
      }

      setAssignedStaff((current) => {
        if (currentlyAssigned) {
          return current.filter((staff) => staff.id !== faculty.id);
        }

        return [
          ...current,
          {
            id: faculty.id,
            name: faculty.name,
            role: faculty.role,
          },
        ];
      });

      await queryClient.invalidateQueries({
        queryKey: getFacultyIndexQueryKey(),
      });
    } finally {
      setIsSaving(false);
      setPendingFacultyId(null);
    }
  }

  return (
    <TooltipProvider delayDuration={100}>
      <Popover open={comboboxOpen} onOpenChange={setComboboxOpen}>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-auto justify-start px-0 hover:bg-transparent"
          >
            <AvatarGroup>
              {assignedStaff.length === 0 ? (
                <Avatar size="sm">
                  <AvatarFallback>+</AvatarFallback>
                </Avatar>
              ) : (
                assignedStaff.slice(0, 4).map((staff) => (
                  <Tooltip key={staff.id}>
                    <TooltipTrigger asChild>
                      <Avatar size="sm">
                        <AvatarFallback>
                          {getInitials(staff.name)}
                        </AvatarFallback>
                      </Avatar>
                    </TooltipTrigger>
                    <TooltipContent>{staff.name}</TooltipContent>
                  </Tooltip>
                ))
              )}
              {assignedStaff.length > 4 ? (
                <AvatarGroupCount>+{assignedStaff.length - 4}</AvatarGroupCount>
              ) : null}
            </AvatarGroup>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[320px] p-0" align="start">
          <Command>
            <CommandInput placeholder="Search people..." />
            <CommandList>
              {facultyQuery.isLoading ? (
                <div className="flex items-center gap-2 p-3 text-sm text-muted-foreground">
                  <Spinner className="size-4" />
                  Loading staff...
                </div>
              ) : facultyQuery.data?.status !== 200 ? (
                <div className="p-3 text-sm text-destructive">
                  Could not load staff list.
                </div>
              ) : (
                <>
                  <CommandEmpty>No people found.</CommandEmpty>
                  <CommandGroup>
                    {staffOptions.map((option) => {
                      const isSelected = assignedStaffIds.has(option.value);
                      const isPending = pendingFacultyId === option.value;
                      return (
                        <CommandItem
                          key={option.value}
                          value={option.searchValue}
                          disabled={isSaving}
                          onSelect={() =>
                            void toggleCoordinatorAssignment(option.value)
                          }
                        >
                          {isPending ? (
                            <Spinner className="size-4" />
                          ) : (
                            <HugeiconsIcon
                              icon={Tick02Icon}
                              className={`size-4 ${isSelected ? "opacity-100" : "opacity-0"}`}
                            />
                          )}
                          <span className="truncate">{option.label}</span>
                        </CommandItem>
                      );
                    })}
                  </CommandGroup>
                </>
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </TooltipProvider>
  );
}
