"use client";

import { Loader2 } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useCallback, useMemo, useState } from "react";
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
import { Label } from "@/components/ui/label";
import { ensureSanctumCsrf } from "@/lib/api/csrf";
import type {
  FeedbackQuestion,
  ValidationExceptionResponse,
} from "@/lib/api/generated/models";
import {
  useStudentFeedbackLinkShow,
  useStudentFeedbackLinkStart,
  useStudentFeedbackLinkSubmit,
} from "@/lib/api/generated/student-feedback/student-feedback";
import {
  StudentFeedbackLinkShowResponse,
  StudentFeedbackLinkStartBody,
  StudentFeedbackLinkStartResponse,
  StudentFeedbackLinkSubmitBody,
} from "@/lib/api/generated/student-feedback/student-feedback.zod";

function validationMessage(body: ValidationExceptionResponse): string {
  const errs = body.errors;
  if (!errs) {
    return body.message ?? "Validation failed.";
  }
  const first = Object.values(errs).flat()[0];
  return typeof first === "string" ? first : "Validation failed.";
}

/** API expects `date_of_birth` as ISO-8601; HTML date input is `YYYY-MM-DD`. */
function dateOnlyToIsoDateTime(dateOnly: string): string {
  return `${dateOnly}T12:00:00.000Z`;
}

function StudentFeedbackPageInner() {
  const searchParams = useSearchParams();
  const token = useMemo(() => searchParams.get("token") ?? "", [searchParams]);

  const [registerNo, setRegisterNo] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [startPayload, setStartPayload] = useState<
    ReturnType<typeof StudentFeedbackLinkStartResponse.parse>["data"] | null
  >(null);
  const [ratings, setRatings] = useState<Record<string, number>>({});

  const linkShow = useStudentFeedbackLinkShow(token, {
    query: { enabled: Boolean(token) },
  });

  const startMutation = useStudentFeedbackLinkStart();
  const submitMutation = useStudentFeedbackLinkSubmit();

  const linkMeta = useMemo(() => {
    const res = linkShow.data;
    if (res?.status !== 200 || !res.data) {
      return null;
    }
    const parsed = StudentFeedbackLinkShowResponse.safeParse(res.data);
    if (!parsed.success) {
      return null;
    }
    return parsed.data.data;
  }, [linkShow.data]);

  const handleStart = useCallback(async () => {
    if (!token) {
      return;
    }
    const dobParsed = StudentFeedbackLinkStartBody.safeParse({
      register_no: registerNo,
      date_of_birth: dateOnlyToIsoDateTime(dateOfBirth),
    });
    if (!dobParsed.success) {
      toast.error(dobParsed.error.issues[0]?.message ?? "Check your input.");
      return;
    }
    await ensureSanctumCsrf();
    const result = await startMutation.mutateAsync({
      token,
      data: dobParsed.data,
    });
    if (result.status === 422) {
      toast.error(validationMessage(result.data));
      return;
    }
    if (result.status !== 200 || !result.data) {
      toast.error("Unable to verify your details.");
      return;
    }
    const parsed = StudentFeedbackLinkStartResponse.safeParse(result.data);
    if (!parsed.success) {
      toast.error("Unexpected response from server.");
      return;
    }
    setStartPayload(parsed.data.data);
    if (parsed.data.data.already_submitted) {
      toast.success("You have already submitted feedback for this link.");
    }
  }, [dateOfBirth, registerNo, startMutation, token]);

  const handleSubmitRatings = useCallback(async () => {
    if (!token || !startPayload?.questions) {
      return;
    }
    const questionRows = startPayload.questions.filter(
      (q): q is FeedbackQuestion => typeof q === "object" && q !== null,
    );
    if (questionRows.length === 0) {
      return;
    }
    const ratingsList = questionRows.map((q) => ({
      question_id: q.id,
      rating: ratings[q.id] ?? 0,
    }));
    const bodyParsed = StudentFeedbackLinkSubmitBody.safeParse({
      register_no: registerNo,
      date_of_birth: dateOnlyToIsoDateTime(dateOfBirth),
      ratings: ratingsList,
    });
    if (!bodyParsed.success) {
      toast.error(
        bodyParsed.error.issues[0]?.message ?? "Rate every question.",
      );
      return;
    }
    await ensureSanctumCsrf();
    const result = await submitMutation.mutateAsync({
      token,
      data: bodyParsed.data,
    });
    if (result.status === 422) {
      toast.error(validationMessage(result.data));
      return;
    }
    if (result.status !== 201) {
      toast.error("Unable to submit feedback.");
      return;
    }
    toast.success("Thank you — your feedback was submitted.");
    setStartPayload((prev) =>
      prev ? { ...prev, already_submitted: true, questions: [] } : prev,
    );
  }, [dateOfBirth, ratings, registerNo, startPayload, submitMutation, token]);

  if (!token) {
    return (
      <div className="min-h-screen bg-linear-to-br from-background via-muted to-background flex items-center justify-center px-4">
        <Card className="w-full max-w-md border-border/60 backdrop-blur-sm bg-background/80">
          <CardHeader>
            <CardTitle className="font-mono text-xl">
              Student feedback
            </CardTitle>
            <CardDescription>
              This page needs a valid link. Open the URL your institution shared
              with you (it should contain{" "}
              <span className="font-mono text-xs">?token=…</span>).
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" asChild>
              <Link href="/sign-in">Staff sign in</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (linkShow.isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const showRes = linkShow.data;
  if (showRes && showRes.status !== 200) {
    const msg =
      showRes.status === 422
        ? validationMessage(
            showRes.data as unknown as ValidationExceptionResponse,
          )
        : "This feedback link is invalid or has expired.";
    return (
      <div className="min-h-screen bg-linear-to-br from-background via-muted to-background flex items-center justify-center px-4">
        <Card className="w-full max-w-md border-border/60">
          <CardHeader>
            <CardTitle className="font-mono text-xl">
              Link unavailable
            </CardTitle>
            <CardDescription>{msg}</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  const questionRows =
    startPayload?.questions && Array.isArray(startPayload.questions)
      ? startPayload.questions.filter(
          (q): q is FeedbackQuestion => typeof q === "object" && q !== null,
        )
      : [];
  const hasQuestionForm = questionRows.length > 0;

  return (
    <div className="min-h-screen bg-linear-to-br from-background via-muted to-background flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-lg space-y-6">
        <Card className="border-border/60 backdrop-blur-sm bg-background/80">
          <CardHeader>
            <CardTitle className="font-mono text-xl tracking-tight">
              Course feedback
            </CardTitle>
            <CardDescription>
              {linkMeta
                ? `Semester ${String(linkMeta.semester)} · ${linkMeta.feedback_type === "end" ? "End" : "Mid"}-semester · Academic year ${String(linkMeta.academic_year)}`
                : "Loading link details…"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {!startPayload ? (
              <>
                <div className="space-y-2">
                  <Label htmlFor="register_no">Register number</Label>
                  <Input
                    id="register_no"
                    autoComplete="username"
                    value={registerNo}
                    onChange={(e) => setRegisterNo(e.target.value)}
                    placeholder="As on your ID card"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dob">Date of birth</Label>
                  <Input
                    id="dob"
                    type="date"
                    value={dateOfBirth}
                    onChange={(e) => setDateOfBirth(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    Use your official date of birth — it acts as your password
                    for this form.
                  </p>
                </div>
                <Button
                  className="w-full"
                  onClick={() => void handleStart()}
                  disabled={
                    startMutation.isPending || !registerNo || !dateOfBirth
                  }
                >
                  {startMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Verifying…
                    </>
                  ) : (
                    "Continue"
                  )}
                </Button>
              </>
            ) : startPayload.already_submitted ? (
              <p className="text-sm text-muted-foreground">
                You have already completed feedback for this link. No further
                action is needed.
              </p>
            ) : hasQuestionForm ? (
              <>
                <p className="text-sm">
                  Signed in as{" "}
                  <span className="font-medium">
                    {startPayload.student.full_name}
                  </span>
                  .
                </p>
                <div className="space-y-6">
                  {questionRows.map((q) => (
                    <div key={q.id} className="space-y-2">
                      <Label className="text-sm leading-snug">
                        {q.question}
                      </Label>
                      <div className="flex flex-wrap gap-2">
                        {[1, 2, 3, 4, 5].map((n) => (
                          <Button
                            key={n}
                            type="button"
                            size="sm"
                            variant={
                              ratings[q.id] === n ? "default" : "outline"
                            }
                            onClick={() =>
                              setRatings((prev) => ({ ...prev, [q.id]: n }))
                            }
                          >
                            {n}
                          </Button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
                <Button
                  className="w-full"
                  onClick={() => void handleSubmitRatings()}
                  disabled={
                    submitMutation.isPending ||
                    questionRows.some((q) => !ratings[q.id])
                  }
                >
                  {submitMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Submitting…
                    </>
                  ) : (
                    "Submit feedback"
                  )}
                </Button>
              </>
            ) : null}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function StudentFeedbackPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      }
    >
      <StudentFeedbackPageInner />
    </Suspense>
  );
}
