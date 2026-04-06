"use client";

import { useStudentSearch } from "@/lib/api/generated/student/student";
import { useQueryClient } from "@tanstack/react-query";

export function useSearchStudent({
  q,
  enabled = true,
}: {
  q: string;
  enabled?: boolean;
}) {
  const queryClient = useQueryClient();
  const trimmed = q.trim();
  const studentSearchQuery = useStudentSearch(
    trimmed ? { q: trimmed } : undefined,
    {
      query: {
        enabled: enabled && trimmed.length > 0,
        select(data) {
          return data.status == 200 ? data.data.data : null;
        },
      },
    },
    queryClient,
  );

  return {
    studentSearchQuery,
    students: studentSearchQuery.data ?? [],
  };
}
