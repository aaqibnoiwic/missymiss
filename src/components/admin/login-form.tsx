"use client";

import { useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  async function handleSubmit(formData: FormData) {
    setError(null);
    const response = await fetch("/api/admin/login", {
      method: "POST",
      body: JSON.stringify({
        username: formData.get("username"),
        password: formData.get("password"),
      }),
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const payload = (await response.json().catch(() => null)) as
        | { error?: string }
        | null;
      setError(payload?.error ?? "Unable to sign in.");
      return;
    }

    startTransition(() => {
      router.push(searchParams.get("next") || "/admin");
      router.refresh();
    });
  }

  return (
    <form
      action={handleSubmit}
      className="space-y-5 rounded-[2rem] border border-[color:var(--color-border)] bg-white/85 p-8 shadow-[0_20px_70px_rgba(117,96,58,0.08)]"
    >
      <div className="space-y-2">
        <label className="text-sm font-medium text-[color:var(--color-charcoal)]">
          Username
        </label>
        <Input name="username" autoComplete="username" required />
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium text-[color:var(--color-charcoal)]">
          Password
        </label>
        <Input
          name="password"
          type="password"
          autoComplete="current-password"
          required
        />
      </div>
      {error ? (
        <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      ) : null}
      <Button type="submit" size="lg" className="w-full" disabled={isPending}>
        {isPending ? "Signing in..." : "Enter Admin"}
      </Button>
    </form>
  );
}
