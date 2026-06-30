import { createHmac } from "crypto";

const DEFAULT_BASE = "https://checkout-api.shiprocket.com";

export type CheckoutCartData = {
  items: Array<{ variant_id: string; quantity: number }>;
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
export async function verifyCheckoutOrder(orderId: string) {
  if (!isShiprocketCheckoutConfigured() || !orderId) return false;

  const body = JSON.stringify({ order_id: orderId, timestamp: new Date().toISOString() });
  try {
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
    return response.ok;
  } catch {
    return false;
  }
}
