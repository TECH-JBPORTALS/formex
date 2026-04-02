import type { ReactNode } from "react";

export function AppSidebar({ children }: { children: ReactNode }) {
  return <div className="flex w-full min-w-0 flex-1">{children}</div>;
}
