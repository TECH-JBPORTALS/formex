import { useAuthUserSuspense } from "@/lib/api/generated/auth/auth";

/**
 * To fetch the suspensed auth user.
 * Make sure your prefetching it first on the server.
 */
export function useSession() {
  const { data } = useAuthUserSuspense({
    query: {
      select(data) {
        return data.status == 200 ? data.data : null;
      },
    },
  });

  return data;
}
