import { createHash } from "crypto";
import type { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { resolveShiprocketProductId, resolveShiprocketVariantId } from "@/lib/shiprocket-id";
import { verifyCheckoutOrder } from "@/lib/shiprocket-checkout";
import { verifyWebhookSignature, verifyWebhookToken } from "@/lib/webhooks";

type CheckoutPayload = {
  event?: string;
  order_id?: string;
  status?: string;
  phone?: string;
  email?: string;
  name?: string;
  payment_type?: string;
  total_amount_payable?: number;
  billing_address?: Record<string, unknown>;
  shipping_address?: Record<string, unknown>;
  cart_data?: {
    items?: Array<{ variant_id?: string; quantity?: number }>;
  };
};

function paise(value = 0) {
  return Math.round(value * 100);
}

function json(value: unknown) {
  return JSON.parse(JSON.stringify(value)) as Prisma.InputJsonValue;
}

function normalizePaymentMethod(paymentType?: string) {
  return paymentType?.toUpperCase().includes("COD") || paymentType?.toUpperCase().includes("CASH")
    ? "COD"
    : "Prepaid";
}

// Resolve each checkout line (variant_id can be our ProductVariant id, or the
// Product id for products without variants) into a persisted order item.
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

export async function POST(request: Request) {
  const rawBody = await request.text();
  const payload = JSON.parse(rawBody) as CheckoutPayload;
  const orderId = payload.order_id;
  if (!orderId) {
    return NextResponse.json({ error: "Webhook order is missing." }, { status: 400 });
  }

  // Accept the webhook when it carries a valid token/signature, or when the
  // order can be confirmed directly with Shiprocket (the order webhook itself
  // is open-access per Shiprocket's guide).
  const tokenAuthorized = verifyWebhookToken(request.headers.get("x-api-key"));
  const signatureAuthorized = verifyWebhookSignature(rawBody, request.headers.get("x-shiprocket-signature"));
  const orderVerified = tokenAuthorized || signatureAuthorized ? true : await verifyCheckoutOrder(orderId);
  if (!orderVerified) {
    return NextResponse.json({ error: "Webhook could not be authenticated." }, { status: 401 });
  }

  const eventKey =
    createHash("sha256").update(`${payload.event ?? "order"}:${orderId}:${rawBody}`).digest("hex");
  if (await prisma.webhookEvent.findUnique({ where: { eventKey } })) {
    return NextResponse.json({ received: true, duplicate: true });
  }

  const isSuccess = payload.status?.toUpperCase() === "SUCCESS";
  const paymentMethod = normalizePaymentMethod(payload.payment_type);
  const orderItems = await buildOrderItems(payload.cart_data?.items ?? []);
  const subtotal = orderItems.reduce((sum, item) => sum + item.total, 0);
  const total = payload.total_amount_payable != null ? paise(payload.total_amount_payable) : subtotal;

  await prisma.$transaction(async (tx) => {
    await tx.order.upsert({
      where: { orderNumber: orderId },
      create: {
        orderNumber: orderId,
        checkoutOrderId: orderId,
        status: isSuccess ? "confirmed" : "pending",
        paymentStatus: isSuccess && paymentMethod === "Prepaid" ? "paid" : "pending",
        paymentMethod,
        currency: "INR",
        subtotal,
        total,
        customerName: payload.name ?? "",
        customerEmail: payload.email ?? "",
        customerPhone: payload.phone ?? "",
        billingAddress: payload.billing_address ? json(payload.billing_address) : undefined,
        shippingAddress: payload.shipping_address ? json(payload.shipping_address) : undefined,
        rawPayload: json(payload),
        items: { create: orderItems },
      },
      update: {
        checkoutOrderId: orderId,
        status: isSuccess ? "confirmed" : "pending",
        paymentStatus: isSuccess && paymentMethod === "Prepaid" ? "paid" : "pending",
        paymentMethod,
        rawPayload: json(payload),
      },
    });
    await tx.webhookEvent.create({
      data: {
        provider: "shiprocket-checkout",
        eventKey,
        eventType: payload.event ?? payload.status ?? "",
        payload: json(payload),
      },
    });
  });

  return NextResponse.json({ received: true });
}
