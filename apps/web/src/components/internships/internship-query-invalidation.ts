import type { QueryClient } from "@tanstack/react-query";
import {
  getInternshipListByProgramQueryKey,
  getInternshipListByStudentQueryKey,
  getInternshipsIndexQueryKey,
} from "@/lib/api/generated/internship/internship";
import type { Internship } from "@/lib/api/generated/models";

type InternshipInvalidateTarget = Pick<Internship, "program_id" | "student_id"> &
  Partial<Pick<Internship, "program" | "student">>;

export async function invalidateInternshipCaches(
  queryClient: QueryClient,
  internship: InternshipInvalidateTarget,
) {
  const programId = internship.program_id || internship.program?.id;
  const studentId = internship.student_id || internship.student?.id;

  await queryClient.invalidateQueries({
    queryKey: getInternshipsIndexQueryKey(),
  });
  if (programId) {
    await queryClient.invalidateQueries({
      queryKey: getInternshipListByProgramQueryKey(programId),
    });
  }
  if (studentId) {
    await queryClient.invalidateQueries({
      queryKey: getInternshipListByStudentQueryKey(studentId),
    });
  }
}
