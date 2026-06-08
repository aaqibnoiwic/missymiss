import { cookies } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";
import { BrandLogo } from "@/components/brand-logo";
import { CmsManagementPanel } from "@/components/admin/cms-management-panel";
import { LogoutButton } from "@/components/admin/logout-button";
import { MediaUploadPanel } from "@/components/admin/media-upload-panel";
import { buttonVariants } from "@/components/ui/button";
import {
  hasAdminCredentialsConfigured,
  verifyAdminSessionToken,
} from "@/lib/auth";
import { ADMIN_COOKIE_NAME } from "@/lib/auth-constants";
import { getAdminCmsData } from "@/lib/cms";
import { isCloudinaryConfigured } from "@/lib/cloudinary";
import { listMediaAssets } from "@/lib/media-assets";

export default async function AdminPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_COOKIE_NAME)?.value;
  if (!verifyAdminSessionToken(token)) {
    redirect("/admin/login");
  }

  const cloudinaryEnabled = isCloudinaryConfigured();
  const credentialsReady = hasAdminCredentialsConfigured();
  const assets = await listMediaAssets().catch(() => []);
  const cmsData = await getAdminCmsData();

  return (
    <main className="mx-auto w-full max-w-7xl space-y-10 px-6 py-10 md:px-10 lg:px-16">
      <div className="flex flex-col gap-6 rounded-[2.5rem] border border-[color:var(--color-border)] bg-white/82 p-7 shadow-[0_24px_80px_rgba(117,96,58,0.08)] lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-5">
          <div className="rounded-[2rem] bg-[linear-gradient(145deg,rgba(245,241,234,0.9),rgba(255,255,255,0.98))] p-4">
            <BrandLogo variant="symbol" className="w-16" />
          </div>
          <div>
            <p className="section-label">Protected Admin</p>
            <h1 className="mt-2 font-display text-4xl leading-none tracking-[-0.04em] text-[color:var(--color-charcoal)]">
              Atelier Media Studio
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-[color:var(--color-muted-foreground)]">
              Curate product and editorial imagery, preserve asset details, and
              keep the visual library ready for collections and campaign pages.
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link href="/" className={buttonVariants({ variant: "ghost" })}>
            Back to Storefront
          </Link>
          <LogoutButton />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-[1.75rem] border border-[color:var(--color-border)] bg-white/82 px-5 py-4 text-sm leading-7 text-[color:var(--color-muted-foreground)]">
          <span className="font-semibold text-[color:var(--color-charcoal)]">
            Admin credentials:
          </span>{" "}
          {credentialsReady ? "configured" : "missing"}
        </div>
        <div className="rounded-[1.75rem] border border-[color:var(--color-border)] bg-white/82 px-5 py-4 text-sm leading-7 text-[color:var(--color-muted-foreground)]">
          <span className="font-semibold text-[color:var(--color-charcoal)]">
            Media storage:
          </span>{" "}
          {cloudinaryEnabled ? "ready for image uploads" : "configuration missing"}
        </div>
      </div>

      <MediaUploadPanel
        initialAssets={assets}
        storageEnabled={cloudinaryEnabled}
      />

      <CmsManagementPanel data={cmsData} />
    </main>
  );
}
