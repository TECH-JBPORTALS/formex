"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import {
  type InternshipFieldsFormValues,
  internshipFieldsSchema,
  internshipToFormValues,
  toInternshipsUpdateBody,
} from "@/components/internships/internship-form";
import { invalidateInternshipCaches } from "@/components/internships/internship-query-invalidation";
import { Button } from "@/components/ui/button";
import {
  Form,
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
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useInternshipsUpdate } from "@/lib/api/generated/internship/internship";
import type { Internship } from "@/lib/api/generated/models";

const SEMESTERS = [1, 2, 3, 4, 5, 6] as const;

export function EditInternshipSheet({
  internship,
  open,
  onOpenChange,
}: {
  internship: Internship;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const queryClient = useQueryClient();

  const form = useForm<InternshipFieldsFormValues>({
    resolver: zodResolver(internshipFieldsSchema),
    defaultValues: internshipToFormValues(internship),
  });

  useEffect(() => {
    if (open) {
      form.reset(internshipToFormValues(internship));
    }
  }, [open, internship, form]);

  const updateMutation = useInternshipsUpdate(
    {
      mutation: {
        onSuccess: async (res) => {
          if (res.status !== 200) {
            toast.error("Could not update internship");
            return;
          }
          await invalidateInternshipCaches(queryClient, internship);
          toast.success("Internship updated");
          onOpenChange(false);
        },
        onError: (err) => {
          toast.error(
            err instanceof Error ? err.message : "Could not update internship",
          );
        },
      },
    },
    queryClient,
  );

  async function onSubmit(values: InternshipFieldsFormValues) {
    await updateMutation.mutateAsync({
      internship: internship.id,
      data: toInternshipsUpdateBody(values),
    });
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="flex w-full flex-col gap-0 overflow-hidden sm:max-w-lg">
        <SheetHeader>
          <SheetTitle>Edit internship</SheetTitle>
          <SheetDescription>
            {internship.industry_name} · {internship.role}
          </SheetDescription>
        </SheetHeader>

        <Form {...form}>
          <form
            id="edit-internship-sheet-form"
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex flex-1 flex-col gap-4 overflow-y-auto px-6 pb-4"
          >
            <FormField
              control={form.control}
              name="industry_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Industry name</FormLabel>
                  <FormControl>
                    <Input placeholder="Company or organization" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="industry_address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Industry address</FormLabel>
                  <FormControl>
                    <Input placeholder="Address" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Role</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Trainee developer" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="from_date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>From</FormLabel>
                  <FormControl>
                    <Input type="datetime-local" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="to_date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>To</FormLabel>
                  <FormControl>
                    <Input type="datetime-local" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="semester"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Semester</FormLabel>
                  <Select
                    onValueChange={(v) => field.onChange(Number(v))}
                    value={String(field.value)}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Semester" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {SEMESTERS.map((s) => (
                        <SelectItem key={s} value={String(s)}>
                          {s}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="acad_year"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Academic year</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={2000}
                      name={field.name}
                      ref={field.ref}
                      onBlur={field.onBlur}
                      value={field.value}
                      onChange={(e) => {
                        const n = e.target.valueAsNumber;
                        field.onChange(Number.isFinite(n) ? n : 2000);
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </form>
        </Form>

        <SheetFooter className="border-t">
          <SheetClose asChild>
            <Button type="button" variant="outline">
              Cancel
            </Button>
          </SheetClose>
          <Button
            type="submit"
            form="edit-internship-sheet-form"
            disabled={updateMutation.isPending}
          >
            {updateMutation.isPending ? "Saving…" : "Save"}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
