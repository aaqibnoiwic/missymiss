import { AdminShell } from "@/components/admin/admin-shell";
import { ReviewsManager } from "@/components/admin/commerce-managers";
import { requireAdmin } from "@/lib/admin-auth";
import { prisma } from "@/lib/db";
export default async function NewReviewPage() { await requireAdmin(); const products = await prisma.product.findMany({ orderBy: { name: "asc" } }); return <AdminShell eyebrow="Social proof" title="Add review"><ReviewsManager products={products} reviews={[]} /></AdminShell>; }
