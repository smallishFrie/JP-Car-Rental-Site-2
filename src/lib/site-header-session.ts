import "server-only";

import type { SiteHeaderSession } from "@/types/site-header-session";
import { createClient } from "@/lib/supabase/server";
import { hasSupabaseEnv } from "@/lib/supabase/env";

export type { SiteHeaderSession } from "@/types/site-header-session";

export async function getSiteHeaderSession(): Promise<SiteHeaderSession> {
  if (!hasSupabaseEnv()) {
    return { signedIn: false, isAdmin: false };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { signedIn: false, isAdmin: false };
  }

  return {
    signedIn: true,
    isAdmin: user.app_metadata?.role === "admin",
  };
}
