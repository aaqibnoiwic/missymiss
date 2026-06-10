import { notFound } from "next/navigation";
import { AdminShell } from "@/components/admin/admin-shell";
import { BannersManager } from "@/components/admin/commerce-managers";
import { requireAdmin } from "@/lib/admin-auth";
import { prisma } from "@/lib/db";
export default async function EditBannerPage({ params }: { params: Promise<{ id: string }> }) { await requireAdmin(); const { id } = await params; const banner = await prisma.banner.findUnique({ where: { id } }); if (!banner) notFound(); return <AdminShell eyebrow="Campaign studio" title={`Edit ${banner.title}`}><BannersManager banners={[banner]} showCreate={false} /></AdminShell>; }
