import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { BrandLogo } from "@/components/brand-logo";
import { LoginForm } from "@/components/admin/login-form";
import { verifyAdminSessionToken } from "@/lib/auth";
import { ADMIN_COOKIE_NAME } from "@/lib/auth-constants";

export default async function AdminLoginPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_COOKIE_NAME)?.value;
  if (verifyAdminSessionToken(token)) {
    redirect("/admin");
  }

  const credentialsConfigured = Boolean(
    process.env.ADMIN_USERNAME && process.env.ADMIN_PASSWORD,
  );

  return (
    <main className="mx-auto grid min-h-[100svh] w-full max-w-7xl gap-12 px-6 py-10 md:px-10 lg:grid-cols-[0.95fr_1.05fr] lg:px-16">
      <section className="flex flex-col justify-center">
        <div className="max-w-xl space-y-6">
          <BrandLogo variant="symbol" className="w-24" />
          <p className="section-label">Admin Access</p>
          <h1 className="font-display text-5xl leading-none tracking-[-0.05em] text-[color:var(--color-charcoal)]">
            Welcome back to the Missy Miss media desk
          </h1>
          <p className="text-lg leading-8 text-[color:var(--color-muted-foreground)]">
            Sign in to manage brand imagery, campaign assets, and the media
            library that powers future collections.
          </p>
          {!credentialsConfigured ? (
            <div className="rounded-[1.75rem] border border-dashed border-[color:var(--color-border-strong)] bg-[color:var(--color-paper)] px-5 py-4 text-sm leading-7 text-[color:var(--color-muted-foreground)]">
              Set `ADMIN_USERNAME`, `ADMIN_PASSWORD`, and optionally
              `ADMIN_SECRET` in your environment before signing in.
            </div>
          ) : null}
        </div>
      </section>
      <section className="flex items-center">
        <div className="w-full max-w-lg">
          <LoginForm />
        </div>
      </section>
    </main>
  );
}
