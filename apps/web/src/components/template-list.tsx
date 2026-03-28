"use client";

import { useQuery } from "@tanstack/react-query";
import { formatDistanceToNowStrict } from "date-fns";
import Link from "next/link";
import { useTRPC } from "@/trpc/client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Spinner } from "./ui/spinner";

export function TemplateList() {
  const trpc = useTRPC();
  const { data, isLoading } = useQuery(trpc.template.list.queryOptions());

  if (isLoading)
    return (
      <div className="h-svh w-full flex items-center justify-center">
        <Spinner />
      </div>
    );

  return (
    <div className="grid grid-cols-4 gap-4 px-6">
      {data?.map((t) => (
        <Link key={t.id} href={`/t/${t.id}`}>
          <Card className="hover:shadow-md transition-all duration-100 hover:bg-accent/20 active:scale-[99%]">
            <CardContent className="min-h-40 border-b">
              <div>DOCX TEMPLATE</div>
            </CardContent>
            <CardHeader>
              <CardTitle>{t.title}</CardTitle>
              <CardDescription>
                {formatDistanceToNowStrict(t.createdAt, { addSuffix: true })}
              </CardDescription>
            </CardHeader>
          </Card>
        </Link>
      ))}
    </div>
  );
}
