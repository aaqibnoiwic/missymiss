const API_BASE = "https://apiv2.shiprocket.in/v1/external";

let tokenCache: { expiresAt: number; token: string } | null = null;

export function isShiprocketShippingConfigured() {
  return Boolean(
    process.env.SHIPROCKET_EMAIL &&
      process.env.SHIPROCKET_PASSWORD &&
      process.env.SHIPROCKET_PICKUP_LOCATION,
  );
}

async function getShiprocketToken() {
  if (tokenCache && tokenCache.expiresAt > Date.now()) return tokenCache.token;
  if (!isShiprocketShippingConfigured()) {
    throw new Error("Shiprocket Shipping API credentials are not configured.");
  }

  const response = await fetch(`${API_BASE}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: process.env.SHIPROCKET_EMAIL,
      password: process.env.SHIPROCKET_PASSWORD,
    }),
    cache: "no-store",
  });
  const payload = (await response.json().catch(() => null)) as
    | { token?: string; message?: string }
    | null;

  if (!response.ok || !payload?.token) {
    throw new Error(payload?.message ?? "Shiprocket authentication failed.");
  }

  tokenCache = { token: payload.token, expiresAt: Date.now() + 8 * 24 * 60 * 60 * 1000 };
  return payload.token;
}

async function shiprocketRequest<T>(path: string, init: RequestInit = {}) {
  const token = await getShiprocketToken();
  const response = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      ...init.headers,
    },
    cache: "no-store",
  });
  const payload = (await response.json().catch(() => null)) as T & { message?: string };

  if (!response.ok) {
    throw new Error(payload?.message ?? `Shiprocket request failed (${response.status}).`);
  }
  return payload;
}

export async function createShiprocketOrder(payload: Record<string, unknown>) {
  return shiprocketRequest<{
    order_id?: number;
    shipment_id?: number;
    status?: string;
  }>("/orders/create/adhoc", { method: "POST", body: JSON.stringify(payload) });
}

export async function getRecommendedCouriers({
  deliveryPostcode,
  pickupPostcode,
  cod,
  weight,
}: {
  deliveryPostcode: string;
  pickupPostcode: string;
  cod: boolean;
  weight: number;
}) {
  const params = new URLSearchParams({
    pickup_postcode: pickupPostcode,
    delivery_postcode: deliveryPostcode,
    cod: cod ? "1" : "0",
    weight: String(weight),
  });
  return shiprocketRequest<{
    data?: { available_courier_companies?: Array<Record<string, unknown>> };
  }>(`/courier/serviceability/?${params}`);
}

export async function assignAwb(shipmentId: string, courierId?: string) {
  return shiprocketRequest<Record<string, unknown>>("/courier/assign/awb", {
    method: "POST",
    body: JSON.stringify({
      shipment_id: Number(shipmentId),
      ...(courierId ? { courier_id: Number(courierId) } : {}),
    }),
  });
}

export async function schedulePickup(shipmentId: string) {
  return shiprocketRequest<Record<string, unknown>>("/courier/generate/pickup", {
    method: "POST",
    body: JSON.stringify({ shipment_id: [Number(shipmentId)] }),
  });
}

export async function cancelShiprocketOrder(shiprocketOrderId: string) {
  return shiprocketRequest<Record<string, unknown>>("/orders/cancel", {
    method: "POST",
    body: JSON.stringify({ ids: [Number(shiprocketOrderId)] }),
  });
}
