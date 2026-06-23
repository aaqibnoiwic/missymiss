import { notFound } from "next/navigation";
import { AdminShell } from "@/components/admin/admin-shell";
import { ProductEditor } from "@/components/admin/product-editor";
import { requireAdmin } from "@/lib/admin-auth";
import { prisma } from "@/lib/db";

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  const [categories, savedColorOptions, savedColorSummaries, product] = await Promise.all([
    prisma.category.findMany({ select: { id: true, title: true, collectionType: true }, orderBy: [{ collectionType: "asc" }, { sortOrder: "asc" }, { title: "asc" }] }),
    prisma.productColorGuideOption.findMany({
      distinct: ["name"],
      select: { name: true },
      orderBy: { name: "asc" },
    }),
    prisma.product.findMany({
      select: { colors: true },
      where: { colors: { not: "" } },
    }),
    prisma.product.findUnique({
      where: { id },
      include: {
        categories: true,
        images: { orderBy: { sortOrder: "asc" } },
        variants: { orderBy: { sortOrder: "asc" } },
        sizeGuideRows: { orderBy: { sortOrder: "asc" } },
        colorGuideOptions: { orderBy: { sortOrder: "asc" } },
      },
    }),
  ]);
  if (!product) notFound();
  const colorOptions = [
    ...new Set([
      ...savedColorOptions.map((item) => item.name.trim()).filter(Boolean),
      ...savedColorSummaries.flatMap((item) => item.colors.split(",").map((color) => color.trim())).filter(Boolean),
    ]),
  ];
  const editorProduct = {
    ...product,
    categoryIds: product.categories.map((item) => item.categoryId),
    imageUrls: [...new Set([product.featuredImage, ...product.images.map((image) => image.imageUrl)].filter(Boolean))],
    variants: product.variants.map((variant) => ({ ...variant, price: variant.price / 100 })),
    sizeGuideRows: product.sizeGuideRows.map(({ size, ageRange, chest, waist, hip, length, notes }) => ({ size, ageRange, chest, waist, hip, length, notes })),
    colorGuideOptions: product.colorGuideOptions.map(({ name, swatchHex, imageUrl, description }) => ({ name, swatchHex, imageUrl, description })),
  };
  return <AdminShell eyebrow="Catalog" title={`Edit ${product.name}`}><ProductEditor categories={categories} colorOptions={colorOptions} product={editorProduct} /></AdminShell>;
}
