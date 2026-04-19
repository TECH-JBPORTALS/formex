"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { Download, RefreshCw, Trash2, Upload } from "lucide-react";
import type { ReactNode } from "react";
import { useCallback, useEffect, useId, useRef, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  type CalendarUploadKind,
  fetchCalendarFileBlob,
  fetchCalendarUploadsIndex,
  removeCalendarFile,
  uploadCalendarFile,
} from "@/lib/api/institution-calendar-uploads";
import { cn } from "@/lib/utils";

const CALENDAR_UPLOAD_QK = ["institution", "calendar-uploads"] as const;

function isPdfMime(mime: string): boolean {
  return mime === "application/pdf" || mime.endsWith("/pdf");
}

function isImageMime(mime: string): boolean {
  return mime.startsWith("image/");
}

type CalendarUploadCardProps = {
  kind: CalendarUploadKind;
  title: string;
  description: string;
  icon?: ReactNode;
  className?: string;
};

export function CalendarUploadCard({
  kind,
  title,
  description,
  icon,
  className,
}: CalendarUploadCardProps) {
  const queryClient = useQueryClient();
  const inputRef = useRef<HTMLInputElement>(null);
  const inputId = useId();
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const uploadsQuery = useQuery({
    queryKey: CALENDAR_UPLOAD_QK,
    queryFn: fetchCalendarUploadsIndex,
    retry: 1,
  });

  const meta = uploadsQuery.data?.[kind] ?? null;

  useEffect(() => {
    if (!meta) {
      setPreviewUrl(null);
      return;
    }

    let objectUrl: string | null = null;
    let cancelled = false;

    async function loadPreview() {
      try {
        const blob = await fetchCalendarFileBlob(kind);
        if (cancelled) {
          return;
        }
        objectUrl = URL.createObjectURL(blob);
        setPreviewUrl(objectUrl);
      } catch {
        if (!cancelled) {
          setPreviewUrl(null);
          toast.error("Could not load preview.");
        }
      }
    }

    void loadPreview();

    return () => {
      cancelled = true;
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
      setPreviewUrl(null);
    };
  }, [kind, meta?.updated_at, meta]);

  const uploadMutation = useMutation({
    mutationFn: (file: File) => uploadCalendarFile(kind, file),
    onSuccess: async (result) => {
      if (result.ok) {
        toast.success("File uploaded.");
        await queryClient.invalidateQueries({
          queryKey: [...CALENDAR_UPLOAD_QK],
        });
        return;
      }
      toast.error(result.errorMessage ?? "Upload failed.");
    },
    onError: () => toast.error("Upload failed."),
  });

  const removeMutation = useMutation({
    mutationFn: () => removeCalendarFile(kind),
    onSuccess: async (result) => {
      if (result.ok) {
        toast.success("File removed.");
        await queryClient.invalidateQueries({
          queryKey: [...CALENDAR_UPLOAD_QK],
        });
        setPreviewUrl(null);
        return;
      }
      toast.error(result.errorMessage ?? "Could not remove file.");
    },
    onError: () => toast.error("Could not remove file."),
  });

  const pickFile = useCallback(() => {
    inputRef.current?.click();
  }, []);

  const onFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      e.target.value = "";
      if (!file) {
        return;
      }
      uploadMutation.mutate(file);
    },
    [uploadMutation],
  );

  const handleDownload = useCallback(async () => {
    if (!meta) {
      return;
    }
    try {
      const blob = await fetchCalendarFileBlob(kind);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = meta.original_filename || "calendar";
      a.rel = "noopener";
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch {
      toast.error("Download failed.");
    }
  }, [kind, meta]);

  const busy =
    uploadsQuery.isLoading ||
    uploadMutation.isPending ||
    removeMutation.isPending;

  let loadErrorMessage: string | null = null;
  if (uploadsQuery.error instanceof Error) {
    loadErrorMessage = uploadsQuery.error.message;
  } else if (uploadsQuery.error != null) {
    loadErrorMessage = String(uploadsQuery.error);
  }

  return (
    <Card
      className={cn(
        "flex h-full min-h-0 flex-col overflow-hidden border-border/80 shadow-md shadow-black/5 transition-all duration-200 hover:border-border hover:shadow-lg hover:shadow-black/6",
        className,
      )}
    >
      <CardHeader className="border-b border-border/60 bg-muted/15 pb-4">
        <div className="flex gap-3">
          {icon ? (
            <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary ring-1 ring-primary/15">
              {icon}
            </div>
          ) : null}
          <div className="min-w-0 space-y-1">
            <CardTitle className="text-lg font-semibold tracking-tight">
              {title}
            </CardTitle>
            <CardDescription className="leading-relaxed">
              {description}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex min-h-0 flex-1 flex-col gap-4 pt-6">
        <input
          ref={inputRef}
          id={inputId}
          type="file"
          accept=".pdf,.png,.jpg,.jpeg,application/pdf,image/png,image/jpeg"
          className="sr-only"
          onChange={onFileChange}
        />

        {uploadsQuery.isError ? (
          <div className="flex min-h-[200px] flex-1 flex-col justify-center gap-3 rounded-2xl border border-destructive/30 bg-destructive/5 px-4 py-6">
            <p className="text-sm font-medium text-destructive">
              Could not load upload status
            </p>
            {loadErrorMessage ? (
              <p className="text-pretty text-sm text-muted-foreground leading-relaxed">
                {loadErrorMessage}
              </p>
            ) : null}
            <Button
              type="button"
              variant="secondary"
              size="sm"
              className="w-fit rounded-xl"
              disabled={uploadsQuery.isFetching}
              onClick={() => void uploadsQuery.refetch()}
            >
              Try again
            </Button>
          </div>
        ) : uploadsQuery.isLoading ? (
          <Skeleton className="min-h-[200px] w-full flex-1 rounded-2xl" />
        ) : !meta ? (
          <button
            type="button"
            disabled={busy}
            onClick={pickFile}
            className="group relative flex min-h-[200px] w-full flex-1 flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-border/80 bg-muted/20 px-4 py-10 text-center transition-colors hover:border-primary/40 hover:bg-muted/35 disabled:opacity-60"
          >
            <Upload className="size-8 text-muted-foreground transition-colors group-hover:text-primary" />
            <span className="text-sm font-medium text-foreground">
              Upload calendar file
            </span>
            <span className="max-w-[260px] text-xs text-muted-foreground">
              PDF or image · one file per institution · max ~12&nbsp;MB
            </span>
          </button>
        ) : (
          <>
            <div className="flex min-h-0 flex-1 flex-col rounded-2xl border border-border/70 bg-muted/15 p-3">
              <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Preview
              </p>
              {previewUrl && isPdfMime(meta.mime_type) ? (
                <iframe
                  title={`${title} preview`}
                  src={previewUrl}
                  className="min-h-[180px] w-full flex-1 rounded-xl border border-border/60 bg-background"
                />
              ) : previewUrl && isImageMime(meta.mime_type) ? (
                // biome-ignore lint/performance/noImgElement: ephemeral blob URLs are not suited to next/image
                <img
                  src={previewUrl}
                  alt=""
                  className="max-h-[min(280px,40vh)] w-full flex-1 rounded-xl border border-border/60 object-contain"
                />
              ) : (
                <div className="flex min-h-[160px] flex-col gap-1 rounded-xl border border-border/60 bg-background/80 px-4 py-6 text-sm text-muted-foreground">
                  <span className="font-medium text-foreground">
                    {meta.original_filename}
                  </span>
                  Preview is not available for this file type in the browser.
                  Use Download to open it.
                </div>
              )}

              {meta.updated_at ? (
                <p className="mt-3 text-xs text-muted-foreground">
                  Last updated{" "}
                  <time dateTime={meta.updated_at}>
                    {format(new Date(meta.updated_at), "PPpp")}
                  </time>
                </p>
              ) : null}
            </div>

            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                className="rounded-xl"
                disabled={busy}
                onClick={pickFile}
              >
                <RefreshCw className="size-4 opacity-80" />
                Replace
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="rounded-xl"
                disabled={busy}
                onClick={() => void handleDownload()}
              >
                <Download className="size-4 opacity-80" />
                Download
              </Button>
              <Button
                type="button"
                variant="destructive"
                size="sm"
                className="rounded-xl"
                disabled={busy}
                onClick={() => removeMutation.mutate()}
              >
                <Trash2 className="size-4 opacity-90" />
                Remove
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
