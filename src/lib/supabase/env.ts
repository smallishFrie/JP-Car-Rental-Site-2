const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

export function hasSupabaseEnv() {
  return Boolean(SUPABASE_URL && SUPABASE_PUBLISHABLE_KEY);
}

export function readEnv(name: "NEXT_PUBLIC_SUPABASE_URL" | "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY") {
  const value = name === "NEXT_PUBLIC_SUPABASE_URL" ? SUPABASE_URL : SUPABASE_PUBLISHABLE_KEY;
  if (!value) {
    throw new Error(`Missing required env var: ${name}`);
  }
  return value;
}
