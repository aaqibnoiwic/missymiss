import { AdminShell } from "@/components/admin/admin-shell";
import { ReviewsManager } from "@/components/admin/commerce-managers";
import { requireAdmin } from "@/lib/admin-auth";
import { prisma } from "@/lib/db";

export default async function AdminReviewsPage() {
  await requireAdmin();
  const [products, reviews] = await Promise.all([
    prisma.product.findMany({ orderBy: { name: "asc" } }),
    prisma.productReview.findMany({ include: { product: true }, orderBy: [{ isFeatured: "desc" }, { updatedAt: "desc" }] }),
  ]);
  return <AdminShell eyebrow="Social proof" title="Product reviews"><ReviewsManager products={products} reviews={reviews} /></AdminShell>;
}
