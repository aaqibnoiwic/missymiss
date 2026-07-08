import { NextResponse, type NextRequest } from "next/server";
import { createCheckoutAccessToken } from "@/lib/shiprocket-checkout";
import { toShiprocketNumericId } from "@/lib/shiprocket-id";

type IncomingItem = { variant_id?: string; quantity?: number };

// Redirect URL is built server-side from a trusted origin to avoid open-redirect
// injection from client-supplied values.
function resolveRedirectUrl(request: NextRequest) {
  const base = process.env.NEXT_PUBLIC_SITE_URL || request.nextUrl.origin;
  return new URL("/checkout/success", base).toString();
}

function numericVariantId(value: string) {
  return /^\d+$/.test(value) ? value : String(toShiprocketNumericId(value));
}

function sanitizeItems(items: IncomingItem[]) {
  const cleaned = items
    .map((item) => ({
      variant_id: String(item.variant_id ?? "").trim(),
      quantity: Number(item.quantity),
    }))
    .filter(
      (item) => item.variant_id && Number.isInteger(item.quantity) && item.quantity > 0 && item.quantity <= 50,
    )
    .map((item) => ({
      ...item,
      variant_id: numericVariantId(item.variant_id),
    }));
  return cleaned;
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as { items?: IncomingItem[] };
    const items = sanitizeItems(body.items ?? []);
    if (!items.length) {
      return NextResponse.json({ error: "Cart is empty." }, { status: 400 });
    }

    const { token, orderId } = await createCheckoutAccessToken(
      { items },
      resolveRedirectUrl(request),
    );
    return NextResponse.json({ token, orderId });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Checkout could not be started.";
    const status = message.includes("not configured") ? 503 : 400;
    return NextResponse.json({ error: message }, { status });
  }
}
