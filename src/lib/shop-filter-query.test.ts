import assert from "node:assert/strict";
import test from "node:test";
import {
  buildShopHref,
  buildCollectionTypeFilter,
  EMPTY_SHOP_FILTERS,
  toShopFilterState,
} from "./shop-filter-query.ts";

test("buildShopHref omits empty filter values", () => {
  assert.equal(buildShopHref(EMPTY_SHOP_FILTERS), "/shop");
});

test("buildShopHref includes collection and active filters", () => {
  assert.equal(
    buildShopHref({
      ...EMPTY_SHOP_FILTERS,
      q: "linen set",
      collection: "women",
      category: "coord-sets",
      minPrice: "1000",
      availability: true,
      sort: "price-asc",
    }),
    "/shop?q=linen+set&collection=women&category=coord-sets&minPrice=1000&availability=in-stock&sort=price-asc",
  );
});

test("toShopFilterState accepts supported collection values", () => {
  assert.deepEqual(
    toShopFilterState({ collection: "baby-girls", availability: "in-stock" }),
    {
      ...EMPTY_SHOP_FILTERS,
      collection: "baby-girls",
      availability: true,
    },
  );
});

test("toShopFilterState ignores unsupported collection values", () => {
  assert.equal(toShopFilterState({ collection: "unknown" }).collection, "");
});

test("buildCollectionTypeFilter maps a supported group to the category relation", () => {
  assert.deepEqual(buildCollectionTypeFilter("reclaimed-thread"), {
    categories: {
      some: {
        category: { collectionType: "reclaimed-thread" },
      },
    },
  });
});

test("buildCollectionTypeFilter ignores unsupported group values", () => {
  assert.equal(buildCollectionTypeFilter("unknown"), undefined);
});
