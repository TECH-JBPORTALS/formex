"use client";

import { useProgramsIndex } from "@/lib/api/generated/program/program";
import { useQueryClient } from "@tanstack/react-query";

export function useProgramList() {
  const queryClient = useQueryClient();
  const { data, ...programQuery } = useProgramsIndex(
    {
      query: {
        select(data) {
          return data.status == 200 ? data.data.data : null;
        },
      },
    },
    queryClient,
  );

  return {
    programs: data,
    programQuery,
  };
}
