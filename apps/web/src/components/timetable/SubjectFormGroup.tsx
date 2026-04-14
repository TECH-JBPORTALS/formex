"use client";

import { useEffect } from "react";
import type { UseFormReturn } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  createSubjectEntry,
  type TimetableSubjectOption,
  type TimetableFormState,
} from "./useTimetableStore";

type SubjectFormGroupProps = {
  index: number;
  form: UseFormReturn<TimetableFormState>;
  subjectOptions: TimetableSubjectOption[];
  canRemove: boolean;
  onRemove: () => void;
};

export function SubjectFormGroup({
  index,
  form,
  subjectOptions,
  canRemove,
  onRemove,
}: SubjectFormGroupProps) {
  const selectedSubjectId =
    form.watch(`subjects.${index}.subjectId`) ??
    createSubjectEntry(subjectOptions).subjectId;
  const selectedSubject = subjectOptions.find(
    (subject) => subject.id === selectedSubjectId,
  );
  const coordinators = selectedSubject?.coordinators ?? [];

  useEffect(() => {
    const currentCoordinatorId = form.getValues(`subjects.${index}.coordinatorId`);
    const isAllowed = coordinators.some(
      (coordinator) => coordinator.id === currentCoordinatorId,
    );
    if (!isAllowed) {
      form.setValue(
        `subjects.${index}.coordinatorId`,
        coordinators[0]?.id ?? "",
        {
          shouldDirty: true,
        },
      );
    }
  }, [coordinators, form, index]);

  useEffect(() => {
    const currentSubjectId = form.getValues(`subjects.${index}.subjectId`);
    if (!subjectOptions.some((subject) => subject.id === currentSubjectId)) {
      form.setValue(`subjects.${index}.subjectId`, subjectOptions[0]?.id ?? "", {
        shouldDirty: true,
      });
    }
  }, [form, index, subjectOptions]);

  return (
    <div className="space-y-3 rounded-xl border p-3">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium">Subject {index + 1}</p>
        {canRemove ? (
          <Button type="button" variant="ghost" size="sm" onClick={onRemove}>
            Remove
          </Button>
        ) : null}
      </div>

      <FormField
        control={form.control}
        name={`subjects.${index}.subjectId`}
        render={({ field }) => (
          <FormItem>
            <FormLabel>Subject</FormLabel>
            <FormControl>
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger className="w-full rounded-xl">
                  <SelectValue placeholder="Select subject" />
                </SelectTrigger>
                <SelectContent>
                  {subjectOptions.map((entry) => (
                    <SelectItem key={entry.id} value={entry.id}>
                      {entry.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name={`subjects.${index}.coordinatorId`}
        render={({ field }) => (
          <FormItem>
            <FormLabel>Course coordinator</FormLabel>
            <FormControl>
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger className="w-full rounded-xl">
                  <SelectValue placeholder="Select coordinator" />
                </SelectTrigger>
                <SelectContent>
                  {coordinators.map((coordinator) => (
                    <SelectItem key={coordinator.id} value={coordinator.id}>
                      {coordinator.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        <FormField
          control={form.control}
          name={`subjects.${index}.roomNumber`}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Room number</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Eg. A-204" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name={`subjects.${index}.batchNumber`}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Batch number</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Eg. Batch-1" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
}
