import { NextResponse } from "next/server";
import { createCheckoutSession, validateCart, type CheckoutCartItem } from "@/lib/ecommerce";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { items?: CheckoutCartItem[] };
    const items = await validateCart(body.items ?? []);
    if (!items.length) {
      return NextResponse.json({ error: "Cart is empty." }, { status: 400 });
    }
    const checkout = await createCheckoutSession(items);
    return NextResponse.json(checkout);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Checkout could not be started.";
    const status = message.includes("awaiting onboarding") ? 503 : 400;
    return NextResponse.json({ error: message }, { status });
  }
}
