import "server-only";
import { Resend } from "resend";

// Real outbound email via Resend — same pattern as
// internal-admin/frontend/lib/mailer.ts. Gated so the app still builds and
// runs (invites just skip the email step) before RESEND_API_KEY/RESEND_FROM
// are configured.
let cached: Resend | null | undefined;
function client(): Resend | null {
  if (cached !== undefined) return cached;
  const key = process.env.RESEND_API_KEY;
  cached = key ? new Resend(key) : null;
  return cached;
}

export function mailerReady(): boolean {
  return !!process.env.RESEND_API_KEY && !!process.env.RESEND_FROM;
}

export async function sendMail(opts: { to: string; subject: string; text: string }): Promise<void> {
  const c = client();
  const from = process.env.RESEND_FROM;
  if (!c || !from) throw new Error("Email not configured — set RESEND_API_KEY and RESEND_FROM");
  const { error } = await c.emails.send({ from, to: opts.to, subject: opts.subject, text: opts.text });
  if (error) throw new Error(error.message);
}
