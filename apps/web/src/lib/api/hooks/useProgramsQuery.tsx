import { useAuthUserSuspense } from "@/lib/api/generated/auth/auth";
import {
  getProgramsIndexQueryKey,
  useProgramsIndex,
} from "@/lib/api/generated/context-program/context-program";

export function useProgramsQuery() {
  const { data: authData } = useAuthUserSuspense();

  const institutionId =
    authData.status == 200 && authData.data.current_institution_id;

  return useProgramsIndex(
    institutionId
      ? {
          query: { queryKey: [...getProgramsIndexQueryKey(), institutionId] },
        }
      : {
          query: { queryKey: getProgramsIndexQueryKey() },
        },
  );
}
