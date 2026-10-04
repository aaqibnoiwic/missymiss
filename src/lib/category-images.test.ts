import assert from "node:assert/strict";
import test from "node:test";
import { getCategoryQuickLink } from "./category-images.ts";

test("getCategoryQuickLink points to the matching collection and thumbnail", () => {
  assert.deepEqual(
    getCategoryQuickLink({
      imageUrl: "",
      slug: "coord-sets",
      title: "Coord sets",
    }),
    {
      href: "/collections/coord-sets",
      imageUrl: "/categories/coord-sets.webp",
      title: "Coord sets",
    },
  );
});

test("getCategoryQuickLink prefers a managed category image", () => {
  assert.equal(
    getCategoryQuickLink({
      imageUrl: "https://cdn.example.com/category.webp",
      slug: "dresses",
      title: "Dresses",
    }).imageUrl,
    "https://cdn.example.com/category.webp",
  );
});
