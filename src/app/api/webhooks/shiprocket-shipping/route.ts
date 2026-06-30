import { createHash } from "crypto";
import type { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { verifyWebhookSignature, verifyWebhookToken } from "@/lib/webhooks";

type ShippingPayload = {
  awb?: string;
  current_status?: string;
  courier_name?: string;
  shipment_id?: string | number;
  sr_order_id?: string | number;
  tracking_url?: string;
};

function json(value: unknown) {
  return JSON.parse(JSON.stringify(value)) as Prisma.InputJsonValue;
}

export async function POST(request: Request) {
  const rawBody = await request.text();
  const tokenAuthorized = verifyWebhookToken(request.headers.get("x-api-key"));
  const signatureAuthorized = verifyWebhookSignature(
    rawBody,
    request.headers.get("x-shiprocket-signature"),
  );
  if (!tokenAuthorized && !signatureAuthorized) {
    return NextResponse.json({ error: "Invalid webhook authentication." }, { status: 401 });
  }

  const payload = JSON.parse(rawBody) as ShippingPayload;
  const eventKey = createHash("sha256").update(rawBody).digest("hex");
  if (await prisma.webhookEvent.findUnique({ where: { eventKey } })) {
    return NextResponse.json({ received: true, duplicate: true });
  }

  await prisma.$transaction(async (tx) => {
    const shipment = payload.awb
      ? await tx.shipment.findFirst({ where: { awbCode: payload.awb } })
      : await tx.shipment.findFirst({
          where: { shiprocketShipmentId: String(payload.shipment_id ?? "") },
        });

    if (shipment) {
      await tx.shipment.update({
        where: { id: shipment.id },
        data: {
          status: payload.current_status ?? shipment.status,
          courierName: payload.courier_name ?? shipment.courierName,
          trackingUrl: payload.tracking_url ?? shipment.trackingUrl,
          rawPayload: json(payload),
        },
      });
    }

    await tx.webhookEvent.create({
      data: {
        provider: "shiprocket-shipping",
        eventKey,
        eventType: payload.current_status ?? "",
        payload: json(payload),
      },
    });
  });

  return NextResponse.json({ received: true });
}
