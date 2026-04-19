"use client";

import { HelpCircleIcon, PlusSignIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { ensureSanctumCsrf } from "@/lib/api/csrf";
import type { FeedbackQuestion } from "@/lib/api/generated/models";
import {
  getStudentFeedbackQuestionIndexQueryKey,
  useStudentFeedbackQuestionDestroy,
  useStudentFeedbackQuestionIndex,
  useStudentFeedbackQuestionStore,
} from "@/lib/api/generated/student-feedback/student-feedback";
import { StudentFeedbackQuestionIndexResponse } from "@/lib/api/generated/student-feedback/student-feedback.zod";
import { cn } from "@/lib/utils";

/** Global feedback criteria — same behavior as legacy `GlobalFeedbackQuestions`; presentation improved. */
export function FeedbackQuestionsCard({ className }: { className?: string }) {
  const queryClient = useQueryClient();
  const [newQuestion, setNewQuestion] = useState("");

  const questionQuery = useStudentFeedbackQuestionIndex();
  const createQuestion = useStudentFeedbackQuestionStore();
  const deleteQuestion = useStudentFeedbackQuestionDestroy();

  const questions = useMemo(() => {
    const response = questionQuery.data;
    if (response?.status !== 200 || !response.data) {
      return [];
    }

    const parsed = StudentFeedbackQuestionIndexResponse.safeParse(
      response.data,
    );
    if (parsed.success) {
      return parsed.data.data;
    }

    const raw = (response.data as { data?: unknown }).data;
    if (!Array.isArray(raw)) {
      return [];
    }

    return raw.filter(
      (item): item is FeedbackQuestion =>
        typeof item === "object" &&
        item !== null &&
        "id" in item &&
        "question" in item &&
        "order_index" in item,
    );
  }, [questionQuery.data]);

  async function handleAddQuestion() {
    const trimmed = newQuestion.trim();
    if (!trimmed) {
      toast.error("Question cannot be empty.");
      return;
    }

    await ensureSanctumCsrf();
    const response = await createQuestion.mutateAsync({
      data: { question: trimmed },
    });

    if (response.status === 201) {
      toast.success("Question added.");
      setNewQuestion("");
      await queryClient.invalidateQueries({
        queryKey: getStudentFeedbackQuestionIndexQueryKey(),
      });
      return;
    }

    toast.error("Could not add question.");
  }

  async function handleDeleteQuestion(questionId: string) {
    await ensureSanctumCsrf();
    const response = await deleteQuestion.mutateAsync({
      feedbackQuestion: questionId,
    });

    if (response.status === 200) {
      toast.success("Question deleted.");
      await queryClient.invalidateQueries({
        queryKey: getStudentFeedbackQuestionIndexQueryKey(),
      });
      return;
    }

    toast.error("Could not delete question.");
  }

  return (
    <Card
      className={cn(
        "flex h-full min-h-0 flex-col overflow-hidden border-border/80 shadow-md shadow-black/5 transition-all duration-200 hover:shadow-lg hover:shadow-black/6",
        className,
      )}
    >
      <CardHeader className="border-b border-border/60 bg-muted/20 pb-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex gap-3">
            <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary ring-1 ring-primary/15">
              <HugeiconsIcon icon={HelpCircleIcon} className="size-6" />
            </div>
            <div className="space-y-1">
              <CardTitle className="text-xl font-semibold tracking-tight">
                Global Feedback Questions
              </CardTitle>
              <CardDescription className="max-w-xl leading-relaxed">
                These criteria are shared across all subjects in this
                institution.
              </CardDescription>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex min-h-0 flex-1 flex-col space-y-5 pt-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:gap-2">
          <Input
            value={newQuestion}
            onChange={(e) => setNewQuestion(e.target.value)}
            placeholder="Add a new global feedback question"
            className="h-11 rounded-xl border-border/80 bg-background"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                void handleAddQuestion();
              }
            }}
          />
          <Button
            type="button"
            className="h-11 shrink-0 rounded-xl"
            onClick={() => void handleAddQuestion()}
            disabled={createQuestion.isPending || !newQuestion.trim()}
          >
            Add question
            <HugeiconsIcon icon={PlusSignIcon} className="size-4" />
          </Button>
        </div>

        <div className="overflow-hidden rounded-2xl border border-border/70 bg-muted/10">
          {questionQuery.isLoading ? (
            <ul className="divide-y divide-border/60 p-2">
              {(["row-a", "row-b", "row-c"] as const).map((rowKey) => (
                <li key={rowKey} className="flex items-center gap-3 p-3">
                  <Skeleton className="h-4 w-8 rounded" />
                  <Skeleton className="h-4 flex-1 rounded" />
                  <Skeleton className="h-9 w-20 rounded-lg" />
                </li>
              ))}
            </ul>
          ) : questions.length === 0 ? (
            <p className="p-6 text-sm text-muted-foreground">
              No questions configured yet.
            </p>
          ) : (
            <ul className="divide-y divide-border/60">
              {questions.map((question) => (
                <li
                  key={question.id}
                  className="flex flex-col gap-3 p-4 transition-colors hover:bg-muted/30 sm:flex-row sm:items-center sm:justify-between"
                >
                  <p className="text-sm leading-relaxed">
                    <span className="mr-2 font-mono text-xs text-muted-foreground">
                      #{question.order_index}
                    </span>
                    {question.question}
                  </p>
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    className="shrink-0 rounded-lg"
                    onClick={() => void handleDeleteQuestion(question.id)}
                    disabled={deleteQuestion.isPending || questions.length <= 1}
                  >
                    Delete
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {questions.length <= 1 ? (
          <p className="text-xs text-muted-foreground">
            Minimum one global question is required.
          </p>
        ) : null}
      </CardContent>
    </Card>
  );
}
