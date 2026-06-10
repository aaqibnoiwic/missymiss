import { AdminShell } from "@/components/admin/admin-shell";
import { BannersManager } from "@/components/admin/commerce-managers";
import { requireAdmin } from "@/lib/admin-auth";
export default async function NewBannerPage() { await requireAdmin(); return <AdminShell eyebrow="Campaign studio" title="Add banner"><BannersManager banners={[]} /></AdminShell>; }
