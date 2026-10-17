const categoryImages: Record<string, string> = {
  "tops-shirts": "/categories/tops-shirts.jpeg",
  dresses: "/categories/dresses.jpeg",
  bottoms: "/categories/bottoms.jpeg",
  "ethnic-wear": "/categories/ethnic-wear.webp",
  "office-wear": "/categories/office-wear.jpeg",
  "coord-sets": "/categories/coord-sets.jpeg",
  "lounge-wear": "/categories/lounge-wear.jpeg",
  "baby-girls": "/categories/baby-girls.webp",
  "baby-girls-0-2-years": "/categories/baby-girls.webp",
};

export const featuredCategories = [
  { slug: "dresses", title: "Dresses" },
  { slug: "coord-sets", title: "Co-ord Sets" },
  { slug: "office-wear", title: "Office Wear" },
  { slug: "bottoms", title: "Bottoms" },
  { slug: "lounge-wear", title: "Lounge Wear" },
  { slug: "tops-shirts", title: "Tops & Shirts" },
].map((category) => ({
  ...category,
  imageUrl: categoryImages[category.slug],
  eyebrow: "",
  collectionType: "women",
  description: "",
}));

export function getCategoryImage(slug: string, title: string) {
  const normalizedTitle = title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

  return categoryImages[slug] || categoryImages[normalizedTitle] || "";
}

export function getCategoryQuickLink(category: {
  imageUrl: string;
  slug: string;
  title: string;
}) {
  return {
    href: `/collections/${category.slug}`,
    imageUrl: category.imageUrl || getCategoryImage(category.slug, category.title),
    title: category.title,
  };
}
