"use client";

import { Button } from "@/components/ui/button";

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="mx-auto max-w-3xl px-6 py-16">
      <section className="rounded-[2rem] border border-red-200 bg-red-50 p-8">
        <p className="text-xs font-bold uppercase tracking-[.25em] text-red-700">Admin action failed</p>
        <h1 className="mt-3 font-display text-4xl">Your data is still safe.</h1>
        <p className="mt-4 text-sm leading-7 text-red-900/70">
          Retry this page. If the issue continues, restart development with <code>npm run restart:dev</code>.
          Reference: {error.digest || "local-error"}
        </p>
        <Button className="mt-6" onClick={reset}>Retry page</Button>
      </section>
    </main>
  );
}
