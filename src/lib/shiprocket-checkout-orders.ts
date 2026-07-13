import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import type { ShiprocketCheckoutOrder } from "@/lib/shiprocket-checkout";
import { resolveShiprocketProductId, resolveShiprocketVariantId } from "@/lib/shiprocket-id";

function paise(value = 0) {
  return Math.round(value * 100);
}

function json(value: unknown) {
  return JSON.parse(JSON.stringify(value)) as Prisma.InputJsonValue;
}

function text(value: unknown) {
  return typeof value === "string" ? value : "";
}

function customerName(payload: ShiprocketCheckoutOrder) {
  const shipping = payload.shipping_address ?? {};
  const billing = payload.billing_address ?? {};
  return [
    text(shipping.first_name) || text(billing.first_name),
    text(shipping.last_name) || text(billing.last_name),
  ].filter(Boolean).join(" ");
}

function normalizePaymentMethod(paymentType?: string | null) {
  return paymentType?.toUpperCase().includes("COD") || paymentType?.toUpperCase().includes("CASH")
    ? "COD"
    : "Prepaid";
}

async function buildOrderItems(items: Array<{ variant_id?: string; quantity?: number }>) {
  const result: Prisma.OrderItemUncheckedCreateWithoutOrderInput[] = [];
  for (const item of items) {
    const externalVariantId = String(item.variant_id ?? "").trim();
    const quantity = Number(item.quantity) > 0 ? Number(item.quantity) : 1;
    if (!externalVariantId) continue;

    const variantId = await resolveShiprocketVariantId(externalVariantId);
    const productId = variantId ? null : await resolveShiprocketProductId(externalVariantId);

    const variant = variantId
      ? await prisma.productVariant.findUnique({
          where: { id: variantId },
          include: { product: { include: { images: { orderBy: [{ isFeatured: "desc" }, { sortOrder: "asc" }], take: 1 } } } },
        })
      : null;
    const product = variant
      ? variant.product
      : productId
        ? await prisma.product.findUnique({
            where: { id: productId },
            include: { images: { orderBy: [{ isFeatured: "desc" }, { sortOrder: "asc" }], take: 1 } },
          })
        : null;

    const unitPrice = variant?.price ?? product?.price ?? 0;
    result.push({
      productId: product?.id ?? null,
      variantId: variant?.id ?? null,
      productName: product?.name ?? "Product",
      variantName: variant?.title || [variant?.color, variant?.size].filter(Boolean).join(" / ") || "",
      sku: variant?.sku || product?.sku || "",
      imageUrl: product?.featuredImage || product?.images[0]?.imageUrl || "",
      quantity,
      unitPrice,
      total: unitPrice * quantity,
    });
  }
  return result;
}

export async function upsertShiprocketCheckoutOrder(payload: ShiprocketCheckoutOrder) {
  const orderId = payload.order_id ?? payload.platform_order_id;
  if (!orderId) throw new Error("Shiprocket checkout order id missing.");

  const orderItems = await buildOrderItems(payload.cart_data?.items ?? []);
  const subtotal = payload.subtotal_price != null
    ? paise(payload.subtotal_price)
    : orderItems.reduce((sum, item) => sum + item.total, 0);
  const total = payload.total_amount_payable != null ? paise(payload.total_amount_payable) : subtotal;
  const isSuccess = payload.status?.toUpperCase() === "SUCCESS";
  const paymentMethod = normalizePaymentMethod(payload.payment_type);
  const paymentStatus = payload.payment_status?.toLowerCase() || (isSuccess && paymentMethod === "Prepaid" ? "paid" : "pending");
  const shipping = payload.shipping_address ?? {};
  const billing = payload.billing_address ?? {};

  return prisma.order.upsert({
    where: { orderNumber: orderId },
    create: {
      orderNumber: orderId,
      checkoutOrderId: orderId,
      status: isSuccess ? "confirmed" : "pending",
      paymentStatus,
      paymentMethod,
      currency: "INR",
      subtotal,
      discount: paise(payload.total_discount ?? payload.coupon_discount ?? 0),
      shipping: paise(payload.cod_charges ?? 0),
      total,
      customerName: customerName(payload),
      customerEmail: text(payload.email) || text(shipping.email) || text(billing.email),
      customerPhone: text(payload.phone) || text(shipping.phone) || text(billing.phone),
      billingAddress: payload.billing_address ? json(payload.billing_address) : undefined,
      shippingAddress: payload.shipping_address ? json(payload.shipping_address) : undefined,
      rawPayload: json(payload),
      items: { create: orderItems },
    },
    update: {
      checkoutOrderId: orderId,
      status: isSuccess ? "confirmed" : "pending",
      paymentStatus,
      paymentMethod,
      subtotal,
      discount: paise(payload.total_discount ?? payload.coupon_discount ?? 0),
      shipping: paise(payload.cod_charges ?? 0),
      total,
      customerName: customerName(payload),
      customerEmail: text(payload.email) || text(shipping.email) || text(billing.email),
      customerPhone: text(payload.phone) || text(shipping.phone) || text(billing.phone),
      billingAddress: payload.billing_address ? json(payload.billing_address) : undefined,
      shippingAddress: payload.shipping_address ? json(payload.shipping_address) : undefined,
      rawPayload: json(payload),
      ...(orderItems.length ? { items: { deleteMany: {}, create: orderItems } } : {}),
    },
    include: { items: true },
  });
}
