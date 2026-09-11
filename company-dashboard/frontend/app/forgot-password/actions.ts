"use server";

import { createClient } from "@/lib/supabase/server";

type Result = { ok: true } | { ok: false; error: string };

export async function requestPasswordReset(email: string): Promise<Result> {
  const supabase = await createClient();
  const appUrl = process.env.NEXT_PUBLIC_APP_URL;
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: appUrl ? `${appUrl}/auth/confirm` : undefined,
  });
  // Don't leak whether the address has an account — always report success.
  if (error) console.error("[company-dashboard forgot-password]", error.message);
  return { ok: true };
}
