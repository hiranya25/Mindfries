import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Where a Supabase password-recovery email link lands. Exchanges the PKCE
// `code` for a real session (setting the auth cookie) before handing off to
// the reset-password form — that form itself never sees or handles the code.
export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  const origin = request.nextUrl.origin;

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}/reset-password`);
    }
  }

  return NextResponse.redirect(`${origin}/forgot-password`);
}
