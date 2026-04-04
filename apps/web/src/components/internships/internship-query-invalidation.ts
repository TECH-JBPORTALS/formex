import type { QueryClient } from "@tanstack/react-query";
import {
  getInternshipListByProgramQueryKey,
  getInternshipListByStudentQueryKey,
  getInternshipsIndexQueryKey,
} from "@/lib/api/generated/internship/internship";
import type { Internship } from "@/lib/api/generated/models";

export async function invalidateInternshipCaches(
  queryClient: QueryClient,
  internship: Pick<Internship, "program_id" | "student_id">,
) {
  await queryClient.invalidateQueries({
    queryKey: getInternshipsIndexQueryKey(),
  });
  await queryClient.invalidateQueries({
    queryKey: getInternshipListByProgramQueryKey(internship.program_id),
  });
  await queryClient.invalidateQueries({
    queryKey: getInternshipListByStudentQueryKey(internship.student_id),
  });
}
