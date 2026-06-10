import { createHash } from "crypto";
import type { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { verifyWebhookSignature } from "@/lib/webhooks";

type CheckoutPayload = {
  event?: string;
  id?: string;
  order?: {
    id?: string | number;
    order_number?: string;
    status?: string;
    payment_status?: string;
    payment_method?: string;
    currency?: string;
    subtotal?: number;
    discount?: number;
    shipping?: number;
    total?: number;
    customer?: { name?: string; email?: string; phone?: string };
    billing_address?: Record<string, unknown>;
    shipping_address?: Record<string, unknown>;
    items?: Array<{
      id?: string;
      product_id?: string;
      name?: string;
      variant?: string;
      sku?: string;
      image?: string;
      quantity?: number;
      price?: number;
    }>;
  };
};

function paise(value = 0) {
  return Math.round(value * 100);
}

function json(value: unknown) {
  return JSON.parse(JSON.stringify(value)) as Prisma.InputJsonValue;
}

export async function POST(request: Request) {
  const rawBody = await request.text();
  if (!verifyWebhookSignature(rawBody, request.headers.get("x-shiprocket-signature"))) {
    return NextResponse.json({ error: "Invalid webhook signature." }, { status: 401 });
  }

  const payload = JSON.parse(rawBody) as CheckoutPayload;
  const order = payload.order;
  if (!order?.id) {
    return NextResponse.json({ error: "Webhook order is missing." }, { status: 400 });
  }

  const eventKey =
    payload.id ?? createHash("sha256").update(`${payload.event}:${order.id}:${rawBody}`).digest("hex");
  const existing = await prisma.webhookEvent.findUnique({ where: { eventKey } });
  if (existing) return NextResponse.json({ received: true, duplicate: true });

  await prisma.$transaction(async (tx) => {
    await tx.order.upsert({
      where: { orderNumber: order.order_number ?? String(order.id) },
      create: {
        orderNumber: order.order_number ?? String(order.id),
        checkoutOrderId: String(order.id),
        status: order.status ?? "pending",
        paymentStatus: order.payment_status ?? "pending",
        paymentMethod: order.payment_method ?? "",
        currency: order.currency ?? "INR",
        subtotal: paise(order.subtotal),
        discount: paise(order.discount),
        shipping: paise(order.shipping),
        total: paise(order.total),
        customerName: order.customer?.name ?? "",
        customerEmail: order.customer?.email ?? "",
        customerPhone: order.customer?.phone ?? "",
        billingAddress: order.billing_address ? json(order.billing_address) : undefined,
        shippingAddress: order.shipping_address ? json(order.shipping_address) : undefined,
        rawPayload: json(payload),
        items: {
          create: (order.items ?? []).map((item) => ({
            productId: item.product_id || null,
            variantId: item.id && item.id !== item.product_id ? item.id : null,
            productName: item.name ?? "Product",
            variantName: item.variant ?? "",
            sku: item.sku ?? "",
            imageUrl: item.image ?? "",
            quantity: item.quantity ?? 1,
            unitPrice: paise(item.price),
            total: paise(item.price) * (item.quantity ?? 1),
          })),
        },
      },
      update: {
        checkoutOrderId: String(order.id),
        status: order.status ?? "pending",
        paymentStatus: order.payment_status ?? "pending",
        paymentMethod: order.payment_method ?? "",
        rawPayload: json(payload),
      },
    });
    await tx.webhookEvent.create({
      data: {
        provider: "shiprocket-checkout",
        eventKey,
        eventType: payload.event ?? "",
        payload: json(payload),
      },
    });
  });

  return NextResponse.json({ received: true });
}
