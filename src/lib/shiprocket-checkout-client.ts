"use client";

type HeadlessCheckoutApi = {
  addToCart: (
    event: unknown,
    token: string,
    options?: { fallbackUrl?: string },
  ) => void;
};

declare global {
  interface Window {
    HeadlessCheckout?: HeadlessCheckoutApi;
  }
}

export type CheckoutLineItem = { variant_id: string; quantity: number };

export function isShiprocketCheckoutEnabled() {
  return (
    process.env.NEXT_PUBLIC_SHIPROCKET_CHECKOUT_ENABLED === "true" &&
    Boolean(process.env.NEXT_PUBLIC_SHIPROCKET_CHECKOUT_SCRIPT)
  );
}

let scriptPromise: Promise<HeadlessCheckoutApi> | null = null;

function loadHeadlessCheckout() {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("Checkout can only run in the browser."));
  }
  if (window.HeadlessCheckout) return Promise.resolve(window.HeadlessCheckout);

  const src = process.env.NEXT_PUBLIC_SHIPROCKET_CHECKOUT_SCRIPT;
  if (!src) return Promise.reject(new Error("Shiprocket Checkout script is not configured."));

  if (!scriptPromise) {
    scriptPromise = new Promise<HeadlessCheckoutApi>((resolve, reject) => {
      const existing = document.querySelector<HTMLScriptElement>(`script[src="${src}"]`);
      const handleReady = () => {
        if (window.HeadlessCheckout) resolve(window.HeadlessCheckout);
        else reject(new Error("Shiprocket Checkout failed to initialise."));
      };
      if (existing) {
        existing.addEventListener("load", handleReady, { once: true });
        existing.addEventListener("error", () => reject(new Error("Shiprocket Checkout script failed to load.")), { once: true });
        if (window.HeadlessCheckout) resolve(window.HeadlessCheckout);
        return;
      }
      const script = document.createElement("script");
      script.src = src;
      script.async = true;
      script.addEventListener("load", handleReady, { once: true });
      script.addEventListener("error", () => {
        scriptPromise = null;
        reject(new Error("Shiprocket Checkout script failed to load."));
      }, { once: true });
      document.body.appendChild(script);
    });
  }
  return scriptPromise;
}

async function fetchCheckoutToken(items: CheckoutLineItem[]) {
  const response = await fetch("/api/checkout/shiprocket-token", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ items }),
  });
  const payload = (await response.json()) as { token?: string; error?: string };
  if (!response.ok || !payload.token) {
    throw new Error(payload.error || "Could not start Shiprocket checkout.");
  }
  return payload.token;
}

export async function openShiprocketCheckout(
  event: unknown,
  items: CheckoutLineItem[],
  fallbackUrl: string,
) {
  const [api, token] = await Promise.all([loadHeadlessCheckout(), fetchCheckoutToken(items)]);
  api.addToCart(event, token, { fallbackUrl });
}
