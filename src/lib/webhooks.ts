import { createHmac, timingSafeEqual } from "crypto";

function safeEqual(a: string, b: string) {
  const bufferA = Buffer.from(a);
  const bufferB = Buffer.from(b);
  if (bufferA.length !== bufferB.length) return false;
  try {
    return timingSafeEqual(bufferA, bufferB);
  } catch {
    return false;
  }
}

export function verifyWebhookSignature(body: string, signature: string | null) {
  const secret = process.env.SHIPROCKET_WEBHOOK_SECRET;
  if (!secret || !signature) return false;

  const expected = createHmac("sha256", secret).update(body).digest("hex");
  const supplied = signature.replace(/^sha256=/, "");
  return safeEqual(expected, supplied);
}

// Shiprocket's tracking webhook UI sends a static token in a header you choose
// (default x-api-key) rather than an HMAC signature, so verify it by constant-time compare.
export function verifyWebhookToken(token: string | null) {
  const expected = process.env.SHIPROCKET_WEBHOOK_TOKEN;
  if (!expected || !token) return false;
  return safeEqual(expected, token);
}
