import { NextRequest, NextResponse } from "next/server";
import { getCategoryImage } from "@/lib/category-images";
import { prisma } from "@/lib/db";

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get("q")?.trim().slice(0, 80) ?? "";

  if (query.length < 2) {
    return NextResponse.json({ categories: [], products: [] });
  }

  const [categories, products] = await Promise.all([
    prisma.category.findMany({
      where: { isPublished: true, title: { contains: query, mode: "insensitive" } },
      select: { imageUrl: true, slug: true, title: true },
      orderBy: { sortOrder: "asc" },
      take: 3,
    }),
    prisma.product.findMany({
      where: {
        isPublished: true,
        OR: [
          { name: { contains: query, mode: "insensitive" } },
          { shortDescription: { contains: query, mode: "insensitive" } },
          { sku: { contains: query, mode: "insensitive" } },
          { categories: { some: { category: { title: { contains: query, mode: "insensitive" } } } } },
        ],
      },
      select: {
        featuredImage: true,
        images: { orderBy: [{ isFeatured: "desc" }, { sortOrder: "asc" }], select: { imageUrl: true }, take: 1 },
        name: true,
        price: true,
        slug: true,
      },
      orderBy: [{ isFeatured: "desc" }, { updatedAt: "desc" }],
      take: 5,
    }),
  ]);

  return NextResponse.json({
    categories: categories.map((category) => ({
      ...category,
      imageUrl: category.imageUrl || getCategoryImage(category.slug, category.title),
    })),
    products: products.map(({ images, ...product }) => ({
      ...product,
      imageUrl: images[0]?.imageUrl || product.featuredImage,
    })),
  });
}
