"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";

export function QueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() =>
    new QueryClient({
      defaultOptions: {
        queries: {
          staleTime: 1 * 60 * 1000, // 1 minute
          gcTime: 15 * 60 * 1000, // 15 minutes
          retry: 1, // Only retry once
          refetchOnWindowFocus: false, // Don't refetch when window regains focus
          refetchOnReconnect: false, // Don't refetch on reconnect
        },
      },
    })
  );

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}
