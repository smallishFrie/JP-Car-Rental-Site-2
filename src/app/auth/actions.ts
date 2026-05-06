"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { hasSupabaseEnv } from "@/lib/supabase/env";

function isSafePath(path: string) {
  return path.startsWith("/") && !path.startsWith("//");
}

function getPath(formData: FormData, key: string, fallback: string) {
  const raw = String(formData.get(key) ?? "");
  return isSafePath(raw) ? raw : fallback;
}

async function getOrigin() {
  const headerStore = await headers();
  const host = headerStore.get("x-forwarded-host") ?? headerStore.get("host");
  const proto = headerStore.get("x-forwarded-proto") ?? "http";
  if (!host) return process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  return `${proto}://${host}`;
}

export async function signUpWithEmail(formData: FormData) {
  const returnPath = getPath(formData, "returnPath", "/auth/create-account");
  if (!hasSupabaseEnv()) redirect(`${returnPath}?message=Supabase environment variables are not configured.`);

  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");
  const confirmPassword = String(formData.get("confirmPassword") ?? "");
  if (!password || password.length < 6) {
    redirect(`${returnPath}?message=${encodeURIComponent("Password must be at least 6 characters.")}`);
  }
  if (password !== confirmPassword) {
    redirect(`${returnPath}?message=${encodeURIComponent("Passwords do not match.")}`);
  }

  const supabase = await createClient();
  const origin = await getOrigin();
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: { emailRedirectTo: `${origin}/auth/callback` },
  });
  if (error) redirect(`${returnPath}?message=${encodeURIComponent(error.message)}`);
  redirect(`${returnPath}?message=Check your inbox to confirm your account.`);
}

export async function signInWithEmail(formData: FormData) {
  const returnPath = getPath(formData, "returnPath", "/auth/sign-in");
  const redirectTo = getPath(formData, "redirectTo", "/");
  if (!hasSupabaseEnv()) redirect(`${returnPath}?message=Supabase environment variables are not configured.`);

  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");
  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) redirect(`${returnPath}?message=${encodeURIComponent(error.message)}`);
  redirect(redirectTo);
}

export async function signOut() {
  if (!hasSupabaseEnv()) redirect("/");
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}
