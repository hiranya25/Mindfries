"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui";

export default function PortalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error("[company-dashboard portal error]", error);
  }, [error]);

  return (
    <div className="hair-card p-10 text-center">
      <div className="mx-auto mb-4 grid h-12 w-12 place-items-center rounded-full bg-accent-soft text-accent">!</div>
      <h2 className="text-lg font-extrabold tracking-tight">Something went wrong</h2>
      <p className="mx-auto mt-2 max-w-md text-sm text-dim">
        This page hit an unexpected error. Try again, or come back in a moment.
      </p>
      <Button className="mt-5" onClick={reset}>
        Try again
      </Button>
    </div>
  );
}
