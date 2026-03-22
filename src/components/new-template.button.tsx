"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useTRPC } from "@/trpc/client";
import { Button } from "./ui/button";

export default function NewTemplateButton() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const router = useRouter();
  const { mutate, isPending } = useMutation(
    trpc.template.create.mutationOptions({
      async onSuccess(data) {
        await queryClient.invalidateQueries(trpc.template.pathFilter());
        router.push(`/t/${data.id}`);
      },
      onError(error) {
        toast.error(error.message);
      },
    }),
  );

  return (
    <Button disabled={isPending} onClick={() => mutate()}>
      {isPending ? "Creating.." : "New Template"}
    </Button>
  );
}
