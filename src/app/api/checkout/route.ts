import { NextResponse } from "next/server";
import {
  createWebsiteOrder,
  validateCart,
  type CheckoutCartItem,
  type CheckoutCustomer,
} from "@/lib/ecommerce";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { customer?: CheckoutCustomer; items?: CheckoutCartItem[] };
    const items = await validateCart(body.items ?? []);
    if (!items.length) {
      return NextResponse.json({ error: "Cart is empty." }, { status: 400 });
    }
    if (!body.customer) {
      return NextResponse.json({ error: "Delivery details are required." }, { status: 400 });
    }
    const order = await createWebsiteOrder(items, body.customer);
    return NextResponse.json(order);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Checkout could not be started.";
    const status = message.includes("awaiting onboarding") ? 503 : 400;
    return NextResponse.json({ error: message }, { status });
  }
}
