import { createHash } from "crypto";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { verifyCheckoutOrder } from "@/lib/shiprocket-checkout";
import { upsertShiprocketCheckoutOrder } from "@/lib/shiprocket-checkout-orders";
import { syncOrderToShiprocket } from "@/lib/shiprocket-order-sync";
import { verifyWebhookSignature, verifyWebhookToken } from "@/lib/webhooks";

type CheckoutPayload = {
  event?: string;
  order_id?: string;
  status?: string;
  phone?: string;
  email?: string;
  payment_type?: string;
  payment_status?: string;
  platform_order_id?: string;
  subtotal_price?: number;
  total_discount?: number;
  coupon_discount?: number;
  cod_charges?: number;
  total_amount_payable?: number;
  billing_address?: Record<string, unknown>;
  shipping_address?: Record<string, unknown>;
  cart_data?: {
    items?: Array<{ variant_id?: string; quantity?: number }>;
  };
};

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

  const order = await upsertShiprocketCheckoutOrder(payload);
  await syncOrderToShiprocket(order.id).catch((error) => {
    console.error("Shiprocket shipping sync failed", error);
  });
  await prisma.webhookEvent.create({
    data: {
      provider: "shiprocket-checkout",
      eventKey,
      eventType: payload.event ?? payload.status ?? "",
      payload: JSON.parse(JSON.stringify(payload)),
    },
  });

  return NextResponse.json({ received: true });
}
