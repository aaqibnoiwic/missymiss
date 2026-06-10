import { prisma } from "@/lib/db";

export type CheckoutCartItem = {
  variantId: string;
  quantity: number;
};

export async function validateCart(items: CheckoutCartItem[]) {
  const quantities = new Map<string, number>();

  for (const item of items) {
    if (!item.variantId || !Number.isInteger(item.quantity) || item.quantity < 1) {
      throw new Error("Cart contains an invalid item.");
    }
    quantities.set(item.variantId, (quantities.get(item.variantId) ?? 0) + item.quantity);
  }

  const variants = await prisma.productVariant.findMany({
    where: {
      id: { in: [...quantities.keys()] },
      isEnabled: true,
      product: { isPublished: true },
    },
    include: {
      product: {
        include: {
          images: { orderBy: [{ isFeatured: "desc" }, { sortOrder: "asc" }], take: 1 },
        },
      },
    },
  });

  if (variants.length !== quantities.size) {
    throw new Error("One or more cart items are no longer available.");
  }

  return variants.map((variant) => {
    const quantity = quantities.get(variant.id) ?? 0;
    if (quantity > variant.inventory) {
      throw new Error(`${variant.product.name} only has ${variant.inventory} available.`);
    }

    return {
      variantId: variant.id,
      productId: variant.productId,
      name: variant.product.name,
      variantName: variant.title || [variant.color, variant.size].filter(Boolean).join(" / "),
      sku: variant.sku,
      imageUrl: variant.product.featuredImage || variant.product.images[0]?.imageUrl || "",
      quantity,
      unitPrice: variant.price,
      total: variant.price * quantity,
      weight: variant.weight,
      length: variant.length,
      breadth: variant.breadth,
      height: variant.height,
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
    headers: {
      Authorization: `Bearer ${process.env.SHIPROCKET_CHECKOUT_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      currency: "INR",
      items: items.map((item) => ({
        id: item.variantId,
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

  const payload = (await response.json().catch(() => null)) as
    | { checkout_url?: string; url?: string; id?: string; message?: string }
    | null;

  if (!response.ok || !payload) {
    throw new Error(payload?.message ?? "Shiprocket Checkout could not be started.");
  }

  return {
    checkoutId: payload.id ?? "",
    checkoutUrl: payload.checkout_url ?? payload.url ?? "",
  };
}
