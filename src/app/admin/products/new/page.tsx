import { AdminShell } from "@/components/admin/admin-shell";
import { ProductEditor } from "@/components/admin/product-editor";
import { requireAdmin } from "@/lib/admin-auth";
import { prisma } from "@/lib/db";

export default async function NewProductPage() {
  await requireAdmin();
  const [categories, savedColorOptions, savedColorSummaries] = await Promise.all([
    prisma.category.findMany({
      select: { id: true, title: true, collectionType: true },
      orderBy: [{ collectionType: "asc" }, { sortOrder: "asc" }, { title: "asc" }],
    }),
    prisma.productColorGuideOption.findMany({
      distinct: ["name"],
      select: { name: true },
      orderBy: { name: "asc" },
    }),
    prisma.product.findMany({
      select: { colors: true },
      where: { colors: { not: "" } },
    }),
  ]);
  const colorOptions = [
    ...new Set([
      ...savedColorOptions.map((item) => item.name.trim()).filter(Boolean),
      ...savedColorSummaries.flatMap((item) => item.colors.split(",").map((color) => color.trim())).filter(Boolean),
    ]),
  ];
  return <AdminShell eyebrow="Catalog" title="Add product"><ProductEditor categories={categories} colorOptions={colorOptions} /></AdminShell>;
}
