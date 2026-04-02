"use client";

import { Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { signUpWithPassword } from "@/auth/client";
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

const schema = z
  .object({
    name: z.string().min(2),
    email: z.email(),
    password: z.string().min(8),
    passwordConfirmation: z.string().min(8),
  })
  .refine((data) => data.password === data.passwordConfirmation, {
    message: "Passwords must match",
    path: ["passwordConfirmation"],
  });

export default function SignUpPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [formState, setFormState] = useState({
    name: "",
    email: "",
    password: "",
    passwordConfirmation: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const callbackUrl = searchParams.get("callbackUrl") ?? "/";

  async function handleSubmit(e: React.ChangeEvent<HTMLFormElement>) {
    e.preventDefault();
    const parse = schema.safeParse(formState);
    if (!parse.success) {
      const issue = parse.error.issues[0]?.message ?? "Check your input.";
      toast.error(issue);
      return;
    }
    setIsSubmitting(true);
    try {
      const result = await signUpWithPassword(
        formState.name,
        formState.email,
        formState.password,
        formState.passwordConfirmation,
      );

      if (result.ok) {
        router.push(callbackUrl);
        router.refresh();
      } else {
        toast.error(result.message);
      }
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-background via-muted to-background flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <Card className="border-border/60 backdrop-blur-sm bg-background/80">
          <CardHeader className=" text-center">
            <CardTitle className="text-xl font-mono font-semibold tracking-tight">
              Create your account
            </CardTitle>
            <CardDescription>
              Join Formex and start managing your formats in minutes.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <Label htmlFor="name">Full name</Label>
                <Input
                  id="name"
                  autoComplete="name"
                  placeholder="John Doe"
                  value={formState.name}
                  onChange={(e) =>
                    setFormState((s) => ({ ...s, name: e.target.value }))
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email address</Label>
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  value={formState.email}
                  onChange={(e) =>
                    setFormState((s) => ({ ...s, email: e.target.value }))
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  autoComplete="new-password"
                  placeholder="At least 8 characters"
                  value={formState.password}
                  onChange={(e) =>
                    setFormState((s) => ({ ...s, password: e.target.value }))
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="passwordConfirmation">Confirm password</Label>
                <Input
                  id="passwordConfirmation"
                  type="password"
                  autoComplete="new-password"
                  placeholder="Repeat password"
                  value={formState.passwordConfirmation}
                  onChange={(e) =>
                    setFormState((s) => ({
                      ...s,
                      passwordConfirmation: e.target.value,
                    }))
                  }
                  required
                />
              </div>

              <Button
                type="submit"
                className="w-full mt-2"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating account…
                  </>
                ) : (
                  "Sign up"
                )}
              </Button>
            </form>

            <p className="mt-4 text-sm text-muted-foreground text-center">
              Already have an account?{" "}
              <Link
                href="/sign-in"
                className="font-medium text-primary hover:underline"
              >
                Sign in
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
