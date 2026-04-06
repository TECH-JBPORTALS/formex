"use client";

import { usePlacementsIndex } from "@/lib/api/generated/placement/placement";
import { useQueryClient } from "@tanstack/react-query";

export function usePlacementsList() {
  const queryClient = useQueryClient();
  const { data, ...placementsQuery } = usePlacementsIndex(
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
    placements: data,
    placementsQuery,
  };
}
