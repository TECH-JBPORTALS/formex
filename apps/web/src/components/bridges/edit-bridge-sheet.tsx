"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { invalidateBridgeCaches } from "@/components/bridges/bridge-query-invalidation";
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
import { Textarea } from "@/components/ui/textarea";
import { useBridgesUpdate } from "@/lib/api/generated/bridgre/bridgre";
import type { Bridge } from "@/lib/api/generated/models";
import { BridgesUpdateBody } from "@/lib/api/generated/bridgre/bridgre.zod";
import z from "zod";
import {
  bridgeUpdateDefaults,
  isoFromDateTimeLocal,
  toDateTimeLocalInputValue,
} from "./bridge-form.helpers";

type BridgeUpdateValues = z.infer<typeof BridgesUpdateBody>;

export function EditBridgeSheet({
  bridge,
  open,
  onOpenChange,
}: {
  bridge: Bridge;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const queryClient = useQueryClient();

  const form = useForm<BridgeUpdateValues>({
    resolver: zodResolver(BridgesUpdateBody),
    defaultValues: bridgeUpdateDefaults(bridge),
  });

  useEffect(() => {
    if (open) {
      form.reset(bridgeUpdateDefaults(bridge));
    }
  }, [bridge, form, open]);

  const updateMutation = useBridgesUpdate(
    {
      mutation: {
        onSuccess: async (res) => {
          if (res.status !== 200) {
            toast.error("Could not update bridge session");
            return;
          }
          await invalidateBridgeCaches(queryClient, bridge);
          toast.success("Bridge session updated");
          onOpenChange(false);
        },
        onError: (err) => {
          toast.error(
            err instanceof Error
              ? err.message
              : "Could not update bridge session",
          );
        },
      },
    },
    queryClient,
  );

  async function onSubmit(values: BridgeUpdateValues) {
    await updateMutation.mutateAsync({
      bridge: bridge.id as unknown as number,
      data: BridgesUpdateBody.parse(values),
    });
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="flex w-full flex-col gap-0 overflow-hidden sm:max-w-lg">
        <SheetHeader>
          <SheetTitle>Edit bridge session</SheetTitle>
          <SheetDescription>{bridge.curriculum_gap}</SheetDescription>
        </SheetHeader>

        <Form {...form}>
          <form
            id="edit-bridge-sheet-form"
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex flex-1 flex-col gap-4 overflow-y-auto px-6 pb-4"
          >
            <FormField
              control={form.control}
              name="curriculum_gap"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Curriculum gap</FormLabel>
                  <FormControl>
                    <Input placeholder="Gap identified" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="details"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Details</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Session details"
                      rows={4}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="conducted_date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Conducted date</FormLabel>
                  <FormControl>
                    <Input
                      type="datetime-local"
                      value={toDateTimeLocalInputValue(field.value)}
                      onChange={(e) =>
                        field.onChange(isoFromDateTimeLocal(e.target.value))
                      }
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="venue"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Venue</FormLabel>
                  <FormControl>
                    <Input placeholder="Venue" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="resource_person_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Resource person</FormLabel>
                  <FormControl>
                    <Input placeholder="Resource person name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="company_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Company name</FormLabel>
                  <FormControl>
                    <Input placeholder="Company name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="designation"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Designation</FormLabel>
                  <FormControl>
                    <Input placeholder="Designation" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="students_present"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Students present</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={0}
                      value={field.value}
                      onChange={(e) =>
                        field.onChange(Number(e.target.value || 0))
                      }
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="relevance"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Relevance</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Why this session matters"
                      rows={3}
                      {...field}
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
            form="edit-bridge-sheet-form"
            disabled={updateMutation.isPending}
          >
            {updateMutation.isPending ? "Saving…" : "Save"}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
