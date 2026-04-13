import type { QueryClient } from "@tanstack/react-query";
import {
  getBridgesIndexQueryKey,
  getBridgreListByProgramQueryKey,
  getBridgreListBySubjectQueryKey,
} from "@/lib/api/generated/bridgre/bridgre";
import type { Bridge } from "@/lib/api/generated/models";

type BridgeInvalidateTarget = Pick<Bridge, "program_id" | "subject_id"> &
  Partial<Pick<Bridge, "program" | "subject">>;

export async function invalidateBridgeCaches(
  queryClient: QueryClient,
  bridge: BridgeInvalidateTarget,
) {
  const programId = bridge.program_id || bridge.program?.id;
  const subjectId = bridge.subject_id || bridge.subject?.id;

  await queryClient.invalidateQueries({
    queryKey: getBridgesIndexQueryKey(),
  });
  if (programId) {
    await queryClient.invalidateQueries({
      queryKey: getBridgreListByProgramQueryKey(programId),
    });
  }
  if (subjectId) {
    await queryClient.invalidateQueries({
      queryKey: getBridgreListBySubjectQueryKey(subjectId),
    });
  }
}
