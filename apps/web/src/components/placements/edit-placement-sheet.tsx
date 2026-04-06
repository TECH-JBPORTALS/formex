"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import {
  placementDetailsSchema,
  placementToFormValues,
  toPlacementsUpdateBody,
  type PlacementDetailsFormValues,
} from "@/components/placements/placement-details-form";
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
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import type { Placement } from "@/lib/api/generated/models";
import {
  getPlacementListByStudentQueryKey,
  getPlacementsIndexQueryKey,
  usePlacementsUpdate,
} from "@/lib/api/generated/placement/placement";

export function EditPlacementSheet({
  placement,
  open,
  onOpenChange,
}: {
  placement: Placement;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const queryClient = useQueryClient();

  const form = useForm<PlacementDetailsFormValues>({
    resolver: zodResolver(placementDetailsSchema),
    defaultValues: placementToFormValues(placement),
  });

  useEffect(() => {
    if (open) {
      form.reset(placementToFormValues(placement));
    }
  }, [open, placement, form]);

  const updateMutation = usePlacementsUpdate(
    {
      mutation: {
        onSuccess: async (res) => {
          if (res.status !== 200) {
            toast.error("Could not update placement");
            return;
          }
          await queryClient.invalidateQueries({
            queryKey: getPlacementsIndexQueryKey(),
          });
          await queryClient.invalidateQueries({
            queryKey: getPlacementListByStudentQueryKey(placement.student_id),
          });
          toast.success("Placement updated");
          onOpenChange(false);
        },
        onError: (err) => {
          toast.error(
            err instanceof Error ? err.message : "Could not update placement",
          );
        },
      },
    },
    queryClient,
  );

  async function onSubmit(values: PlacementDetailsFormValues) {
    await updateMutation.mutateAsync({
      placement: placement.id,
      data: toPlacementsUpdateBody(values),
    });
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="flex w-full flex-col gap-0 overflow-hidden sm:max-w-lg">
        <SheetHeader>
          <SheetTitle>Edit placement</SheetTitle>
          <SheetDescription>
            {placement.industry_name} · {placement.role}
          </SheetDescription>
        </SheetHeader>

        <Form {...form}>
          <form
            id="edit-placement-sheet-form"
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex flex-1 flex-col gap-4 overflow-y-auto px-6 pb-4"
          >
            <FormField
              control={form.control}
              name="industry_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Industry / company</FormLabel>
                  <FormControl>
                    <Input placeholder="Company name" {...field} />
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
                  <FormLabel>Address</FormLabel>
                  <FormControl>
                    <Input placeholder="Work location" {...field} />
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
                    <Input placeholder="Job title" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="ctc"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>CTC</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. 6 LPA" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </form>
          <SheetFooter className="border-t px-6 py-4 sm:flex-row">
            <Button
              type="submit"
              form="edit-placement-sheet-form"
              disabled={updateMutation.isPending}
            >
              {updateMutation.isPending ? "Saving…" : "Save changes"}
            </Button>
          </SheetFooter>
        </Form>
      </SheetContent>
    </Sheet>
  );
}
