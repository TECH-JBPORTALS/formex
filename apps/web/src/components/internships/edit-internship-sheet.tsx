"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
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
import { InternshipsUpdateBody } from "@/lib/api/generated/internship/internship.zod";
import z from "zod";
import { internshipDefaults } from "./internship-form.helpers";

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

  const form = useForm({
    resolver: zodResolver(InternshipsUpdateBody),
    defaultValues: internshipDefaults(internship),
  });

  useEffect(() => {
    if (open) {
      form.reset({
        from_date: internship?.from_date ?? new Date().toISOString(),
        to_date: internship?.to_date ?? new Date().toISOString(),
        industry_name: internship?.industry_name ?? "",
        industry_address: internship?.industry_address ?? "",
        role: internship?.role ?? "",
      });
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

  async function onSubmit(values: z.infer<typeof InternshipsUpdateBody>) {
    await updateMutation.mutateAsync({
      internship: internship.id,
      data: values,
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
