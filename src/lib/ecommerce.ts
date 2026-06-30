import { prisma } from "@/lib/db";
import type { Prisma } from "@prisma/client";

export type CheckoutCartItem = {
  productId: string;
  variantId?: string;
  quantity: number;
};

export type CheckoutCustomer = {
  name?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
  country?: string;
  paymentMethod?: string;
  notes?: string;
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

function clean(value?: string) {
  return String(value ?? "").trim();
}

function json(value: unknown) {
  return JSON.parse(JSON.stringify(value)) as Prisma.InputJsonValue;
}

function makeOrderNumber() {
  const date = new Date();
  const stamp = [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
  ].join("");
  return `MM-${stamp}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
}

export async function createWebsiteOrder(
  items: Awaited<ReturnType<typeof validateCart>>,
  customer: CheckoutCustomer,
) {
  if (!items.length) throw new Error("Cart is empty.");

  const details = {
    name: clean(customer.name),
    email: clean(customer.email),
    phone: clean(customer.phone),
    address: clean(customer.address),
    city: clean(customer.city),
    state: clean(customer.state),
    pincode: clean(customer.pincode),
    country: clean(customer.country) || "India",
  };

  if (!details.name || !details.phone || !details.address || !details.city || !details.state || !details.pincode) {
    throw new Error("Please complete the delivery address.");
  }

  if (!/^[1-9][0-9]{5}$/.test(details.pincode)) {
    throw new Error("Enter a valid 6 digit pincode.");
  }

  if (!/^[0-9+\-\s()]{8,16}$/.test(details.phone)) {
    throw new Error("Enter a valid phone number.");
  }

  const subtotal = items.reduce((sum, item) => sum + item.total, 0);
  const shipping = 0;
  const total = subtotal + shipping;
  const address = json(details);

  const order = await prisma.order.create({
    data: {
      orderNumber: makeOrderNumber(),
      status: "pending",
      paymentStatus: "pending",
      paymentMethod: clean(customer.paymentMethod) || "COD",
      subtotal,
      shipping,
      total,
      customerName: details.name,
      customerEmail: details.email,
      customerPhone: details.phone,
      billingAddress: address,
      shippingAddress: address,
      notes: clean(customer.notes),
      items: {
        create: items.map((item) => ({
          productId: item.productId,
          variantId: item.variantId ?? null,
          productName: item.name,
          variantName: item.variantName,
          sku: item.sku,
          imageUrl: item.imageUrl,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          total: item.total,
        })),
      },
    },
    select: { id: true, orderNumber: true, total: true },
  });

  return {
    orderId: order.id,
    orderNumber: order.orderNumber,
    redirectUrl: `/checkout/success?order=${encodeURIComponent(order.orderNumber)}`,
    total: order.total,
  };
}
