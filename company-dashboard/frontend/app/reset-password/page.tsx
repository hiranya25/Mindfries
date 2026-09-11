"use client";

import { useState } from "react";
import { Button, Field, Input } from "@/components/ui";
import { updatePassword } from "./actions";

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (password !== confirm) {
      setError("Passwords don't match");
      return;
    }
    setLoading(true);
    const res = await updatePassword(password);
    // A successful update redirects server-side and never returns here.
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

        <h1 className="text-2xl font-extrabold tracking-tight">Choose a new password</h1>

        <form className="mt-6 space-y-4" onSubmit={onSubmit}>
          <Field label="New password">
            <Input
              type="password"
              required
              minLength={8}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </Field>
          <Field label="Confirm password">
            <Input
              type="password"
              required
              minLength={8}
              placeholder="••••••••"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
            />
          </Field>
          {error && <p className="text-sm font-semibold text-[#f4502f]">{error}</p>}
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Saving…" : "Save password"}
          </Button>
        </form>
      </div>
    </div>
  );
}
