import { createHmac } from "crypto";
import { prisma } from "@/lib/db";
import {
  fetchShiprocketCollection,
  fetchShiprocketProduct,
} from "@/lib/shiprocket-catalog";

const DEFAULT_BASE = "https://checkout-api.shiprocket.com";
const PRODUCT_WEBHOOK_PATH = "/wh/v1/custom/product";
const COLLECTION_WEBHOOK_PATH = "/wh/v1/custom/collection";

function isConfigured() {
  return Boolean(
    process.env.SHIPROCKET_CHECKOUT_API_KEY && process.env.SHIPROCKET_CHECKOUT_SECRET_KEY,
  );
}

function checkoutBase() {
  return (process.env.SHIPROCKET_CHECKOUT_API_BASE || DEFAULT_BASE).replace(/\/+$/, "");
}

function signBody(body: string) {
  return createHmac("sha256", process.env.SHIPROCKET_CHECKOUT_SECRET_KEY ?? "")
    .update(body)
    .digest("base64");
}

async function postWebhook(path: string, payload: unknown) {
  const body = JSON.stringify(payload);
  const response = await fetch(`${checkoutBase()}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Api-Key": process.env.SHIPROCKET_CHECKOUT_API_KEY ?? "",
      "X-Api-HMAC-SHA256": signBody(body),
    },
    body,
    cache: "no-store",
  });

  if (response.ok) return true;

  const message = await response.text().catch(() => "");
  throw new Error(message || `Shiprocket catalog webhook failed (${response.status}).`);
}

async function syncProduct(productId: string) {
  const payload = await fetchShiprocketProduct(productId);
  if (!payload) return false;
  return postWebhook(PRODUCT_WEBHOOK_PATH, payload);
}

async function syncCollection(collectionId: string) {
  const payload = await fetchShiprocketCollection(collectionId);
  if (!payload) return false;
  return postWebhook(COLLECTION_WEBHOOK_PATH, payload);
}

export async function syncCollectionsToShiprocket(collectionIds: string[]) {
  if (!isConfigured()) return;

  const uniqueIds = [...new Set(collectionIds.map((value) => value.trim()).filter(Boolean))];
  await Promise.all(
    uniqueIds.map(async (collectionId) => {
      try {
        await syncCollection(collectionId);
      } catch (error) {
        console.error("Shiprocket collection sync failed", { collectionId, error });
      }
    }),
  );
}

export async function syncProductCatalogToShiprocket(productId: string, collectionIds?: string[]) {
  if (!isConfigured() || !productId) return;

  try {
    await syncProduct(productId);
  } catch (error) {
    console.error("Shiprocket product sync failed", { productId, error });
  }

  if (collectionIds?.length) {
    await syncCollectionsToShiprocket(collectionIds);
    return;
  }

  const relations = await prisma.productCategory.findMany({
    where: { productId },
    select: { categoryId: true },
  });
  await syncCollectionsToShiprocket(relations.map((relation) => relation.categoryId));
}

export async function syncCollectionCatalogAndProductsToShiprocket(collectionId: string) {
  if (!isConfigured() || !collectionId) return;

  await syncCollectionsToShiprocket([collectionId]);

  const products = await prisma.productCategory.findMany({
    where: { categoryId: collectionId },
    select: { productId: true },
  });

  await Promise.all(
    [...new Set(products.map((entry) => entry.productId))].map(async (productId) => {
      try {
        await syncProduct(productId);
      } catch (error) {
        console.error("Shiprocket product sync failed after collection update", {
          collectionId,
          productId,
          error,
        });
      }
    }),
  );
}
