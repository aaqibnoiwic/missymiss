export const SHOP_COLLECTIONS = ["women", "baby-girls", "reclaimed-thread"] as const;

export type ShopCollection = (typeof SHOP_COLLECTIONS)[number];

export type ShopFilterSearch = {
  q?: string;
  collection?: string;
  category?: string;
  size?: string;
  color?: string;
  minPrice?: string;
  maxPrice?: string;
  availability?: string;
  sort?: string;
};

export type ShopFilterState = {
  q: string;
  collection: ShopCollection | "";
  category: string;
  size: string;
  color: string;
  minPrice: string;
  maxPrice: string;
  availability: boolean;
  sort: string;
};

export const EMPTY_SHOP_FILTERS: ShopFilterState = {
  q: "",
  collection: "",
  category: "",
  size: "",
  color: "",
  minPrice: "",
  maxPrice: "",
  availability: false,
  sort: "",
};

export function toShopFilterState(filters: ShopFilterSearch): ShopFilterState {
  const collection = SHOP_COLLECTIONS.find((value) => value === filters.collection) ?? "";

  return {
    q: filters.q ?? "",
    collection,
    category: filters.category ?? "",
    size: filters.size ?? "",
    color: filters.color ?? "",
    minPrice: filters.minPrice ?? "",
    maxPrice: filters.maxPrice ?? "",
    availability: filters.availability === "in-stock",
    sort: filters.sort ?? "",
  };
}

export function buildCollectionTypeFilter(collection?: string) {
  const collectionType = SHOP_COLLECTIONS.find((value) => value === collection);

  if (!collectionType) return undefined;

  return {
    categories: {
      some: {
        category: { collectionType },
      },
    },
  };
}

export function buildShopHref(filters: ShopFilterState): string {
  const params = new URLSearchParams();
  const values = [
    ["q", filters.q],
    ["collection", filters.collection],
    ["category", filters.category],
    ["size", filters.size],
    ["color", filters.color],
    ["minPrice", filters.minPrice],
    ["maxPrice", filters.maxPrice],
  ] as const;

  for (const [name, value] of values) {
    const normalized = value.trim();
    if (normalized) params.set(name, normalized);
  }

  if (filters.availability) params.set("availability", "in-stock");
  if (filters.sort) params.set("sort", filters.sort);

  const query = params.toString();
  return query ? `/shop?${query}` : "/shop";
}
