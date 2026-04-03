
import { QueryClient } from '@tanstack/react-query';

export const createQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000, // 1 min (important for hydration)
        gcTime: 5 * 60_000,
        // Prevent “double requests” right after server hydration.
        // We still allow refetching via explicit calls / invalidations.
        refetchOnMount: false,
        refetchOnReconnect: false,
        refetchOnWindowFocus: false,
      },
    },
  });