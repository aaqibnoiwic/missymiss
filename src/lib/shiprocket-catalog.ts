import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import { resolveShiprocketCollectionId, toShiprocketNumericId } from "@/lib/shiprocket-id";

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

function tagsForProduct(product: ProductWithRelations) {
  return [
    ...product.categories.map((entry) => entry.category.title).filter(Boolean),
    ...product.colors.split(",").map((value) => value.trim()).filter(Boolean),
    ...product.sizes.split(",").map((value) => value.trim()).filter(Boolean),
  ].join(", ");
}

function optionValuesForVariant(variant: ProductWithRelations["variants"][number]) {
  const optionValues: Record<string, string> = {};
  if (variant.color) optionValues.Color = variant.color;
  if (variant.size) optionValues.Size = variant.size;
  return optionValues;
}

export function serializeProduct(product: ProductWithRelations) {
  const featuredImage =
    product.featuredImage ||
    product.images.find((image) => image.isFeatured)?.imageUrl ||
    product.images[0]?.imageUrl ||
    "";

  const variants = product.variants.length
    ? product.variants.map((variant) => ({
        id: toShiprocketNumericId(variant.id),
        title: variant.title || [variant.color, variant.size].filter(Boolean).join(" / ") || "Default",
        price: rupees(variant.price),
        compare_at_price: product.compareAtPrice ? rupees(product.compareAtPrice) : null,
        sku: variant.sku || product.sku || "",
        quantity: variant.inventory,
        created_at: isoOrEmpty(variant.createdAt),
        updated_at: isoOrEmpty(variant.updatedAt),
        taxable: true,
        option_values: optionValuesForVariant(variant),
        image: { src: featuredImage },
        weight: kilograms(variant.weight),
      }))
    : [
        {
          // Products without variants expose a single default variant so the
          // checkout cart_data can reference a concrete variant_id.
          id: toShiprocketNumericId(product.id),
          title: "Default",
          price: rupees(product.price),
          compare_at_price: product.compareAtPrice ? rupees(product.compareAtPrice) : null,
          sku: product.sku || "",
          quantity: product.inventory,
          created_at: isoOrEmpty(product.createdAt),
          updated_at: isoOrEmpty(product.updatedAt),
          taxable: true,
          option_values: {},
          image: { src: featuredImage },
          weight: 0,
        },
      ];

  return {
    id: toShiprocketNumericId(product.id),
    title: product.name,
    body_html: product.description || product.shortDescription || "",
    vendor: VENDOR,
    product_type: product.categories[0]?.category.title || "",
    created_at: isoOrEmpty(product.createdAt),
    handle: product.slug,
    updated_at: isoOrEmpty(product.updatedAt),
    tags: tagsForProduct(product),
    status: product.isPublished ? "active" : "draft",
    variants,
    image: { src: featuredImage },
  };
}

export function serializeCollection(category: CategoryRecord) {
  return {
    id: toShiprocketNumericId(category.id),
    title: category.title,
    body_html: category.description || "",
    handle: category.slug,
    image: { src: category.imageUrl || "" },
    created_at: isoOrEmpty(category.createdAt),
    updated_at: isoOrEmpty(category.updatedAt),
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
    data: {
      total,
      products: products.map(serializeProduct),
    },
  };
}

export async function fetchProductsByCollection(
  collectionId: string,
  page: number,
  limit: number,
  skip: number,
) {
  const resolvedCollectionId = await resolveShiprocketCollectionId(collectionId);
  if (!resolvedCollectionId) {
    return {
      data: {
        total: 0,
        products: [],
      },
    };
  }

  const where = {
    isPublished: true,
    categories: { some: { categoryId: resolvedCollectionId } },
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
    data: {
      total,
      products: products.map(serializeProduct),
    },
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
    data: {
      total,
      collections: categories.map(serializeCollection),
    },
  };
}

export async function fetchShiprocketProduct(productId: string) {
  const product = await prisma.product.findUnique({
    where: { id: productId },
    include: productInclude,
  });

  return product ? serializeProduct(product) : null;
}

export async function fetchShiprocketCollection(collectionId: string) {
  const category = await prisma.category.findUnique({
    where: { id: collectionId },
  });

  return category ? serializeCollection(category) : null;
}
