import { AdminShell } from "@/components/admin/admin-shell";
import { ProductsManager } from "@/components/admin/commerce-managers";
import { requireAdmin } from "@/lib/admin-auth";
import { prisma } from "@/lib/db";

export default async function AdminProductsPage() {
  await requireAdmin();
  const [categories, products] = await Promise.all([
    prisma.category.findMany({ orderBy: [{ collectionType: "asc" }, { sortOrder: "asc" }, { title: "asc" }] }),
    prisma.product.findMany({
      include: {
        categories: { include: { category: true } },
        images: { orderBy: { sortOrder: "asc" } },
        variants: { orderBy: { sortOrder: "asc" } },
      },
      orderBy: { updatedAt: "desc" },
    }),
  ]);
  return <AdminShell eyebrow="Catalog studio" title="Products & variants"><ProductsManager categories={categories} products={products} /></AdminShell>;
}
