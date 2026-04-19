"use client";

import { PlusSignIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Protect } from "@/components/auth/protect";
import { SpinnerPage } from "@/components/spinner-page";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ensureSanctumCsrf } from "@/lib/api/csrf";
import type { FeedbackQuestion } from "@/lib/api/generated/models";
import {
  getStudentFeedbackQuestionIndexQueryKey,
  useStudentFeedbackQuestionDestroy,
  useStudentFeedbackQuestionIndex,
  useStudentFeedbackQuestionStore,
} from "@/lib/api/generated/student-feedback/student-feedback";
import { StudentFeedbackQuestionIndexResponse } from "@/lib/api/generated/student-feedback/student-feedback.zod";

export function GlobalFeedbackQuestions() {
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
    <Protect allowedRoles={["principal"]}>
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Global Feedback Questions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            These criteria are shared across all subjects in this institution.
          </p>

          <div className="flex gap-2">
            <Input
              value={newQuestion}
              onChange={(e) => setNewQuestion(e.target.value)}
              placeholder="Add a new global feedback question"
            />
            <Button
              type="button"
              onClick={() => void handleAddQuestion()}
              disabled={createQuestion.isPending || !newQuestion.trim()}
            >
              Add <HugeiconsIcon icon={PlusSignIcon} />
            </Button>
          </div>

          <div className="rounded-md border divide-y">
            {questionQuery.isLoading ? (
              <div className="py-4">
                <SpinnerPage />
              </div>
            ) : questions.length === 0 ? (
              <p className="text-sm text-muted-foreground p-4">
                No questions configured yet.
              </p>
            ) : (
              questions.map((question) => (
                <div
                  key={question.id}
                  className="p-3 flex items-center justify-between gap-3"
                >
                  <p className="text-sm">
                    <span className="text-muted-foreground mr-2">
                      #{question.order_index}
                    </span>
                    {question.question}
                  </p>
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    onClick={() => void handleDeleteQuestion(question.id)}
                    disabled={deleteQuestion.isPending || questions.length <= 1}
                  >
                    Delete
                  </Button>
                </div>
              ))
            )}
          </div>

          {questions.length <= 1 ? (
            <p className="text-xs text-muted-foreground">
              Minimum one global question is required.
            </p>
          ) : null}
        </CardContent>
      </Card>
    </Protect>
  );
}
