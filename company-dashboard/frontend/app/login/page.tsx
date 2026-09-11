"use client";

import { useState } from "react";
import { Button, Field, Input } from "@/components/ui";
import { signIn } from "./actions";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const res = await signIn({ email, password });
    // A successful sign-in redirects server-side and never returns here.
    if (res && !res.ok) setError(res.error);
    setLoading(false);
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

        <h1 className="text-2xl font-extrabold tracking-tight">Sign in</h1>
        <p className="mt-1 text-sm text-dim">Use the credentials emailed to your workspace admin.</p>

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
          <Field label="Password">
            <Input
              type="password"
              required
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </Field>
          {error && <p className="text-sm font-semibold text-[#f4502f]">{error}</p>}
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Signing in…" : "Sign in →"}
          </Button>
        </form>

        <a href="/forgot-password" className="mt-4 block text-center text-sm font-semibold text-accent">
          Forgot password?
        </a>
      </div>
    </div>
  );
}
