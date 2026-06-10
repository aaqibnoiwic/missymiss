"use client";

import { Button } from "@/components/ui/button";

export default function RootError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="mx-auto flex min-h-[65vh] max-w-3xl items-center px-6 py-16">
      <section className="w-full rounded-[2rem] border border-red-200 bg-white p-8 text-center shadow-[0_24px_80px_rgba(117,96,58,.1)]">
        <p className="section-label text-red-700">Something went wrong</p>
        <h1 className="mt-3 font-display text-4xl">This page could not load.</h1>
        <p className="mt-4 text-sm leading-7 text-[color:var(--color-muted-foreground)]">
          Please try again. Reference: {error.digest || "local-error"}
        </p>
        <Button className="mt-6" onClick={reset}>Try again</Button>
      </section>
    </main>
  );
}
