import { createHmac, timingSafeEqual } from "crypto";

export function verifyWebhookSignature(body: string, signature: string | null) {
  const secret = process.env.SHIPROCKET_WEBHOOK_SECRET;
  if (!secret || !signature) return false;

  const expected = createHmac("sha256", secret).update(body).digest("hex");
  const supplied = signature.replace(/^sha256=/, "");
  try {
    return timingSafeEqual(Buffer.from(expected), Buffer.from(supplied));
  } catch {
    return false;
  }
}
