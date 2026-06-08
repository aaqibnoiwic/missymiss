import { prisma } from "@/lib/db";

const now = () => new Date();

export async function getEnabledBanners(scope: string, targetSlug = "") {
  const current = now();

  return prisma.banner.findMany({
    where: {
      scope,
      targetSlug,
      isEnabled: true,
      OR: [{ startsAt: null }, { startsAt: { lte: current } }],
      AND: [{ OR: [{ endsAt: null }, { endsAt: { gte: current } }] }],
    },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
  });
}

export async function getPublishedPage(slug: string) {
  return prisma.sitePage.findFirst({
    where: {
      slug,
      isPublished: true,
    },
  });
}

export async function getPublishedCategory(slug: string) {
  return prisma.category.findFirst({
    where: {
      slug,
      isPublished: true,
    },
    include: {
      products: {
        include: {
          product: {
            include: {
              images: {
                orderBy: [{ isFeatured: "desc" }, { sortOrder: "asc" }],
              },
            },
          },
        },
      },
    },
  });
}

export async function getNavigationCategories() {
  return prisma.category.findMany({
    where: {
      isPublished: true,
    },
    orderBy: [{ collectionType: "asc" }, { sortOrder: "asc" }, { title: "asc" }],
  });
}

export async function getHomeData() {
  const [banners, categories, featuredProducts, newArrivals, testimonials] =
    await Promise.all([
      getEnabledBanners("home"),
      prisma.category.findMany({
        where: { isPublished: true },
        orderBy: [{ sortOrder: "asc" }, { title: "asc" }],
        take: 6,
      }),
      prisma.product.findMany({
        where: { isPublished: true, isFeatured: true },
        include: { images: { orderBy: [{ isFeatured: "desc" }, { sortOrder: "asc" }] } },
        orderBy: { updatedAt: "desc" },
        take: 4,
      }),
      prisma.product.findMany({
        where: { isPublished: true, isNewArrival: true },
        include: { images: { orderBy: [{ isFeatured: "desc" }, { sortOrder: "asc" }] } },
        orderBy: { updatedAt: "desc" },
        take: 4,
      }),
      prisma.testimonial.findMany({
        where: { isEnabled: true },
        orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
        take: 6,
      }),
    ]);

  return { banners, categories, featuredProducts, newArrivals, testimonials };
}

export async function getShopProducts() {
  return prisma.product.findMany({
    where: { isPublished: true },
    include: {
      categories: { include: { category: true } },
      images: { orderBy: [{ isFeatured: "desc" }, { sortOrder: "asc" }] },
    },
    orderBy: { updatedAt: "desc" },
  });
}

export async function getAdminCmsData() {
  const [
    pages,
    categories,
    banners,
    galleryImages,
    products,
    testimonials,
    mediaAssets,
  ] = await Promise.all([
    prisma.sitePage.findMany({ orderBy: [{ pageType: "asc" }, { title: "asc" }] }),
    prisma.category.findMany({ orderBy: [{ collectionType: "asc" }, { sortOrder: "asc" }] }),
    prisma.banner.findMany({ orderBy: [{ scope: "asc" }, { sortOrder: "asc" }] }),
    prisma.galleryImage.findMany({ orderBy: [{ scope: "asc" }, { sortOrder: "asc" }] }),
    prisma.product.findMany({
      include: {
        categories: { include: { category: true } },
        images: { orderBy: [{ isFeatured: "desc" }, { sortOrder: "asc" }] },
      },
      orderBy: { updatedAt: "desc" },
    }),
    prisma.testimonial.findMany({ orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }] }),
    prisma.mediaAsset.findMany({ orderBy: { createdAt: "desc" }, take: 24 }),
  ]);

  return {
    pages,
    categories,
    banners,
    galleryImages,
    products,
    testimonials,
    mediaAssets,
  };
}
