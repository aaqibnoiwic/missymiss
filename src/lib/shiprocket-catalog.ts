import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";

// Schema mirrors the Shopify-like product/collection shape Shiprocket Checkout
// expects for custom-site catalog sync (see SR Checkout Integration Guide).
const VENDOR = "Missy Miss";
const DEFAULT_LIMIT = 100;
const MAX_LIMIT = 250;

type ProductWithRelations = Prisma.ProductGetPayload<{
  include: {
    images: true;
    variants: true;
    categories: { include: { category: true } };
  };
}>;

type CategoryRecord = Prisma.CategoryGetPayload<object>;

function rupees(paise: number) {
  return (paise / 100).toFixed(2);
}

function kilograms(grams: number) {
  return Number((grams / 1000).toFixed(3));
}

function isoOrEmpty(date: Date | null | undefined) {
  return date ? date.toISOString() : "";
}

export function parsePagination(searchParams: URLSearchParams) {
  const pageRaw = Number(searchParams.get("page"));
  const limitRaw = Number(searchParams.get("limit"));
  const page = Number.isInteger(pageRaw) && pageRaw > 0 ? pageRaw : 1;
  const limit = Number.isInteger(limitRaw) && limitRaw > 0 ? Math.min(limitRaw, MAX_LIMIT) : DEFAULT_LIMIT;
  return { page, limit, skip: (page - 1) * limit };
}

function paginationMeta(page: number, limit: number, total: number) {
  const totalPages = limit > 0 ? Math.ceil(total / limit) : 0;
  return { page, limit, total, total_pages: totalPages, has_next: page < totalPages };
}

function serializeProduct(product: ProductWithRelations) {
  const featuredImage =
    product.featuredImage ||
    product.images.find((image) => image.isFeatured)?.imageUrl ||
    product.images[0]?.imageUrl ||
    "";

  const variants = product.variants.length
    ? product.variants.map((variant) => ({
        id: variant.id,
        title: variant.title || [variant.color, variant.size].filter(Boolean).join(" / ") || "Default",
        price: rupees(variant.price),
        quantity: variant.inventory,
        sku: variant.sku || product.sku || "",
        updated_at: isoOrEmpty(variant.updatedAt),
        image: { src: featuredImage },
        weight: kilograms(variant.weight),
      }))
    : [
        {
          // Products without variants expose a single default variant so the
          // checkout cart_data can reference a concrete variant_id.
          id: product.id,
          title: "Default",
          price: rupees(product.price),
          quantity: product.inventory,
          sku: product.sku || "",
          updated_at: isoOrEmpty(product.updatedAt),
          image: { src: featuredImage },
          weight: 0,
        },
      ];

  return {
    id: product.id,
    title: product.name,
    body_html: product.description || product.shortDescription || "",
    vendor: VENDOR,
    product_type: product.categories[0]?.category.title || "",
    updated_at: isoOrEmpty(product.updatedAt),
    status: product.isPublished ? "active" : "draft",
    handle: product.slug,
    variants,
    image: { src: featuredImage },
  };
}

export function serializeCollection(category: CategoryRecord) {
  return {
    id: category.id,
    updated_at: isoOrEmpty(category.updatedAt),
    title: category.title,
    body_html: category.description || "",
    handle: category.slug,
    image: { src: category.imageUrl || "" },
  };
}

const productInclude = {
  images: { orderBy: [{ isFeatured: "desc" as const }, { sortOrder: "asc" as const }] },
  variants: { where: { isEnabled: true }, orderBy: { sortOrder: "asc" as const } },
  categories: { include: { category: true } },
};

export async function fetchProductCatalog(page: number, limit: number, skip: number) {
  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where: { isPublished: true },
      include: productInclude,
      orderBy: { updatedAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.product.count({ where: { isPublished: true } }),
  ]);

  return {
    data: products.map(serializeProduct),
    meta: paginationMeta(page, limit, total),
  };
}

export async function fetchProductsByCollection(
  collectionId: string,
  page: number,
  limit: number,
  skip: number,
) {
  const where = {
    isPublished: true,
    categories: { some: { categoryId: collectionId } },
  };
  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      include: productInclude,
      orderBy: { updatedAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.product.count({ where }),
  ]);

  return {
    data: products.map(serializeProduct),
    meta: paginationMeta(page, limit, total),
  };
}

export async function fetchCollectionCatalog(page: number, limit: number, skip: number) {
  const [categories, total] = await Promise.all([
    prisma.category.findMany({
      where: { isPublished: true },
      orderBy: [{ sortOrder: "asc" }, { title: "asc" }],
      skip,
      take: limit,
    }),
    prisma.category.count({ where: { isPublished: true } }),
  ]);

  return {
    data: categories.map(serializeCollection),
    meta: paginationMeta(page, limit, total),
  };
}
