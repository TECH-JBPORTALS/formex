"use client";

import { ensureSanctumCsrf } from "../api/csrf";
import {
  authLogin,
  authLogout,
  authRegister,
} from "../api/generated/auth/auth";
import { facultyInvitationAccept, facultyInvitationShow } from "../api/generated/faculty-invitation/faculty-invitation";
import type { ValidationExceptionResponse } from "../api/generated/models";

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

export async function getFacultyInvitation(
  token: string,
): Promise<
  | { ok: true; data: { full_name: string; email: string } }
  | { ok: false; message: string }
> {
  const response = await facultyInvitationShow(token,{headers:{
   "Content-Type": "application/json",
  }});

  if (response.status === 200) {
    const fullName = response.data?.data?.full_name;
    const email = response.data?.data?.email;
    if (typeof fullName === "string" && typeof email === "string") {
      return { ok: true, data: { full_name: fullName, email } };
    }
  }

  return {
    ok: false,
    message: "Invitation token is invalid or expired.",
  };
}

export async function signUpWithInvitation(
  token: string,
  password: string,
  password_confirmation: string,
): Promise<{ ok: true } | { ok: false; message: string }> {
  await ensureSanctumCsrf();

  const response = await facultyInvitationAccept({password,token,password_confirmation},{headers:{
    "Content-Type": "application/json",
  }})

  if (response.status === 201) {
    return { ok: true };
  }

  return { ok: false, message: response.data?.message ?? "Unable to sign up." };
}

export async function signOutSession(): Promise<void> {
  await ensureSanctumCsrf();
  await authLogout().then(() => window.location.href);
}
