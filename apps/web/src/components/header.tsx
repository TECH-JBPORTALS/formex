import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export default function Header({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return (
    <header
      className={cn(
        "sticky top-0 z-10 flex h-12 shrink-0 items-center border-b border-border bg-background/95 px-6 backdrop-blur supports-[backdrop-filter]:bg-background/80",
        className,
      )}
    >
      {children}
    </header>
  );
}
