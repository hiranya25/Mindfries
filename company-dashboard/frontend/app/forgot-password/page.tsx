"use client";

import { useState } from "react";
import { Button, Field, Input } from "@/components/ui";
import { requestPasswordReset } from "./actions";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    await requestPasswordReset(email);
    setLoading(false);
    setSent(true);
  }

  return (
    <div className="ambient grid min-h-screen place-items-center p-6">
      <div className="panel w-full max-w-sm p-8">
        <div className="mb-6 flex items-center gap-3">
          <div className="tile tile-violet h-10 w-10 text-xl font-black">M</div>
          <div>
            <div className="text-base font-extrabold tracking-tight">Mindfries</div>
            <div className="eyebrow mt-0.5">Company Portal</div>
          </div>
        </div>

        <h1 className="text-2xl font-extrabold tracking-tight">Reset your password</h1>

        {sent ? (
          <p className="mt-4 text-sm text-dim">
            If an account exists for <span className="font-semibold">{email}</span>, we&apos;ve emailed a link to
            reset the password. It can take a minute to arrive.
          </p>
        ) : (
          <>
            <p className="mt-1 text-sm text-dim">Enter your work email and we&apos;ll send you a reset link.</p>
            <form className="mt-6 space-y-4" onSubmit={onSubmit}>
              <Field label="Work email">
                <Input
                  type="email"
                  required
                  placeholder="you@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </Field>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Sending…" : "Send reset link"}
              </Button>
            </form>
          </>
        )}

        <a href="/login" className="mt-6 block text-center text-sm font-semibold text-accent">
          ← Back to sign in
        </a>
      </div>
    </div>
  );
}
