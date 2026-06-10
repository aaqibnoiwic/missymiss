import { AdminShell } from "@/components/admin/admin-shell";
import { BannersManager } from "@/components/admin/commerce-managers";
import { requireAdmin } from "@/lib/admin-auth";
import { prisma } from "@/lib/db";

export default async function AdminBannersPage() {
  await requireAdmin();
  const banners = await prisma.banner.findMany({ orderBy: [{ placement: "asc" }, { sortOrder: "asc" }] });
  return <AdminShell eyebrow="Campaign studio" title="Responsive banners"><BannersManager banners={banners} /></AdminShell>;
}
