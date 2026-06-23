import { prisma } from "@/lib/db";

const now = () => new Date();

export async function getEnabledBanners(scope: string, targetSlug = "") {
  const current = now();

  return prisma.banner.findMany({
    where: {
      scope,
      ...(scope === "home" ? {} : { targetSlug }),
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
              variants: { where: { isEnabled: true }, orderBy: { sortOrder: "asc" } },
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
      }),
      prisma.product.findMany({
        where: { isPublished: true, isFeatured: true },
        include: { images: { orderBy: [{ isFeatured: "desc" }, { sortOrder: "asc" }] }, variants: { where: { isEnabled: true }, orderBy: { sortOrder: "asc" } } },
        orderBy: { updatedAt: "desc" },
        take: 4,
      }),
      prisma.product.findMany({
        where: { isPublished: true, isNewArrival: true },
        include: { images: { orderBy: [{ isFeatured: "desc" }, { sortOrder: "asc" }] }, variants: { where: { isEnabled: true }, orderBy: { sortOrder: "asc" } } },
        orderBy: { updatedAt: "desc" },
        take: 4,
      }),
      prisma.testimonial.findMany({
        where: { isEnabled: true },
        orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
        take: 6,
      }),
    ]);

  const featuredCategorySlugs = [
    "office-wear",
    "coord-sets",
    "lounge-wear",
    "tops-shirts",
    "dresses",
    "reclaimed-thread",
  ];
  const prioritizedCategories = categories.sort((left, right) => {
    const leftIndex = featuredCategorySlugs.indexOf(left.slug);
    const rightIndex = featuredCategorySlugs.indexOf(right.slug);
    const normalizedLeft = leftIndex === -1 ? Number.MAX_SAFE_INTEGER : leftIndex;
    const normalizedRight = rightIndex === -1 ? Number.MAX_SAFE_INTEGER : rightIndex;
    return normalizedLeft - normalizedRight;
  }).slice(0, 6);

  return {
    banners,
    categories: prioritizedCategories,
    featuredProducts,
    newArrivals,
    testimonials,
  };
}

export async function getShopProducts(options: {
  q?: string;
  category?: string;
  size?: string;
  color?: string;
  minPrice?: number;
  maxPrice?: number;
  availability?: string;
  sort?: string;
} = {}) {
  const { q, category, size, color, minPrice, maxPrice, availability, sort } = options;
  return prisma.product.findMany({
    where: {
      isPublished: true,
      AND: [
        ...(q ? [{ OR: [
          { name: { contains: q, mode: "insensitive" as const } },
          { shortDescription: { contains: q, mode: "insensitive" as const } },
          { description: { contains: q, mode: "insensitive" as const } },
          { sku: { contains: q, mode: "insensitive" as const } },
          { categories: { some: { category: { title: { contains: q, mode: "insensitive" as const } } } } },
        ] }] : []),
        ...(category ? [{ categories: { some: { category: { slug: category } } } }] : []),
        ...(size ? [{ OR: [{ sizes: { contains: size, mode: "insensitive" as const } }, { variants: { some: { size: { equals: size, mode: "insensitive" as const }, isEnabled: true } } }] }] : []),
        ...(color ? [{ OR: [{ colors: { contains: color, mode: "insensitive" as const } }, { variants: { some: { color: { equals: color, mode: "insensitive" as const }, isEnabled: true } } }] }] : []),
        ...((minPrice !== undefined || maxPrice !== undefined) ? [{ price: { ...(minPrice !== undefined ? { gte: minPrice } : {}), ...(maxPrice !== undefined ? { lte: maxPrice } : {}) } }] : []),
        ...(availability === "in-stock" ? [{ OR: [{ inventory: { gt: 0 } }, { variants: { some: { inventory: { gt: 0 }, isEnabled: true } } }] }] : []),
      ],
    },
    include: {
      categories: { include: { category: true } },
      images: { orderBy: [{ isFeatured: "desc" }, { sortOrder: "asc" }] },
      variants: { where: { isEnabled: true }, orderBy: { sortOrder: "asc" } },
    },
    orderBy: sort === "price-asc" ? { price: "asc" } : sort === "price-desc" ? { price: "desc" } : sort === "name" ? { name: "asc" } : { updatedAt: "desc" },
  });
}

export async function getShopFilterOptions() {
  return prisma.product.findMany({
    where: { isPublished: true },
    select: {
      colors: true,
      sizes: true,
      variants: {
        where: { isEnabled: true },
        select: { color: true, size: true },
      },
    },
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
