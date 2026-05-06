import { redirect } from "next/navigation";
import AuthFormCard from "@/app/components/AuthFormCard";
import { createClient } from "@/lib/supabase/server";
import { hasSupabaseEnv } from "@/lib/supabase/env";

type CreateAccountPageProps = {
  searchParams: Promise<{ message?: string; returnTo?: string }>;
};

export default async function CreateAccountPage({ searchParams }: CreateAccountPageProps) {
  const { message, returnTo } = await searchParams;
  const safeReturnTo = returnTo?.startsWith("/") && !returnTo.startsWith("//") ? returnTo : "/";

  if (hasSupabaseEnv()) {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) redirect(safeReturnTo);
  }

  return (
    <section className="auth-route-shell">
      <AuthFormCard mode="create-account" message={message} safeReturnTo={safeReturnTo} />
    </section>
  );
}
