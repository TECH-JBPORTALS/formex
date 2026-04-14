"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { toast } from "sonner";
import z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { SubjectFormGroup } from "./SubjectFormGroup";
import {
  areTimetableFormStatesEqual,
  createSubjectEntry,
  getEndHourOptions,
  type TimetableFormState,
  type TimetableSlot,
  type TimetableSubjectOption,
  useTimetableStore,
} from "./useTimetableStore";

const subjectEntrySchema = z.object({
  subjectId: z.string().trim().min(1, "Subject is required"),
  coordinatorId: z.string().trim().min(1, "Coordinator is required"),
  roomNumber: z.string().trim().min(1, "Room number is required"),
  batchNumber: z.string().trim().min(1, "Batch number is required"),
});

const timetableSheetSchema = z.object({
  endHour: z
    .number()
    .nullable()
    .refine((value) => value !== null, {
      message: "Select an end hour",
    }),
  subjects: z
    .array(subjectEntrySchema)
    .min(1, "Add at least one subject")
    .max(10, "Too many subjects"),
});

type TimetableSheetProps = {
  subjectOptions: TimetableSubjectOption[];
  onSaveSlot?: (slot: TimetableSlot) => Promise<void> | void;
  isSaving?: boolean;
};

export function TimetableSheet({
  subjectOptions,
  onSaveSlot,
  isSaving = false,
}: TimetableSheetProps) {
  const selectedCell = useTimetableStore((state) => state.selectedCell);
  const formState = useTimetableStore((state) => state.formState);
  const clearSelection = useTimetableStore((state) => state.clearSelection);
  const setFormState = useTimetableStore((state) => state.setFormState);
  const updateSlot = useTimetableStore((state) => state.updateSlot);
  const applySlot = useTimetableStore((state) => state.applySlot);
  const resetForm = useTimetableStore((state) => state.resetForm);

  const form = useForm<TimetableFormState>({
    resolver: zodResolver(timetableSheetSchema),
    defaultValues: formState,
    mode: "onChange",
  });

  const subjectArray = useFieldArray({
    control: form.control,
    name: "subjects",
  });

  useEffect(() => {
    if (selectedCell) {
      form.reset(useTimetableStore.getState().formState);
    }
  }, [form, selectedCell]);

  useEffect(() => {
    const subscription = form.watch((values) => {
      const normalized: TimetableFormState = {
        endHour: typeof values.endHour === "number" ? values.endHour : null,
        subjects: values.subjects?.map((subject) => {
          const resolvedSubjectId =
            subject.subjectId ?? subjectOptions[0]?.id ?? "";
          const resolvedSubject = subjectOptions.find(
            (entry) => entry.id === resolvedSubjectId,
          );
          const coordinatorId =
            subject.coordinatorId?.trim() &&
            resolvedSubject?.coordinators.some(
              (entry) => entry.id === subject.coordinatorId,
            )
              ? subject.coordinatorId
              : (resolvedSubject?.coordinators[0]?.id ?? "");

          return {
            subjectId: resolvedSubjectId,
            coordinatorId,
            roomNumber: subject.roomNumber ?? "",
            batchNumber: subject.batchNumber ?? "",
          };
        }) ?? [createSubjectEntry(subjectOptions)],
      };

      const current = useTimetableStore.getState().formState;
      if (!areTimetableFormStatesEqual(current, normalized)) {
        setFormState(normalized);
      }
    });

    return () => subscription.unsubscribe();
  }, [form, setFormState, subjectOptions]);

  const isOpen = Boolean(selectedCell);
  const startHour = selectedCell?.startHour ?? null;
  const endHourOptions = startHour ? getEndHourOptions(startHour) : [];

  async function handleSave(values: TimetableFormState) {
    setFormState(values);
    const result = updateSlot();
    if (!result.ok) {
      toast.error(result.message ?? "Could not save slot.");
      return;
    }
    if (result.slot && onSaveSlot) {
      try {
        await onSaveSlot(result.slot);
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "Could not save slot.",
        );
        return;
      }
    }
    if (result.slot) {
      applySlot(result.slot);
    }
    clearSelection();
    toast.success("Slot saved successfully.");
  }

  return (
    <Sheet
      open={isOpen}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) {
          clearSelection();
        }
      }}
    >
      <SheetContent className="w-full sm:max-w-xl">
        <SheetHeader>
          <SheetTitle>
            {selectedCell
              ? `${selectedCell.day} • H${selectedCell.startHour}`
              : "Timetable slot"}
          </SheetTitle>
          <SheetDescription>
            Pick an end hour and assign one or more subjects to this slot.
          </SheetDescription>
        </SheetHeader>

        {selectedCell ? (
          <Form {...form}>
            <form
              id="timetable-sheet-form"
              onSubmit={form.handleSubmit(handleSave)}
              className="flex h-full flex-col"
            >
              <div className="flex flex-1 flex-col gap-4 overflow-y-auto px-6 pb-4">
                <FormField
                  control={form.control}
                  name="endHour"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Select end hour</FormLabel>
                      <FormControl>
                        <Select
                          value={field.value ? String(field.value) : ""}
                          onValueChange={(nextValue) =>
                            field.onChange(Number(nextValue))
                          }
                        >
                          <SelectTrigger className="w-full rounded-xl">
                            <SelectValue placeholder="Select end hour" />
                          </SelectTrigger>
                          <SelectContent>
                            {endHourOptions.map((hour) => (
                              <SelectItem key={hour} value={String(hour)}>
                                H{hour}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {endHourOptions.length === 0 ? (
                  <p className="text-xs text-amber-600">
                    No valid end hour for this start hour.
                  </p>
                ) : null}

                <div className="space-y-3">
                  {subjectArray.fields.map((field, index) => (
                    <SubjectFormGroup
                      key={field.id}
                      index={index}
                      form={form}
                      subjectOptions={subjectOptions}
                      canRemove={subjectArray.fields.length > 1}
                      onRemove={() => subjectArray.remove(index)}
                    />
                  ))}
                </div>

                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={() =>
                    subjectArray.append(createSubjectEntry(subjectOptions))
                  }
                >
                  Add Another Subject
                </Button>
                {subjectOptions.length === 0 ? (
                  <p className="text-xs text-amber-600">
                    Add subjects and assign coordinators first.
                  </p>
                ) : null}
              </div>

              <SheetFooter className="border-t px-6 py-4 sm:flex-row">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => {
                    resetForm();
                    form.reset(useTimetableStore.getState().formState);
                  }}
                >
                  Reset
                </Button>
                <Button
                  type="submit"
                  form="timetable-sheet-form"
                  disabled={
                    !selectedCell ||
                    endHourOptions.length === 0 ||
                    subjectOptions.length === 0 ||
                    isSaving
                  }
                >
                  {isSaving ? "Saving..." : "Save Slot"}
                </Button>
              </SheetFooter>
            </form>
          </Form>
        ) : null}
      </SheetContent>
    </Sheet>
  );
}
