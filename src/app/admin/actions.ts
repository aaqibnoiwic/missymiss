"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";

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

export async function savePage(formData: FormData) {
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
  const id = text(formData, "id");
  if (!id) return;
  await prisma.sitePage.delete({ where: { id } });
  refreshCms();
}

export async function saveCategory(formData: FormData) {
  const id = text(formData, "id");
  const data = {
    slug: text(formData, "slug"),
    title: text(formData, "title"),
    eyebrow: text(formData, "eyebrow"),
    description: text(formData, "description"),
    collectionType: text(formData, "collectionType") || "main",
    ageRange: text(formData, "ageRange"),
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
  const id = text(formData, "id");
  const data = {
    title: text(formData, "title"),
    subtitle: text(formData, "subtitle"),
    ctaLabel: text(formData, "ctaLabel"),
    ctaHref: text(formData, "ctaHref"),
    desktopImage: text(formData, "desktopImage"),
    mobileImage: text(formData, "mobileImage"),
    scope: text(formData, "scope") || "home",
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
  const id = text(formData, "id");
  if (!id) return;
  await prisma.banner.delete({ where: { id } });
  refreshCms();
}

export async function saveGalleryImage(formData: FormData) {
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
  const id = text(formData, "id");
  if (!id) return;
  await prisma.galleryImage.delete({ where: { id } });
  refreshCms();
}

export async function saveProduct(formData: FormData) {
  const id = text(formData, "id");
  const categoryIds = formData.getAll("categoryIds").map(String);
  const data = {
    slug: text(formData, "slug"),
    name: text(formData, "name"),
    shortDescription: text(formData, "shortDescription"),
    description: text(formData, "description"),
    price: int(formData, "price"),
    compareAtPrice: text(formData, "compareAtPrice")
      ? int(formData, "compareAtPrice")
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

  if (!data.slug || !data.name) return;

  const product = id
    ? await prisma.product.update({ where: { id }, data })
    : await prisma.product.create({ data });

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

  refreshCms();
}

export async function deleteProduct(formData: FormData) {
  const id = text(formData, "id");
  if (!id) return;
  await prisma.product.delete({ where: { id } });
  refreshCms();
}

export async function saveProductImage(formData: FormData) {
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
  const id = text(formData, "id");
  if (!id) return;
  await prisma.productImage.delete({ where: { id } });
  refreshCms();
}

export async function saveTestimonial(formData: FormData) {
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
