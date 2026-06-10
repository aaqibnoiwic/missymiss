import { AdminShell } from "@/components/admin/admin-shell";
import { ProductEditor } from "@/components/admin/product-editor";
import { requireAdmin } from "@/lib/admin-auth";
import { prisma } from "@/lib/db";

export default async function NewProductPage() {
  await requireAdmin();
  const categories = await prisma.category.findMany({
    select: { id: true, title: true, collectionType: true },
    orderBy: [{ collectionType: "asc" }, { sortOrder: "asc" }, { title: "asc" }],
  });
  return <AdminShell eyebrow="Catalog" title="Add product"><ProductEditor categories={categories} /></AdminShell>;
}
