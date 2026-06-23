"use server";

import type { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/admin-auth";
import type { AdminActionState } from "@/lib/admin-ui";
import {
  assignAwb,
  cancelShiprocketOrder,
  createShiprocketOrder,
  schedulePickup,
} from "@/lib/shiprocket";

function text(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

function int(formData: FormData, key: string, fallback = 0) {
  const value = Number(formData.get(key));
  return Number.isFinite(value) ? value : fallback;
}

function bool(formData: FormData, key: string) {
  return formData.get(key) === "on";
}

function json(value: unknown) {
  return JSON.parse(JSON.stringify(value)) as Prisma.InputJsonValue;
}

function nullableDate(formData: FormData, key: string) {
  const value = text(formData, key);
  return value ? new Date(value) : null;
}

function refreshCms() {
  revalidatePath("/");
  revalidatePath("/admin");
  revalidatePath("/shop");
  revalidatePath("/[slug]", "page");
  revalidatePath("/collections/[slug]", "page");
}

type ProductEditorVariant = {
  title?: string;
  sku?: string;
  size?: string;
  color?: string;
  price?: number;
  inventory?: number;
  weight?: number;
  length?: number;
  breadth?: number;
  height?: number;
  isEnabled?: boolean;
};

type ProductEditorSizeGuideRow = {
  size?: string;
  ageRange?: string;
  chest?: string;
  waist?: string;
  hip?: string;
  length?: string;
  notes?: string;
};

type ProductEditorColorGuideOption = {
  name?: string;
  swatchHex?: string;
  imageUrl?: string;
  description?: string;
};

function moneyFromRupees(value: FormDataEntryValue | null) {
  const amount = Number(value);
  return Number.isFinite(amount) ? Math.round(amount * 100) : -1;
}

function requiredMoneyFromRupees(value: FormDataEntryValue | null) {
  const normalized = String(value ?? "").trim();
  if (!normalized) return -1;
  return moneyFromRupees(value);
}

function slugify(value: string) {
  return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function parseVariants(value: string): ProductEditorVariant[] {
  if (!value) return [];
  const parsed = JSON.parse(value) as unknown;
  if (!Array.isArray(parsed)) throw new Error("Variants must be a list.");
  return parsed as ProductEditorVariant[];
}

function parseSizeGuideRows(value: string): ProductEditorSizeGuideRow[] {
  if (!value) return [];
  const parsed = JSON.parse(value) as unknown;
  if (!Array.isArray(parsed)) throw new Error("Size guide must be a list.");
  return parsed as ProductEditorSizeGuideRow[];
}

function parseColorGuideOptions(value: string): ProductEditorColorGuideOption[] {
  if (!value) return [];
  const parsed = JSON.parse(value) as unknown;
  if (!Array.isArray(parsed)) throw new Error("Color guide must be a list.");
  return parsed as ProductEditorColorGuideOption[];
}

export async function saveProductEditor(
  _previousState: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  await requireAdmin();
  const id = text(formData, "id");
  const name = text(formData, "name");
  const slug = text(formData, "slug") || slugify(name);
  const price = requiredMoneyFromRupees(formData.get("price"));
  const inventory = int(formData, "inventory");
  const categoryIds = [...new Set(formData.getAll("categoryIds").map(String).filter(Boolean))];
  const galleryImageUrls = [
    ...new Set(formData.getAll("galleryImageUrls").map(String).map((url) => url.trim()).filter(Boolean)),
  ];
  const fieldErrors: Record<string, string> = {};

  if (!name) fieldErrors.name = "Enter a product name.";
  if (price < 0) fieldErrors.price = "Enter a valid price in rupees.";
  if (!galleryImageUrls.length) fieldErrors.galleryImageUrls = "Upload at least one product image.";
  if (inventory < 0) fieldErrors.inventory = "Stock cannot be negative.";

  let variants: ProductEditorVariant[] = [];
  try {
    variants = parseVariants(text(formData, "variantsJson"));
  } catch {
    fieldErrors.variants = "Variant information is invalid.";
  }
  let sizeGuideRows: ProductEditorSizeGuideRow[] = [];
  try {
    sizeGuideRows = parseSizeGuideRows(text(formData, "sizeGuideRowsJson"))
      .map((row) => ({
        size: String(row.size ?? "").trim(),
        ageRange: String(row.ageRange ?? "").trim(),
        chest: String(row.chest ?? "").trim(),
        waist: String(row.waist ?? "").trim(),
        hip: String(row.hip ?? "").trim(),
        length: String(row.length ?? "").trim(),
        notes: String(row.notes ?? "").trim(),
      }))
      .filter((row) => row.size || row.ageRange || row.chest || row.waist || row.hip || row.length || row.notes);
  } catch {
    fieldErrors.sizeGuideRows = "Size guide information is invalid.";
  }
  let colorGuideOptions: ProductEditorColorGuideOption[] = [];
  try {
    colorGuideOptions = parseColorGuideOptions(text(formData, "colorGuideOptionsJson"))
      .map((option) => ({
        name: String(option.name ?? "").trim(),
        swatchHex: String(option.swatchHex ?? "").trim(),
        imageUrl: String(option.imageUrl ?? "").trim(),
        description: String(option.description ?? "").trim(),
      }))
      .filter((option) => option.name || option.swatchHex || option.imageUrl || option.description);
  } catch {
    fieldErrors.colorGuideOptions = "Color guide information is invalid.";
  }
  const duplicateSku = variants.find(
    (variant, index) =>
      variant.sku &&
      variants.findIndex((candidate) => candidate.sku === variant.sku) !== index,
  );
  if (sizeGuideRows.some((row) => !row.size)) {
    fieldErrors.sizeGuideRows = "Every size guide row needs a size label.";
  }
  if (colorGuideOptions.some((option) => !option.name)) {
    fieldErrors.colorGuideOptions = "Every color guide option needs a color name.";
  }
  if (duplicateSku) fieldErrors.variants = `SKU ${duplicateSku.sku} is repeated.`;
  if (Object.keys(fieldErrors).length) {
    return { success: false, message: "", fieldErrors, formError: "" };
  }

  const usableVariants = variants
    .map((variant) => ({
      title: String(variant.title ?? "").trim(),
      sku: String(variant.sku ?? "").trim(),
      size: String(variant.size ?? "").trim(),
      color: String(variant.color ?? "").trim(),
      price: Number(variant.price ?? 0),
      inventory: Number(variant.inventory ?? 0),
      weight: Number(variant.weight ?? 0),
      length: Number(variant.length ?? 0),
      breadth: Number(variant.breadth ?? 0),
      height: Number(variant.height ?? 0),
      isEnabled: variant.isEnabled !== false,
    }))
    .filter((variant) =>
      variant.title ||
      variant.sku ||
      variant.size ||
      variant.color ||
      variant.price > 0 ||
      variant.inventory > 0 ||
      variant.weight > 0 ||
      variant.length > 0 ||
      variant.breadth > 0 ||
      variant.height > 0,
    );

  const data = {
    slug,
    name,
    shortDescription: text(formData, "shortDescription"),
    description: text(formData, "description"),
    highlights: text(formData, "highlights"),
    material: text(formData, "material"),
    fitDetails: text(formData, "fitDetails"),
    careInstructions: text(formData, "careInstructions"),
    sizeGuide: text(formData, "sizeGuide"),
    shippingReturns: text(formData, "shippingReturns"),
    price,
    compareAtPrice: text(formData, "compareAtPrice")
      ? moneyFromRupees(formData.get("compareAtPrice"))
      : null,
    sku: text(formData, "sku"),
    inventory,
    isPublished: bool(formData, "isPublished"),
    isFeatured: bool(formData, "isFeatured"),
    isNewArrival: bool(formData, "isNewArrival"),
    isBestSeller: bool(formData, "isBestSeller"),
    isTrending: bool(formData, "isTrending"),
    isSustainable: bool(formData, "isSustainable"),
    featuredImage: galleryImageUrls[0] ?? "",
    videoUrl: text(formData, "videoUrl"),
    sizes: [...new Set(formData.getAll("sizes").map(String).map((size) => size.trim()).filter(Boolean))].join(", "),
    colors: text(formData, "colors"),
    metaTitle: text(formData, "metaTitle"),
    metaDescription: text(formData, "metaDescription"),
    keywords: text(formData, "keywords"),
    ogImage: text(formData, "ogImage"),
  };

  try {
    const product = id
      ? await prisma.product.update({ where: { id }, data })
      : await prisma.product.create({ data });

    const syncQueries: Prisma.PrismaPromise<unknown>[] = [
      prisma.productCategory.deleteMany({ where: { productId: product.id } }),
      prisma.productImage.deleteMany({ where: { productId: product.id } }),
      prisma.productVariant.deleteMany({ where: { productId: product.id } }),
      prisma.productSizeGuideRow.deleteMany({ where: { productId: product.id } }),
      prisma.productColorGuideOption.deleteMany({ where: { productId: product.id } }),
    ];

    if (categoryIds.length) {
      syncQueries.push(
        prisma.productCategory.createMany({
          data: categoryIds.map((categoryId) => ({ productId: product.id, categoryId })),
          skipDuplicates: true,
        }),
      );
    }

    if (galleryImageUrls.length) {
      syncQueries.push(
        prisma.productImage.createMany({
          data: galleryImageUrls.map((imageUrl, sortOrder) => ({
            productId: product.id,
            imageUrl,
            alt: name,
            isFeatured: sortOrder === 0,
            sortOrder,
          })),
        }),
      );
    }

    if (usableVariants.length) {
      syncQueries.push(
        prisma.productVariant.createMany({
          data: usableVariants.map((variant, sortOrder) => ({
            productId: product.id,
            sku: variant.sku || `${slug}-${sortOrder + 1}`,
            title: variant.title,
            size: variant.size,
            color: variant.color,
            price: Math.round(Number(variant.price ?? 0) * 100),
            inventory: Math.max(0, Number(variant.inventory ?? 0)),
            weight: Math.max(0, Number(variant.weight ?? 0)),
            length: Math.max(0, Number(variant.length ?? 0)),
            breadth: Math.max(0, Number(variant.breadth ?? 0)),
            height: Math.max(0, Number(variant.height ?? 0)),
            isEnabled: variant.isEnabled !== false,
            sortOrder,
          })),
        }),
      );
    }

    if (sizeGuideRows.length) {
      syncQueries.push(
        prisma.productSizeGuideRow.createMany({
          data: sizeGuideRows.map((row, sortOrder) => ({
            productId: product.id,
            size: row.size ?? "",
            ageRange: row.ageRange ?? "",
            chest: row.chest ?? "",
            waist: row.waist ?? "",
            hip: row.hip ?? "",
            length: row.length ?? "",
            notes: row.notes ?? "",
            sortOrder,
          })),
        }),
      );
    }

    if (colorGuideOptions.length) {
      syncQueries.push(
        prisma.productColorGuideOption.createMany({
          data: colorGuideOptions.map((option, sortOrder) => ({
            productId: product.id,
            name: option.name ?? "",
            swatchHex: option.swatchHex ?? "",
            imageUrl: option.imageUrl ?? "",
            description: option.description ?? "",
            sortOrder,
          })),
        }),
      );
    }

    await prisma.$transaction(syncQueries);

    refreshCms();
    revalidatePath("/admin/products");
    revalidatePath(`/admin/products/${product.id}`);
    return {
      success: true,
      message: id ? "Product updated successfully." : "Product created successfully.",
      fieldErrors: {},
      formError: "",
      entityId: product.id,
    };
  } catch (error) {
    const code =
      error && typeof error === "object" && "code" in error
        ? String(error.code)
        : "";
    return {
      success: false,
      message: "",
      fieldErrors: code === "P2002" ? { slug: "This slug or variant SKU is already in use." } : {},
      formError: code === "P2002"
        ? "Please choose a unique slug and unique variant SKUs."
        : "The product could not be saved. Your entered details are still here; please try again.",
    };
  }
}

export async function savePage(formData: FormData) {
  await requireAdmin();
  const id = text(formData, "id");
  const data = {
    slug: text(formData, "slug"),
    title: text(formData, "title"),
    eyebrow: text(formData, "eyebrow"),
    excerpt: text(formData, "excerpt"),
    body: text(formData, "body"),
    pageType: text(formData, "pageType") || "page",
    isPublished: bool(formData, "isPublished"),
    metaTitle: text(formData, "metaTitle"),
    metaDescription: text(formData, "metaDescription"),
    keywords: text(formData, "keywords"),
    ogImage: text(formData, "ogImage"),
  };

  if (!data.slug || !data.title) return;

  if (id) {
    await prisma.sitePage.update({ where: { id }, data });
  } else {
    await prisma.sitePage.create({ data });
  }

  refreshCms();
}

export async function deletePage(formData: FormData) {
  await requireAdmin();
  const id = text(formData, "id");
  if (!id) return;
  await prisma.sitePage.delete({ where: { id } });
  refreshCms();
}

export async function saveCategory(formData: FormData) {
  await requireAdmin();
  const id = text(formData, "id");
  const data = {
    slug: text(formData, "slug"),
    title: text(formData, "title"),
    eyebrow: text(formData, "eyebrow"),
    description: text(formData, "description"),
    collectionType: text(formData, "collectionType") || "main",
    ageRange: text(formData, "ageRange"),
    imageUrl: text(formData, "imageUrl"),
    isPublished: bool(formData, "isPublished"),
    sortOrder: int(formData, "sortOrder"),
    metaTitle: text(formData, "metaTitle"),
    metaDescription: text(formData, "metaDescription"),
    keywords: text(formData, "keywords"),
    ogImage: text(formData, "ogImage"),
  };

  if (!data.slug || !data.title) return;

  if (id) {
    await prisma.category.update({ where: { id }, data });
  } else {
    await prisma.category.create({ data });
  }

  refreshCms();
}

export async function saveBanner(formData: FormData) {
  await requireAdmin();
  const id = text(formData, "id");
  const data = {
    title: text(formData, "title"),
    subtitle: text(formData, "subtitle"),
    ctaLabel: text(formData, "ctaLabel"),
    ctaHref: text(formData, "ctaHref"),
    desktopImage: text(formData, "desktopImage"),
    mobileImage: text(formData, "mobileImage"),
    scope: text(formData, "scope") || "home",
    placement: text(formData, "placement") || "hero",
    presentation: text(formData, "presentation") || "cover",
    textAlignment: text(formData, "textAlignment") || "left",
    targetSlug: text(formData, "targetSlug"),
    isEnabled: bool(formData, "isEnabled"),
    sortOrder: int(formData, "sortOrder"),
    startsAt: nullableDate(formData, "startsAt"),
    endsAt: nullableDate(formData, "endsAt"),
    metaTitle: text(formData, "metaTitle"),
    metaDescription: text(formData, "metaDescription"),
    keywords: text(formData, "keywords"),
    ogImage: text(formData, "ogImage"),
  };

  if (!data.title) return;

  if (id) {
    await prisma.banner.update({ where: { id }, data });
  } else {
    await prisma.banner.create({ data });
  }

  refreshCms();
}

export async function deleteBanner(formData: FormData) {
  await requireAdmin();
  const id = text(formData, "id");
  if (!id) return;
  await prisma.banner.delete({ where: { id } });
  refreshCms();
}

export async function saveGalleryImage(formData: FormData) {
  await requireAdmin();
  const id = text(formData, "id");
  const data = {
    title: text(formData, "title"),
    imageUrl: text(formData, "imageUrl"),
    alt: text(formData, "alt"),
    scope: text(formData, "scope") || "lifestyle",
    targetSlug: text(formData, "targetSlug"),
    isFeatured: bool(formData, "isFeatured"),
    isEnabled: bool(formData, "isEnabled"),
    sortOrder: int(formData, "sortOrder"),
  };

  if (!data.imageUrl) return;

  if (id) {
    await prisma.galleryImage.update({ where: { id }, data });
  } else {
    await prisma.galleryImage.create({ data });
  }

  refreshCms();
}

export async function deleteGalleryImage(formData: FormData) {
  await requireAdmin();
  const id = text(formData, "id");
  if (!id) return;
  await prisma.galleryImage.delete({ where: { id } });
  refreshCms();
}

export async function saveProduct(formData: FormData) {
  await requireAdmin();
  const id = text(formData, "id");
  const categoryIds = formData.getAll("categoryIds").map(String);
  const data = {
    slug: text(formData, "slug"),
    name: text(formData, "name"),
    shortDescription: text(formData, "shortDescription"),
    description: text(formData, "description"),
    highlights: text(formData, "highlights"),
    material: text(formData, "material"),
    fitDetails: text(formData, "fitDetails"),
    careInstructions: text(formData, "careInstructions"),
    sizeGuide: text(formData, "sizeGuide"),
    shippingReturns: text(formData, "shippingReturns"),
    price: moneyFromRupees(formData.get("price")),
    compareAtPrice: text(formData, "compareAtPrice")
      ? moneyFromRupees(formData.get("compareAtPrice"))
      : null,
    sku: text(formData, "sku"),
    inventory: int(formData, "inventory"),
    isPublished: bool(formData, "isPublished"),
    isFeatured: bool(formData, "isFeatured"),
    isNewArrival: bool(formData, "isNewArrival"),
    isBestSeller: bool(formData, "isBestSeller"),
    isTrending: bool(formData, "isTrending"),
    isSustainable: bool(formData, "isSustainable"),
    featuredImage: text(formData, "featuredImage"),
    videoUrl: text(formData, "videoUrl"),
    sizes: text(formData, "sizes"),
    colors: text(formData, "colors"),
    metaTitle: text(formData, "metaTitle"),
    metaDescription: text(formData, "metaDescription"),
    keywords: text(formData, "keywords"),
    ogImage: text(formData, "ogImage"),
  };

  if (!data.slug || !data.name || data.price < 0 || (data.compareAtPrice !== null && data.compareAtPrice < 0)) return;

  const product = id
    ? await prisma.product.update({ where: { id }, data })
    : await prisma.product.create({ data });

  if (formData.has("manageCategories")) {
    await prisma.productCategory.deleteMany({ where: { productId: product.id } });
    if (categoryIds.length) {
      await prisma.productCategory.createMany({
        data: categoryIds.map((categoryId) => ({
          productId: product.id,
          categoryId,
        })),
        skipDuplicates: true,
      });
    }
  }

  refreshCms();
}

export async function deleteProduct(formData: FormData) {
  await requireAdmin();
  const id = text(formData, "id");
  if (!id) return;
  await prisma.product.delete({ where: { id } });
  refreshCms();
  revalidatePath("/admin/products");
  revalidatePath(`/admin/products/${id}`);
}

export async function saveProductImage(formData: FormData) {
  await requireAdmin();
  const productId = text(formData, "productId");
  const imageUrl = text(formData, "imageUrl");
  if (!productId || !imageUrl) return;

  await prisma.productImage.create({
    data: {
      productId,
      imageUrl,
      alt: text(formData, "alt"),
      isFeatured: bool(formData, "isFeatured"),
      sortOrder: int(formData, "sortOrder"),
    },
  });

  refreshCms();
}

export async function deleteProductImage(formData: FormData) {
  await requireAdmin();
  const id = text(formData, "id");
  if (!id) return;
  await prisma.productImage.delete({ where: { id } });
  refreshCms();
}

export async function saveTestimonial(formData: FormData) {
  await requireAdmin();
  const id = text(formData, "id");
  const data = {
    name: text(formData, "name"),
    role: text(formData, "role"),
    quote: text(formData, "quote"),
    rating: int(formData, "rating", 5),
    isEnabled: bool(formData, "isEnabled"),
    sortOrder: int(formData, "sortOrder"),
  };

  if (!data.name || !data.quote) return;

  if (id) {
    await prisma.testimonial.update({ where: { id }, data });
  } else {
    await prisma.testimonial.create({ data });
  }

  refreshCms();
}

export async function saveProductVariant(formData: FormData) {
  await requireAdmin();
  const id = text(formData, "id");
  const productId = text(formData, "productId");
  const data = {
    productId,
    sku: text(formData, "sku"),
    title: text(formData, "title"),
    size: text(formData, "size"),
    color: text(formData, "color"),
    price: moneyFromRupees(formData.get("price")),
    inventory: int(formData, "inventory"),
    weight: int(formData, "weight"),
    length: int(formData, "length"),
    breadth: int(formData, "breadth"),
    height: int(formData, "height"),
    isEnabled: bool(formData, "isEnabled"),
    sortOrder: int(formData, "sortOrder"),
  };
  if (!productId || !data.sku || data.price < 0) return;
  if (id) await prisma.productVariant.update({ where: { id }, data });
  else await prisma.productVariant.create({ data });
  refreshCms();
  revalidatePath("/admin/products");
}

export async function deleteProductVariant(formData: FormData) {
  await requireAdmin();
  const id = text(formData, "id");
  if (id) await prisma.productVariant.delete({ where: { id } });
  refreshCms();
  revalidatePath("/admin/products");
}

export async function saveProductReview(formData: FormData) {
  await requireAdmin();
  const id = text(formData, "id");
  const data = {
    productId: text(formData, "productId"),
    authorName: text(formData, "authorName"),
    authorTitle: text(formData, "authorTitle"),
    rating: Math.max(1, Math.min(5, int(formData, "rating", 5))),
    title: text(formData, "title"),
    body: text(formData, "body"),
    isPublished: bool(formData, "isPublished"),
    isFeatured: bool(formData, "isFeatured"),
    sortOrder: int(formData, "sortOrder"),
  };
  if (!data.productId || !data.authorName || !data.body) return;
  if (id) await prisma.productReview.update({ where: { id }, data });
  else await prisma.productReview.create({ data });
  refreshCms();
  revalidatePath("/admin/reviews");
}

export async function deleteProductReview(formData: FormData) {
  await requireAdmin();
  const id = text(formData, "id");
  if (id) await prisma.productReview.delete({ where: { id } });
  refreshCms();
  revalidatePath("/admin/reviews");
}

function addressValue(address: unknown, key: string) {
  if (!address || typeof address !== "object") return "";
  return String((address as Record<string, unknown>)[key] ?? "");
}

export async function approveOrderForShipping(formData: FormData) {
  await requireAdmin();
  const orderId = text(formData, "orderId");
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { items: { include: { variant: true } } },
  });
  if (!order) return;
  const packageWeight = order.items.reduce(
    (sum, item) => sum + (item.variant?.weight ?? 0) * item.quantity,
    0,
  );
  const packageLength = Math.max(...order.items.map((item) => item.variant?.length ?? 0), 1);
  const packageBreadth = Math.max(...order.items.map((item) => item.variant?.breadth ?? 0), 1);
  const packageHeight = Math.max(
    order.items.reduce((sum, item) => sum + (item.variant?.height ?? 0) * item.quantity, 0),
    1,
  );

  const payload = await createShiprocketOrder({
    order_id: order.orderNumber,
    order_date: order.createdAt.toISOString().slice(0, 16).replace("T", " "),
    pickup_location: process.env.SHIPROCKET_PICKUP_LOCATION,
    billing_customer_name: order.customerName,
    billing_address: addressValue(order.shippingAddress, "address"),
    billing_city: addressValue(order.shippingAddress, "city"),
    billing_pincode: addressValue(order.shippingAddress, "pincode"),
    billing_state: addressValue(order.shippingAddress, "state"),
    billing_country: addressValue(order.shippingAddress, "country") || "India",
    billing_email: order.customerEmail,
    billing_phone: order.customerPhone,
    shipping_is_billing: true,
    order_items: order.items.map((item) => ({
      name: item.productName,
      sku: item.sku,
      units: item.quantity,
      selling_price: item.unitPrice / 100,
    })),
    payment_method: order.paymentMethod.toLowerCase().includes("cod") ? "COD" : "Prepaid",
    sub_total: order.subtotal / 100,
    length: packageLength,
    breadth: packageBreadth,
    height: packageHeight,
    weight: Math.max(packageWeight / 1000, 0.1),
  });

  await prisma.order.update({
    where: { id: order.id },
    data: {
      status: "approved",
      shiprocketOrderId: String(payload.order_id ?? ""),
      shipment: {
        upsert: {
          create: {
            status: payload.status ?? "created",
            shiprocketShipmentId: String(payload.shipment_id ?? ""),
            rawPayload: json(payload),
          },
          update: {
            status: payload.status ?? "created",
            shiprocketShipmentId: String(payload.shipment_id ?? ""),
            rawPayload: json(payload),
          },
        },
      },
    },
  });
  revalidatePath("/admin/orders");
}

export async function assignOrderCourier(formData: FormData) {
  await requireAdmin();
  const shipment = await prisma.shipment.findUnique({ where: { orderId: text(formData, "orderId") } });
  if (!shipment?.shiprocketShipmentId) return;
  const courierId = text(formData, "courierId");
  const payload = await assignAwb(shipment.shiprocketShipmentId, courierId);
  const response = payload as { awb_assign_status?: number; response?: { data?: { awb_code?: string; courier_name?: string } } };
  await prisma.shipment.update({
    where: { id: shipment.id },
    data: {
      status: response.awb_assign_status ? "awb_assigned" : shipment.status,
      awbCode: response.response?.data?.awb_code ?? shipment.awbCode,
      courierId,
      courierName: response.response?.data?.courier_name ?? shipment.courierName,
      rawPayload: json(payload),
    },
  });
  revalidatePath("/admin/orders");
}

export async function scheduleOrderPickup(formData: FormData) {
  await requireAdmin();
  const shipment = await prisma.shipment.findUnique({ where: { orderId: text(formData, "orderId") } });
  if (!shipment?.shiprocketShipmentId) return;
  const payload = await schedulePickup(shipment.shiprocketShipmentId);
  await prisma.shipment.update({ where: { id: shipment.id }, data: { pickupStatus: "scheduled", status: "pickup_scheduled", rawPayload: json(payload) } });
  revalidatePath("/admin/orders");
}

export async function cancelOrder(formData: FormData) {
  await requireAdmin();
  const order = await prisma.order.findUnique({ where: { id: text(formData, "orderId") } });
  if (!order) return;
  if (order.shiprocketOrderId) await cancelShiprocketOrder(order.shiprocketOrderId);
  await prisma.order.update({ where: { id: order.id }, data: { status: "cancelled" } });
  revalidatePath("/admin/orders");
}
