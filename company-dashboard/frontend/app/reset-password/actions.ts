"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

type Result = { ok: true } | { ok: false; error: string };

export async function updatePassword(password: string): Promise<Result> {
  if (password.length < 8) return { ok: false, error: "Password must be at least 8 characters" };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "This reset link has expired — request a new one." };

  const { error } = await supabase.auth.updateUser({ password });
  if (error) return { ok: false, error: error.message };
  redirect("/");
}
