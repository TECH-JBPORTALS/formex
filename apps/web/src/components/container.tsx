import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export default function Container({
  children,
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("py-6 px-14", className)} {...props}>
      {children}
    </div>
  );
}
