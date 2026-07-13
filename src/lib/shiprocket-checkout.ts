import { createHmac } from "crypto";

const DEFAULT_BASE = "https://checkout-api.shiprocket.com";

export type CheckoutCartData = {
  items: Array<{ variant_id: string; quantity: number }>;
};

export type ShiprocketCheckoutOrder = {
  order_id?: string;
  cart_data?: {
    items?: Array<{ variant_id?: string; quantity?: number }>;
  };
  redirect_url?: string;
  status?: string;
  source?: string | null;
  phone?: string | null;
  email?: string | null;
  shipping_plan?: string | null;
  shipping_address?: Record<string, unknown> | null;
  billing_address?: Record<string, unknown> | null;
  payment_type?: string | null;
  payment_status?: string | null;
  coupon_codes?: string[] | null;
  coupon_discount?: number | null;
  prepaid_discount?: number | null;
  total_discount?: number | null;
  cod_charges?: number | null;
  subtotal_price?: number | null;
  total_amount_payable?: number | null;
  platform_order_id?: string | null;
};

export function isShiprocketCheckoutConfigured() {
  return Boolean(
    process.env.SHIPROCKET_CHECKOUT_API_KEY && process.env.SHIPROCKET_CHECKOUT_SECRET_KEY,
  );
}

function checkoutBase() {
  return (process.env.SHIPROCKET_CHECKOUT_API_BASE || DEFAULT_BASE).replace(/\/+$/, "");
}

// Shiprocket Checkout authenticates each request with the API key plus a
// base64 HMAC-SHA256 of the exact request body, signed with the secret key.
function signBody(body: string) {
  return createHmac("sha256", process.env.SHIPROCKET_CHECKOUT_SECRET_KEY ?? "")
    .update(body)
    .digest("base64");
}

export async function createCheckoutAccessToken(cartData: CheckoutCartData, redirectUrl: string) {
  if (!isShiprocketCheckoutConfigured()) {
    throw new Error("Shiprocket Checkout API credentials are not configured.");
  }

  const body = JSON.stringify({
    cart_data: cartData,
    redirect_url: redirectUrl,
    timestamp: new Date().toISOString(),
  });

  const response = await fetch(`${checkoutBase()}/api/v1/access-token/checkout`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Api-Key": process.env.SHIPROCKET_CHECKOUT_API_KEY ?? "",
      "X-Api-HMAC-SHA256": signBody(body),
    },
    body,
    cache: "no-store",
  });

  const payload = (await response.json().catch(() => null)) as
    | { result?: { token?: string; order_id?: string }; token?: string; message?: string }
    | null;

  if (!response.ok) {
    throw new Error(payload?.message ?? `Shiprocket Checkout request failed (${response.status}).`);
  }

  const token = payload?.result?.token ?? payload?.token;
  if (!token) {
    throw new Error("Shiprocket Checkout did not return a token.");
  }

  return { token, orderId: payload?.result?.order_id ?? "" };
}

// Used to verify an inbound order webhook is genuine by calling back to
// Shiprocket with the order_id, rather than trusting the open webhook payload.
export async function fetchCheckoutOrderDetails(orderId: string) {
  if (!isShiprocketCheckoutConfigured() || !orderId) return null;

  const body = JSON.stringify({ order_id: orderId, timestamp: new Date().toISOString() });
  const response = await fetch(`${checkoutBase()}/api/v1/custom-platform-order/details`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Api-Key": process.env.SHIPROCKET_CHECKOUT_API_KEY ?? "",
      "X-Api-HMAC-SHA256": signBody(body),
    },
    body,
    cache: "no-store",
  });

  if (!response.ok) return null;

  const payload = (await response.json().catch(() => null)) as
    | { result?: ShiprocketCheckoutOrder }
    | null;
  return payload?.result ?? null;
}

// Used to verify an inbound order webhook is genuine by calling back to
// Shiprocket with the order_id, rather than trusting the open webhook payload.
export async function verifyCheckoutOrder(orderId: string) {
  return Boolean(await fetchCheckoutOrderDetails(orderId));
}
