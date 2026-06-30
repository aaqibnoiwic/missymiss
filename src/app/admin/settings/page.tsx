import { AdminShell } from "@/components/admin/admin-shell";
import { requireAdmin } from "@/lib/admin-auth";
import { isCloudinaryConfigured } from "@/lib/cloudinary";
import { isShiprocketShippingConfigured } from "@/lib/shiprocket";

export default async function AdminSettingsPage() {
  await requireAdmin();
  const settings = [
    ["Cloudinary media", isCloudinaryConfigured(), "CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET"],
    ["Shiprocket Shipping API", isShiprocketShippingConfigured(), "SHIPROCKET_EMAIL, SHIPROCKET_PASSWORD, SHIPROCKET_PICKUP_LOCATION"],
    ["Shiprocket webhooks", Boolean(process.env.SHIPROCKET_WEBHOOK_SECRET), "SHIPROCKET_WEBHOOK_SECRET"],
  ] as const;
  return <AdminShell eyebrow="Environment readiness" title="Integration settings"><div className="grid gap-5 md:grid-cols-2">{settings.map(([name, ready, variables]) => <article className="rounded-[2rem] border border-[color:var(--color-border)] bg-white/85 p-6" key={name}><span className={`rounded-full px-3 py-1 text-xs font-bold uppercase tracking-[.18em] ${ready ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-900"}`}>{ready ? "Ready" : "Needs setup"}</span><h2 className="mt-4 font-display text-3xl">{name}</h2><p className="mt-3 text-sm leading-7 text-[color:var(--color-muted-foreground)]">Required environment variables: {variables}</p></article>)}</div></AdminShell>;
}
