import { createUploadthing, type FileRouter } from "uploadthing/next";
import { UploadThingError } from "uploadthing/server";
import { getStatefulHeadersForLaravel } from "../../../lib/api/laravel-stateful-headers";

const f = createUploadthing();

async function laravelUserIdFromRequestCookies(
  cookieHeader: string | null,
  reqHeaders: Headers,
): Promise<string | null> {
  if (!cookieHeader) {
    return null;
  }
  const backend = (
    process.env.LARAVEL_BACKEND_URL ?? "http://127.0.0.1:8000"
  ).replace(/\/$/, "");
  const res = await fetch(`${backend}/api/user`, {
    headers: getStatefulHeadersForLaravel(cookieHeader, {
      headers: reqHeaders,
    }),
    cache: "no-store",
  });
  if (!res.ok) {
    return null;
  }
  const json = (await res.json()) as { user?: { id: string } };
  return json.user?.id ?? null;
}

export const ourFileRouter = {
  wordDocUploader: f({
    "application/vnd.ms-word.template.macroenabled.12": {
      maxFileSize: "1GB",
      maxFileCount: 1,
    },
  })
    .middleware(async ({ req }) => {
      const userId = await laravelUserIdFromRequestCookies(
        req.headers.get("cookie"),
        req.headers,
      );

      if (!userId) {
        throw new UploadThingError("Unauthorized");
      }

      return { userId };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      console.log("Upload complete for userId:", metadata.userId);
      console.log("file url", file.ufsUrl);
      return { uploadedBy: metadata.userId };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
