import { prisma } from "@/lib/db";

export type CheckoutCartItem = {
  productId: string;
  variantId?: string;
  quantity: number;
};

export async function validateCart(items: CheckoutCartItem[]) {
  if (!items.length) return [];
  for (const item of items) {
    if (!item.productId || !Number.isInteger(item.quantity) || item.quantity < 1) {
      throw new Error("Cart contains an invalid item.");
    }
  }

  const productIds = [...new Set(items.map((item) => item.productId))];
  const products = await prisma.product.findMany({
    where: { id: { in: productIds }, isPublished: true },
    include: {
      variants: { where: { isEnabled: true } },
      images: { orderBy: [{ isFeatured: "desc" }, { sortOrder: "asc" }], take: 1 },
    },
  });
  const productsById = new Map(products.map((product) => [product.id, product]));

  return items.map((item) => {
    const product = productsById.get(item.productId);
    if (!product) throw new Error("One or more cart items are no longer available.");
    const variant = item.variantId
      ? product.variants.find((candidate) => candidate.id === item.variantId)
      : undefined;
    if (item.variantId && !variant) throw new Error(`${product.name} option is no longer available.`);
    if (!item.variantId && product.variants.length) throw new Error(`Choose an option for ${product.name}.`);
    const inventory = variant?.inventory ?? product.inventory;
    if (item.quantity > inventory) throw new Error(`${product.name} only has ${inventory} available.`);

    return {
      variantId: variant?.id,
      productId: product.id,
      name: product.name,
      variantName: variant?.title || [variant?.color, variant?.size].filter(Boolean).join(" / "),
      sku: variant?.sku || product.sku,
      imageUrl: product.featuredImage || product.images[0]?.imageUrl || "",
      quantity: item.quantity,
      unitPrice: variant?.price ?? product.price,
      total: (variant?.price ?? product.price) * item.quantity,
      weight: variant?.weight ?? 0,
      length: variant?.length ?? 0,
      breadth: variant?.breadth ?? 0,
      height: variant?.height ?? 0,
    };
  });
}

export function isShiprocketCheckoutConfigured() {
  return Boolean(
    process.env.SHIPROCKET_CHECKOUT_ENABLED === "true" &&
      process.env.SHIPROCKET_CHECKOUT_API_URL &&
      process.env.SHIPROCKET_CHECKOUT_API_KEY,
  );
}

export async function createCheckoutSession(items: Awaited<ReturnType<typeof validateCart>>) {
  if (!isShiprocketCheckoutConfigured()) {
    throw new Error("Shiprocket Checkout is awaiting onboarding credentials.");
  }
  const response = await fetch(process.env.SHIPROCKET_CHECKOUT_API_URL!, {
    method: "POST",
    headers: { Authorization: `Bearer ${process.env.SHIPROCKET_CHECKOUT_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      currency: "INR",
      items: items.map((item) => ({
        id: item.variantId || item.productId,
        product_id: item.productId,
        name: item.name,
        variant: item.variantName,
        sku: item.sku,
        image: item.imageUrl,
        quantity: item.quantity,
        price: item.unitPrice / 100,
      })),
      return_url: `${process.env.NEXT_PUBLIC_SITE_URL ?? ""}/checkout/success`,
    }),
    cache: "no-store",
  });
  const payload = (await response.json().catch(() => null)) as { checkout_url?: string; url?: string; id?: string; message?: string } | null;
  if (!response.ok || !payload) throw new Error(payload?.message ?? "Shiprocket Checkout could not be started.");
  return { checkoutId: payload.id ?? "", checkoutUrl: payload.checkout_url ?? payload.url ?? "" };
}
