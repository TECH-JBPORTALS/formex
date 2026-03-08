"use client";

import { useQuery } from "@tanstack/react-query";
import * as _ from "lodash";
import { useTRPC } from "@/trpc/client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "../ui/empty";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";

export function TemplateList() {
  const trpc = useTRPC();
  const { data: templates, isLoading } = useQuery(
    trpc.template.list.queryOptions(),
  );

  if (isLoading) return <div>Loading...</div>;

  if (_.isEmpty(templates))
    return (
      <section className="min-h-screen flex items-center justify-center">
        <Empty>
          <EmptyMedia className="font-mono text-2xl font-bold">T</EmptyMedia>
          <EmptyHeader>
            <EmptyTitle>No Documents</EmptyTitle>
            <EmptyDescription>
              Create document to see it over here.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      </section>
    );

  return (
    <section className="grid grid-cols-4 px-6 py-8 gap-4">
      {templates?.map((t) => (
        <Link key={t.id} href={`/doc/${t.id}`}>
          <Card className="pt-0 active:shadow-none">
            <CardContent className="min-h-52 flex items-center justify-center bg-muted w-full">
              <strong className="text-muted-foreground text-sm">
                TEMPLATE
              </strong>
            </CardContent>
            <CardHeader>
              <CardTitle>{t.title}</CardTitle>
              <CardDescription>
                Created {formatDistanceToNow(t.createdAt, { addSuffix: true })}
              </CardDescription>
            </CardHeader>
          </Card>
        </Link>
      ))}
    </section>
  );
}
