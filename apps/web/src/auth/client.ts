"use client";

import { ensureSanctumCsrf } from "../lib/api/csrf";
import {
  authLogin,
  authLogout,
  authRegister,
} from "../lib/api/generated/auth/auth";
import type { ValidationExceptionResponse } from "../lib/api/generated/models";

function validationMessage(body: ValidationExceptionResponse): string {
  const errs = body.errors;
  if (!errs) {
    return body.message ?? "Validation failed.";
  }
  const first = Object.values(errs).flat()[0];
  return typeof first === "string" ? first : "Validation failed.";
}

export async function signInWithPassword(
  email: string,
  password: string,
): Promise<{ ok: true } | { ok: false; message: string }> {
  await ensureSanctumCsrf();
  const r = await authLogin({ email, password });
  if (r.status === 200) {
    return { ok: true };
  }
  if (r.status === 422) {
    return { ok: false, message: validationMessage(r.data) };
  }
  return { ok: false, message: "Unable to sign in." };
}

export async function signUpWithPassword(
  name: string,
  email: string,
  password: string,
  passwordConfirmation: string,
): Promise<{ ok: true } | { ok: false; message: string }> {
  await ensureSanctumCsrf();
  const r = await authRegister({
    name,
    email,
    password,
    password_confirmation: passwordConfirmation,
  });
  if (r.status === 201) {
    return { ok: true };
  }
  if (r.status === 422) {
    return { ok: false, message: validationMessage(r.data) };
  }
  return { ok: false, message: "Unable to sign up." };
}

export async function signOutSession(): Promise<void> {
  await ensureSanctumCsrf();
  await authLogout().then(()=>window.location.href);
}
