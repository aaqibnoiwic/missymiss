import assert from "node:assert/strict";
import test from "node:test";
import * as shopFilterQuery from "./shop-filter-query.ts";
import {
  buildShopHref,
  buildCollectionTypeFilter,
  EMPTY_SHOP_FILTERS,
  toShopFilterState,
} from "./shop-filter-query.ts";

test("filter navigation immediately replaces the URL for discrete controls", () => {
  assert.ok(
    "createShopFilterNavigator" in shopFilterQuery,
    "shop filter navigation must expose an auto-apply coordinator",
  );

  const navigations: string[] = [];
  const navigator = shopFilterQuery.createShopFilterNavigator({
    navigate: (href) => navigations.push(href),
  });

  navigator.immediate({ ...EMPTY_SHOP_FILTERS, category: "dresses" });

  assert.deepEqual(navigations, ["/shop?category=dresses"]);
});

test("filter navigation debounces typing and only applies the latest value", () => {
  let queued: (() => void) | undefined;
  let cancellations = 0;
  const navigations: string[] = [];
  const navigator = shopFilterQuery.createShopFilterNavigator({
    cancel: () => {
      cancellations += 1;
      queued = undefined;
    },
    navigate: (href) => navigations.push(href),
    schedule: (callback) => {
      queued = callback;
      return 1;
    },
  });
  const debounced = "debounced" in navigator ? navigator.debounced : undefined;

  assert.equal(typeof debounced, "function", "shop filter navigation must debounce text inputs");
  if (!debounced) return;

  debounced({ ...EMPTY_SHOP_FILTERS, q: "li" });
  debounced({ ...EMPTY_SHOP_FILTERS, q: "linen" });

  assert.deepEqual(navigations, []);
  assert.equal(cancellations, 1);
  queued?.();
  assert.deepEqual(navigations, ["/shop?q=linen"]);
});

test("immediate filter changes cancel queued typing and skip duplicate URLs", () => {
  let queued: (() => void) | undefined;
  let cancellations = 0;
  const navigations: string[] = [];
  const navigator = shopFilterQuery.createShopFilterNavigator({
    cancel: () => {
      cancellations += 1;
      queued = undefined;
    },
    currentHref: "/shop",
    navigate: (href) => navigations.push(href),
    schedule: (callback) => {
      queued = callback;
      return 1;
    },
  });

  navigator.debounced({ ...EMPTY_SHOP_FILTERS, q: "linen" });
  navigator.immediate({ ...EMPTY_SHOP_FILTERS, category: "dresses" });
  navigator.immediate({ ...EMPTY_SHOP_FILTERS, category: "dresses" });

  assert.equal(queued, undefined);
  assert.equal(cancellations, 1);
  assert.deepEqual(navigations, ["/shop?category=dresses"]);
});

test("disposing filter navigation cancels a queued update", () => {
  let cancellations = 0;
  const navigator = shopFilterQuery.createShopFilterNavigator({
    cancel: () => {
      cancellations += 1;
    },
    navigate: () => undefined,
    schedule: () => 1,
  });
  const dispose = "dispose" in navigator ? navigator.dispose : undefined;

  assert.equal(typeof dispose, "function", "shop filter navigation must clean up queued updates");
  if (!dispose) return;

  navigator.debounced({ ...EMPTY_SHOP_FILTERS, q: "linen" });
  dispose();

  assert.equal(cancellations, 1);
});

test("an older response cannot replace a newer debounced filter draft", () => {
  let delay: number | undefined;
  let queued: (() => void) | undefined;
  const navigations: string[] = [];
  const navigator = shopFilterQuery.createShopFilterNavigator({
    currentHref: "/shop",
    navigate: (href) => navigations.push(href),
    schedule: (callback, wait) => {
      delay = wait;
      queued = callback;
      return 1;
    },
  });
  const first = { ...EMPTY_SHOP_FILTERS, category: "dresses" };
  const latest = { ...first, q: "linen" };

  navigator.immediate(first);
  navigator.debounced(latest);

  assert.equal(delay, 400);
  assert.equal(
    "acknowledge" in navigator ? navigator.acknowledge("/shop?category=dresses") : undefined,
    false,
    "an older server response must not replace a queued draft",
  );

  queued?.();
  assert.deepEqual(navigations, [
    "/shop?category=dresses",
    "/shop?q=linen&category=dresses",
  ]);
  assert.equal(
    "acknowledge" in navigator ? navigator.acknowledge("/shop?category=dresses") : undefined,
    false,
    "an older server response must not replace the latest requested filters",
  );
  assert.equal(
    "acknowledge" in navigator ? navigator.acknowledge("/shop?q=linen&category=dresses") : undefined,
    true,
  );
});

test("an external navigation supersedes a pending filter request", () => {
  const navigations: string[] = [];
  const navigator = shopFilterQuery.createShopFilterNavigator({
    currentHref: "/shop",
    navigate: (href) => navigations.push(href),
  });

  navigator.immediate({ ...EMPTY_SHOP_FILTERS, category: "dresses" });

  assert.equal(navigator.acknowledge("/shop?collection=women"), true);
  navigator.immediate({ ...EMPTY_SHOP_FILTERS, collection: "women" });
  assert.deepEqual(navigations, ["/shop?category=dresses"]);
});

test("a matching response clears its pending request while preserving an equivalent draft", () => {
  let queued: (() => void) | undefined;
  const navigations: string[] = [];
  const navigator = shopFilterQuery.createShopFilterNavigator({
    currentHref: "/shop",
    navigate: (href) => navigations.push(href),
    schedule: (callback) => {
      queued = callback;
      return 1;
    },
  });

  navigator.immediate({ ...EMPTY_SHOP_FILTERS, q: "linen" });
  navigator.debounced({ ...EMPTY_SHOP_FILTERS, q: "linen " });

  assert.equal(navigator.acknowledge("/shop?q=linen"), false);
  queued?.();
  assert.deepEqual(navigations, ["/shop?q=linen"]);
  assert.equal(navigator.acknowledge("/shop?collection=women"), true);
});

test("an explicit external navigation can return to the committed URL", () => {
  const navigations: string[] = [];
  const navigator = shopFilterQuery.createShopFilterNavigator({
    currentHref: "/shop",
    navigate: (href) => navigations.push(href),
  });
  const external = "external" in navigator ? navigator.external : undefined;

  navigator.immediate({ ...EMPTY_SHOP_FILTERS, availability: true });
  assert.equal(typeof external, "function", "external navigation must be able to cancel optimistic filters");
  if (!external) return;

  external();
  assert.equal(navigator.acknowledge("/shop"), true);
  navigator.immediate(EMPTY_SHOP_FILTERS);
  assert.deepEqual(navigations, ["/shop?availability=in-stock"]);
});

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
