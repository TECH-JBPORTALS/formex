import type React from "react";

export default function Container({ children }: { children: React.ReactNode }) {
  return <div className="py-8 px-14">{children}</div>;
}
