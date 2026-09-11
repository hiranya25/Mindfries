"use client";

import { useEffect } from "react";

export default function RootError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error("[company-dashboard root error]", error);
  }, [error]);

  return (
    <div className="ambient grid min-h-screen place-items-center p-6">
      <div className="panel w-full max-w-sm p-8 text-center">
        <h1 className="text-xl font-extrabold tracking-tight">Something went wrong</h1>
        <p className="mt-2 text-sm text-dim">Try again, or come back in a moment.</p>
        <button
          onClick={reset}
          className="mt-5 inline-flex items-center justify-center gap-2 rounded-xl bg-accent px-4 py-2 text-sm font-semibold text-white transition hover:brightness-110"
        >
          Try again
        </button>
      </div>
    </div>
  );
}
