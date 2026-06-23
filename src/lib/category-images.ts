const categoryImages: Record<string, string> = {
  "tops-shirts": "/categories/tops-shirts.webp",
  dresses: "/categories/dresses.webp",
  bottoms: "/categories/bottoms.webp",
  "ethnic-wear": "/categories/ethnic-wear.webp",
  "office-wear": "/categories/office-wear.webp",
  "coord-sets": "/categories/office-wear.webp",
  "lounge-wear": "/categories/dresses.webp",
  "baby-girls": "/categories/baby-girls.webp",
  "baby-girls-0-2-years": "/categories/baby-girls.webp",
};

export function getCategoryImage(slug: string, title: string) {
  const normalizedTitle = title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

  return categoryImages[slug] || categoryImages[normalizedTitle] || "";
}
