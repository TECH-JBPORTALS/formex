"use client";

import { useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useCallback, useMemo, useState } from "react";
import { toast } from "sonner";
import Container from "@/components/container";
import Header from "@/components/header";
import { SpinnerPage } from "@/components/spinner-page";
import { Badge } from "@/components/ui/badge";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ensureSanctumCsrf } from "@/lib/api/csrf";
import type {
  FeedbackQuestion,
  ValidationExceptionResponse,
} from "@/lib/api/generated/models";
import {
  getStudentFeedbackLinkIndexQueryKey,
  getStudentFeedbackSubmissionsIndexQueryKey,
  useStudentFeedbackFacultyDestroy,
  useStudentFeedbackLinkDestroy,
  useStudentFeedbackLinkIndex,
  useStudentFeedbackLinkStore,
  useStudentFeedbackQuestionIndex,
  useStudentFeedbackSubmissionsIndex,
} from "@/lib/api/generated/student-feedback/student-feedback";
import {
  StudentFeedbackLinkIndexResponse,
  StudentFeedbackLinkStoreBody,
  StudentFeedbackQuestionIndexResponse,
} from "@/lib/api/generated/student-feedback/student-feedback.zod";
import { useSubjectsShow } from "@/lib/api/generated/subject/subject";
import { useProgramsShow } from "@/lib/api/hooks/useProgramsShow";

type Props = {
  programId: string;
  subjectId: string;
  hidePageShell?: boolean;
};

type FeedbackLinkSummaryRow = {
  id: string;
  feedback_type: string;
  semester: number;
  academic_year: number;
  expires_at: string;
  is_active: boolean;
  status: "inactive" | "expired" | "active";
  created_at: string;
  share_url: string;
};

type SubmissionRatingItem = {
  question_id: string;
  question: string | null;
  order_index: number | null;
  rating: number;
};

type ScopeSubmissionRow = {
  feedback_link_id: string;
  feedback_type: string;
  student_id: string | null;
  full_name: string | null;
  register_no: string | null;
  average_rating: number;
  ratings: SubmissionRatingItem[];
};

function parseRatingItems(raw: unknown): SubmissionRatingItem[] {
  if (!Array.isArray(raw)) {
    return [];
  }
  const items = raw
    .map((entry): SubmissionRatingItem | null => {
      if (typeof entry !== "object" || entry === null) {
        return null;
      }
      const o = entry as Record<string, unknown>;
      if (typeof o.question_id !== "string") {
        return null;
      }
      const orderRaw = o.order_index;
      const orderIndex =
        typeof orderRaw === "number"
          ? orderRaw
          : typeof orderRaw === "string"
            ? Number.parseInt(orderRaw, 10)
            : null;
      return {
        question_id: o.question_id,
        question: typeof o.question === "string" ? o.question : null,
        order_index: Number.isFinite(orderIndex) ? orderIndex : null,
        rating: Number(o.rating),
      };
    })
    .filter((x): x is SubmissionRatingItem => x !== null);

  return items.sort(
    (a, b) => (a.order_index ?? 9999) - (b.order_index ?? 9999),
  );
}

function normalizeSubmissionRow(row: unknown): ScopeSubmissionRow | null {
  if (typeof row !== "object" || row === null) {
    return null;
  }
  const r = row as Record<string, unknown>;
  if (typeof r.feedback_link_id !== "string") {
    return null;
  }
  return {
    feedback_link_id: r.feedback_link_id,
    feedback_type: String(r.feedback_type ?? ""),
    student_id: typeof r.student_id === "string" ? r.student_id : null,
    full_name: typeof r.full_name === "string" ? r.full_name : null,
    register_no: typeof r.register_no === "string" ? r.register_no : null,
    average_rating: Number(r.average_rating),
    ratings: parseRatingItems(r.ratings),
  };
}

function feedbackTypeLabel(type: string): string {
  if (type === "end") {
    return "End-semester";
  }
  if (type === "mid") {
    return "Mid-semester";
  }
  return type;
}

function validationMessage(body: ValidationExceptionResponse): string {
  const errs = body.errors;
  if (!errs) {
    return body.message ?? "Validation failed.";
  }
  const first = Object.values(errs).flat()[0];
  return typeof first === "string" ? first : "Validation failed.";
}

function parseLinkRows(data: unknown): FeedbackLinkSummaryRow[] {
  const parsed = StudentFeedbackLinkIndexResponse.safeParse(data);
  if (parsed.success) {
    return parsed.data.data.map((row) => ({
      ...row,
      share_url:
        typeof (row as { share_url?: unknown }).share_url === "string"
          ? (row as { share_url: string }).share_url
          : "",
    }));
  }
  const raw = (data as { data?: unknown }).data;
  if (!Array.isArray(raw)) {
    return [];
  }
  return raw.filter((row): row is FeedbackLinkSummaryRow => {
    if (typeof row !== "object" || row === null) {
      return false;
    }
    const r = row as Record<string, unknown>;
    return (
      typeof r.id === "string" &&
      typeof r.feedback_type === "string" &&
      typeof r.status === "string"
    );
  }).map((row) => ({
    ...row,
    share_url: typeof row.share_url === "string" ? row.share_url : "",
  }));
}

function parseSubmissionRows(data: unknown): ScopeSubmissionRow[] {
  const raw = (data as { data?: unknown }).data;
  if (!Array.isArray(raw)) {
    return [];
  }
  return raw
    .map((row) => normalizeSubmissionRow(row))
    .filter((x): x is ScopeSubmissionRow => x !== null);
}

function statusBadgeVariant(
  status: string,
): "default" | "secondary" | "destructive" | "outline" {
  if (status === "active") {
    return "secondary";
  }
  if (status === "expired") {
    return "outline";
  }
  return "destructive";
}

export function SubjectFeedbackLinkReviewPage({
  programId,
  subjectId,
  hidePageShell = false,
}: Props) {
  const queryClient = useQueryClient();
  const [tab, setTab] = useState<"submissions" | "links">("submissions");
  const [createOpen, setCreateOpen] = useState(false);
  const [createPhase, setCreatePhase] = useState<"form" | "success">("form");
  const [feedbackType, setFeedbackType] = useState<"mid" | "end">("mid");
  const [expiresAtLocal, setExpiresAtLocal] = useState("");
  const [createdShareUrl, setCreatedShareUrl] = useState("");
  const [createdLinkId, setCreatedLinkId] = useState("");
  const [linkDeleteId, setLinkDeleteId] = useState<string | null>(null);
  const [answersRow, setAnswersRow] = useState<ScopeSubmissionRow | null>(null);

  const { data: program } = useProgramsShow(programId);
  const subjectQuery = useSubjectsShow(subjectId, {
    query: { enabled: !!subjectId },
  });
  const subject =
    subjectQuery.data?.status === 200 ? subjectQuery.data.data.data : null;

  const scopeParams = useMemo(
    () =>
      subject
        ? { course_id: programId, semester: subject.semester }
        : { course_id: programId, semester: 1 },
    [programId, subject],
  );

  const listEnabled = Boolean(subject);

  const linksQuery = useStudentFeedbackLinkIndex(scopeParams, {
    query: { enabled: listEnabled },
  });
  const submissionsQuery = useStudentFeedbackSubmissionsIndex(scopeParams, {
    query: { enabled: listEnabled },
  });

  const linkRows = useMemo(
    () =>
      linksQuery.data?.status === 200 && linksQuery.data.data
        ? parseLinkRows(linksQuery.data.data)
        : [],
    [linksQuery.data],
  );

  const submissionRows = useMemo(
    () =>
      submissionsQuery.data?.status === 200 && submissionsQuery.data.data
        ? parseSubmissionRows(submissionsQuery.data.data)
        : [],
    [submissionsQuery.data],
  );

  const questionsQuery = useStudentFeedbackQuestionIndex();
  const globalQuestions = useMemo(() => {
    const res = questionsQuery.data;
    if (res?.status !== 200 || !res.data) {
      return [];
    }
    const parsed = StudentFeedbackQuestionIndexResponse.safeParse(res.data);
    if (parsed.success) {
      return parsed.data.data;
    }

    const raw = (res.data as { data?: unknown }).data;
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
  }, [questionsQuery.data]);

  const linkStore = useStudentFeedbackLinkStore();
  const linkDestroy = useStudentFeedbackLinkDestroy();
  const facultyDestroy = useStudentFeedbackFacultyDestroy();

  const resetCreateDialog = useCallback(() => {
    setCreatePhase("form");
    setCreatedShareUrl("");
    setCreatedLinkId("");
    setExpiresAtLocal("");
    setFeedbackType("mid");
  }, []);

  const createLink = useCallback(async () => {
    if (!subject) {
      toast.error("Subject details are still loading.");
      return;
    }

    const expiresAt =
      expiresAtLocal.trim() === ""
        ? undefined
        : new Date(expiresAtLocal).toISOString();

    const payload = StudentFeedbackLinkStoreBody.safeParse({
      course_id: programId,
      semester: subject.semester,
      feedback_type: feedbackType,
      expires_at: expiresAt,
    });
    if (!payload.success) {
      toast.error(payload.error.issues[0]?.message ?? "Check link details.");
      return;
    }

    await ensureSanctumCsrf();
    const response = await linkStore.mutateAsync({ data: payload.data });
    if (response.status === 201 && response.data?.data) {
      const link = response.data.data;
      setCreatedShareUrl(link.link);
      setCreatedLinkId(link.id);
      setCreatePhase("success");
      toast.success("Feedback link created.");
      await queryClient.invalidateQueries({
        queryKey: getStudentFeedbackLinkIndexQueryKey(scopeParams),
      });
      await queryClient.invalidateQueries({
        queryKey: getStudentFeedbackSubmissionsIndexQueryKey(scopeParams),
      });
      return;
    }

    if (response.status === 422) {
      toast.error(validationMessage(response.data));
      return;
    }

    toast.error("Could not create link.");
  }, [
    expiresAtLocal,
    feedbackType,
    linkStore,
    programId,
    queryClient,
    scopeParams,
    subject,
  ]);

  const removeResponse = useCallback(
    async (feedbackLinkId: string, studentId: string) => {
      await ensureSanctumCsrf();
      const result = await facultyDestroy.mutateAsync({
        feedbackLink: feedbackLinkId,
        student: studentId,
      });
      if (result.status === 200) {
        toast.success("Response deleted.");
        await queryClient.invalidateQueries({
          queryKey: getStudentFeedbackSubmissionsIndexQueryKey(scopeParams),
        });
        await queryClient.invalidateQueries({
          queryKey: getStudentFeedbackLinkIndexQueryKey(scopeParams),
        });
        return;
      }
      toast.error("Could not delete response.");
    },
    [facultyDestroy, queryClient, scopeParams],
  );

  const copyShareLink = useCallback(async (url: string) => {
    if (!url) {
      return;
    }
    try {
      await navigator.clipboard.writeText(url);
      toast.success("Link copied.");
    } catch {
      toast.error("Could not copy link.");
    }
  }, []);

  const confirmDeleteLink = useCallback(async () => {
    if (!linkDeleteId) {
      return;
    }
    await ensureSanctumCsrf();
    const result = await linkDestroy.mutateAsync({
      feedbackLink: linkDeleteId,
    });
    if (result.status === 200) {
      toast.success("Feedback link deleted.");
      setLinkDeleteId(null);
      await queryClient.invalidateQueries({
        queryKey: getStudentFeedbackLinkIndexQueryKey(scopeParams),
      });
      await queryClient.invalidateQueries({
        queryKey: getStudentFeedbackSubmissionsIndexQueryKey(scopeParams),
      });
      return;
    }
    if (result.status === 404) {
      toast.error("Link not found.");
      setLinkDeleteId(null);
      return;
    }
    toast.error("Could not delete link.");
  }, [linkDeleteId, linkDestroy, queryClient, scopeParams]);

  const isQuestionsLoading = questionsQuery.isLoading;
  const noGlobalQuestions = !isQuestionsLoading && globalQuestions.length === 0;

  const onCreateOpenChange = useCallback(
    (open: boolean) => {
      setCreateOpen(open);
      if (!open) {
        resetCreateDialog();
      }
    },
    [resetCreateDialog],
  );

  return (
    <>
      {!hidePageShell ? (
        <Header>
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link href="/">Home</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link href={`/p/${programId}`}>
                    {program?.name ?? "Program"}
                  </Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link href={`/p/${programId}/subjects`}>Subjects</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>
                  {subject?.name ?? "Subject Feedback"}
                </BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </Header>
      ) : null}

      {hidePageShell ? (
        subjectQuery.isLoading ? (
          <SpinnerPage />
        ) : (
          <div className="space-y-6">
            <Card>
              <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <CardTitle>{subject?.name} Feedback</CardTitle>
                  <CardDescription>
                    Uses global feedback questions from the Principal dashboard.
                    Create links for this subject and review submissions.
                  </CardDescription>
                </div>
                <Button
                  type="button"
                  onClick={() => {
                    resetCreateDialog();
                    setCreateOpen(true);
                  }}
                  disabled={noGlobalQuestions || isQuestionsLoading}
                >
                  Create feedback link
                </Button>
              </CardHeader>
            </Card>

            {noGlobalQuestions ? (
              <p className="text-sm text-muted-foreground rounded-lg border border-border bg-muted/20 px-3 py-2">
                Add feedback questions on the home dashboard before creating links.
              </p>
            ) : null}

            <Tabs value={tab} onValueChange={(v) => setTab(v as typeof tab)}>
              <TabsList variant="line" className="w-full sm:w-auto">
                <TabsTrigger value="submissions">Submissions</TabsTrigger>
                <TabsTrigger value="links">Feedback links</TabsTrigger>
              </TabsList>

              <TabsContent value="submissions" className="mt-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Submitted feedback</CardTitle>
                    <CardDescription>
                      Click a row to see how this student rated each question.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {submissionsQuery.isLoading ? (
                      <SpinnerPage />
                    ) : submissionRows.length === 0 ? (
                      <p className="text-sm text-muted-foreground">
                        No submissions yet.
                      </p>
                    ) : (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Student</TableHead>
                            <TableHead>Register no.</TableHead>
                            <TableHead>Average</TableHead>
                            <TableHead>Feedback type</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {submissionRows.map((row) => (
                            <TableRow
                              key={`${row.feedback_link_id}-${row.student_id ?? row.register_no ?? "x"}`}
                              className="cursor-pointer hover:bg-muted/50"
                              tabIndex={0}
                              onClick={() => setAnswersRow(row)}
                              onKeyDown={(e) => {
                                if (e.key === "Enter" || e.key === " ") {
                                  e.preventDefault();
                                  setAnswersRow(row);
                                }
                              }}
                            >
                              <TableCell className="font-medium">
                                {row.full_name ?? "—"}
                              </TableCell>
                              <TableCell className="font-mono text-xs">
                                {row.register_no ?? "—"}
                              </TableCell>
                              <TableCell>
                                {Number.isFinite(row.average_rating)
                                  ? row.average_rating
                                  : "—"}
                              </TableCell>
                              <TableCell className="text-muted-foreground">
                                {feedbackTypeLabel(row.feedback_type)}
                              </TableCell>
                              <TableCell className="text-right">
                                <Button
                                  variant="destructive"
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    if (row.student_id) {
                                      void removeResponse(
                                        row.feedback_link_id,
                                        row.student_id,
                                      );
                                    }
                                  }}
                                  disabled={
                                    facultyDestroy.isPending || !row.student_id
                                  }
                                >
                                  Delete
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="links" className="mt-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Feedback links</CardTitle>
                    <CardDescription>
                      Every link created for this subject and semester. Status
                      reflects expiry and whether the link is still active.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {linksQuery.isLoading ? (
                      <SpinnerPage />
                    ) : linkRows.length === 0 ? (
                      <p className="text-sm text-muted-foreground">
                        No links yet. Use Create feedback link to add one.
                      </p>
                    ) : (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Type</TableHead>
                            <TableHead>Academic year</TableHead>
                            <TableHead>Created</TableHead>
                            <TableHead>Expires</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {linkRows.map((row) => (
                            <TableRow key={row.id}>
                              <TableCell className="capitalize">
                                {row.feedback_type}
                              </TableCell>
                              <TableCell>{row.academic_year}</TableCell>
                              <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                                {row.created_at
                                  ? new Date(row.created_at).toLocaleString()
                                  : "—"}
                              </TableCell>
                              <TableCell className="text-xs whitespace-nowrap">
                                {row.expires_at
                                  ? new Date(row.expires_at).toLocaleString()
                                  : "No expiry"}
                              </TableCell>
                              <TableCell>
                                <Badge variant={statusBadgeVariant(row.status)}>
                                  {row.status}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-right">
                                <div className="flex justify-end gap-2">
                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    disabled={!row.share_url}
                                    onClick={() =>
                                      void copyShareLink(row.share_url)
                                    }
                                  >
                                    Copy
                                  </Button>
                                  <Button
                                    type="button"
                                    variant="destructive"
                                    size="sm"
                                    onClick={() => setLinkDeleteId(row.id)}
                                    disabled={linkDestroy.isPending}
                                  >
                                    Delete
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        )
      ) : (
        <Container>
          {subjectQuery.isLoading ? (
            <SpinnerPage />
          ) : (
            <div className="space-y-6 max-w-5xl mx-auto">
            <Card>
              <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <CardTitle>{subject?.name} Feedback</CardTitle>
                  <CardDescription>
                    Uses global feedback questions from the Principal dashboard.
                    Create links for this subject and review submissions.
                  </CardDescription>
                </div>
                <Button
                  type="button"
                  onClick={() => {
                    resetCreateDialog();
                    setCreateOpen(true);
                  }}
                  disabled={noGlobalQuestions || isQuestionsLoading}
                >
                  Create feedback link
                </Button>
              </CardHeader>
            </Card>

            {noGlobalQuestions ? (
              <p className="text-sm text-muted-foreground rounded-lg border border-border bg-muted/20 px-3 py-2">
                Add feedback questions on the home dashboard before creating
                links.
              </p>
            ) : null}

            <Tabs value={tab} onValueChange={(v) => setTab(v as typeof tab)}>
              <TabsList variant="line" className="w-full sm:w-auto">
                <TabsTrigger value="submissions">Submissions</TabsTrigger>
                <TabsTrigger value="links">Feedback links</TabsTrigger>
              </TabsList>

              <TabsContent value="submissions" className="mt-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Submitted feedback</CardTitle>
                    <CardDescription>
                      Click a row to see how this student rated each question.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {submissionsQuery.isLoading ? (
                      <SpinnerPage />
                    ) : submissionRows.length === 0 ? (
                      <p className="text-sm text-muted-foreground">
                        No submissions yet.
                      </p>
                    ) : (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Student</TableHead>
                            <TableHead>Register no.</TableHead>
                            <TableHead>Average</TableHead>
                            <TableHead>Feedback type</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {submissionRows.map((row) => (
                            <TableRow
                              key={`${row.feedback_link_id}-${row.student_id ?? row.register_no ?? "x"}`}
                              className="cursor-pointer hover:bg-muted/50"
                              tabIndex={0}
                              onClick={() => setAnswersRow(row)}
                              onKeyDown={(e) => {
                                if (e.key === "Enter" || e.key === " ") {
                                  e.preventDefault();
                                  setAnswersRow(row);
                                }
                              }}
                            >
                              <TableCell className="font-medium">
                                {row.full_name ?? "—"}
                              </TableCell>
                              <TableCell className="font-mono text-xs">
                                {row.register_no ?? "—"}
                              </TableCell>
                              <TableCell>
                                {Number.isFinite(row.average_rating)
                                  ? row.average_rating
                                  : "—"}
                              </TableCell>
                              <TableCell className="text-muted-foreground">
                                {feedbackTypeLabel(row.feedback_type)}
                              </TableCell>
                              <TableCell className="text-right">
                                <Button
                                  variant="destructive"
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    if (row.student_id) {
                                      void removeResponse(
                                        row.feedback_link_id,
                                        row.student_id,
                                      );
                                    }
                                  }}
                                  disabled={
                                    facultyDestroy.isPending || !row.student_id
                                  }
                                >
                                  Delete
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="links" className="mt-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Feedback links</CardTitle>
                    <CardDescription>
                      Every link created for this subject and semester. Status
                      reflects expiry and whether the link is still active.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {linksQuery.isLoading ? (
                      <SpinnerPage />
                    ) : linkRows.length === 0 ? (
                      <p className="text-sm text-muted-foreground">
                        No links yet. Use Create feedback link to add one.
                      </p>
                    ) : (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Type</TableHead>
                            <TableHead>Academic year</TableHead>
                            <TableHead>Created</TableHead>
                            <TableHead>Expires</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {linkRows.map((row) => (
                            <TableRow key={row.id}>
                              <TableCell className="capitalize">
                                {row.feedback_type}
                              </TableCell>
                              <TableCell>{row.academic_year}</TableCell>
                              <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                                {row.created_at
                                  ? new Date(row.created_at).toLocaleString()
                                  : "—"}
                              </TableCell>
                              <TableCell className="text-xs whitespace-nowrap">
                                {row.expires_at
                                  ? new Date(row.expires_at).toLocaleString()
                                  : "No expiry"}
                              </TableCell>
                              <TableCell>
                                <Badge variant={statusBadgeVariant(row.status)}>
                                  {row.status}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-right">
                                <div className="flex justify-end gap-2">
                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    disabled={!row.share_url}
                                    onClick={() =>
                                      void copyShareLink(row.share_url)
                                    }
                                  >
                                    Copy
                                  </Button>
                                  <Button
                                    type="button"
                                    variant="destructive"
                                    size="sm"
                                    onClick={() => setLinkDeleteId(row.id)}
                                    disabled={linkDestroy.isPending}
                                  >
                                    Delete
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
            </div>
          )}
        </Container>
      )}

      <Dialog open={createOpen} onOpenChange={onCreateOpenChange}>
        <DialogContent className="sm:max-w-md" showCloseButton>
          {createPhase === "form" ? (
            <>
              <DialogHeader>
                <DialogTitle>Create feedback link</DialogTitle>
                <DialogDescription>
                  Scoped to this subject&apos;s program and semester. Students
                  open the link you share and verify with register number and
                  date of birth.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                {isQuestionsLoading ? (
                  <div className="rounded-md border bg-muted/30 p-3">
                    <SpinnerPage />
                  </div>
                ) : null}
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Program</Label>
                    <Input value={program?.name ?? ""} disabled />
                  </div>
                  <div className="space-y-2">
                    <Label>Semester</Label>
                    <Input
                      value={
                        subject?.semester ? String(subject.semester) : ""
                      }
                      disabled
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Feedback type</Label>
                  <Select
                    value={feedbackType}
                    onValueChange={(v) => setFeedbackType(v as "mid" | "end")}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="mid">Mid-semester</SelectItem>
                      <SelectItem value="end">End-semester</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dlg-link-expire">Expiry (optional)</Label>
                  <Input
                    id="dlg-link-expire"
                    type="datetime-local"
                    value={expiresAtLocal}
                    onChange={(e) => setExpiresAtLocal(e.target.value)}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onCreateOpenChange(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  onClick={() => void createLink()}
                  disabled={
                    linkStore.isPending ||
                    isQuestionsLoading ||
                    noGlobalQuestions
                  }
                >
                  {linkStore.isPending ? "Creating…" : "Generate link"}
                </Button>
              </DialogFooter>
            </>
          ) : (
            <>
              <DialogHeader>
                <DialogTitle>Link ready</DialogTitle>
                <DialogDescription>
                  Copy and share this URL with students. You can copy it again
                  anytime from the Feedback links tab.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-3">
                <div className="space-y-2">
                  <Label htmlFor="dlg-share-url">Share URL</Label>
                  <div className="flex gap-2">
                    <Input
                      id="dlg-share-url"
                      readOnly
                      className="font-mono text-xs"
                      value={createdShareUrl}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => void copyShareLink(createdShareUrl)}
                    >
                      Copy
                    </Button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dlg-link-id">Link ID</Label>
                  <Input
                    id="dlg-link-id"
                    readOnly
                    className="font-mono text-xs"
                    value={createdLinkId}
                  />
                </div>
              </div>
              <DialogFooter className="gap-2 sm:gap-0">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    resetCreateDialog();
                    setCreatePhase("form");
                  }}
                >
                  Create another
                </Button>
                <Button
                  type="button"
                  onClick={() => {
                    onCreateOpenChange(false);
                    setTab("links");
                  }}
                >
                  Done
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      <Dialog
        open={answersRow !== null}
        onOpenChange={(open) => {
          if (!open) {
            setAnswersRow(null);
          }
        }}
      >
        <DialogContent
          className="flex max-h-[85vh] max-w-lg flex-col gap-0 sm:max-w-lg"
          showCloseButton
        >
          <DialogHeader>
            <DialogTitle>Question responses</DialogTitle>
            <DialogDescription>
              {answersRow
                ? `${answersRow.full_name ?? "—"} (${answersRow.register_no ?? "—"}) · ${feedbackTypeLabel(answersRow.feedback_type)} · Average ${Number.isFinite(answersRow.average_rating) ? answersRow.average_rating : "—"}`
                : ""}
            </DialogDescription>
          </DialogHeader>
          <div className="min-h-0 flex-1 overflow-y-auto py-4 space-y-3">
            {answersRow?.ratings.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No per-question ratings were returned for this submission.
              </p>
            ) : (
              answersRow?.ratings.map((item) => (
                <div
                  key={item.question_id}
                  className="rounded-lg border border-border/80 bg-muted/20 p-3"
                >
                  <p className="text-sm font-medium leading-snug">
                    {item.question ?? "Question"}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1.5 tabular-nums">
                    Rating:{" "}
                    {Number.isFinite(item.rating)
                      ? `${item.rating} / 5`
                      : "—"}
                  </p>
                </div>
              ))
            )}
          </div>
          <DialogFooter className="border-t border-border pt-4">
            <Button type="button" variant="outline" onClick={() => setAnswersRow(null)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={linkDeleteId !== null}
        onOpenChange={(open) => {
          if (!open) {
            setLinkDeleteId(null);
          }
        }}
      >
        <AlertDialogContent size="default">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete feedback link?</AlertDialogTitle>
            <AlertDialogDescription>
              All student submissions for this link will be removed. This cannot
              be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel type="button">Cancel</AlertDialogCancel>
            <Button
              type="button"
              variant="destructive"
              disabled={linkDestroy.isPending}
              onClick={() => void confirmDeleteLink()}
            >
              {linkDestroy.isPending ? "Deleting…" : "Delete link"}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
