import { createHash } from "crypto";
import { prisma } from "@/lib/db";

const SHIPROCKET_ID_BASE = BigInt("1000000000000000");
const SHIPROCKET_ID_RANGE = BigInt("8000000000000000");

function toHashBigInt(value: string) {
  const hex = createHash("sha256").update(value).digest("hex").slice(0, 16);
  return BigInt(`0x${hex}`);
}

export function toShiprocketNumericId(value: string) {
  return Number((toHashBigInt(value) % SHIPROCKET_ID_RANGE) + SHIPROCKET_ID_BASE);
}

function isNumericId(value: string) {
  return /^\d+$/.test(value);
}

async function resolveEntityId(
  externalId: string,
  loader: () => Promise<Array<{ id: string }>>,
) {
  const trimmed = externalId.trim();
  if (!trimmed) return null;
  if (!isNumericId(trimmed)) return trimmed;

  const candidates = await loader();
  const match = candidates.find((candidate) => String(toShiprocketNumericId(candidate.id)) === trimmed);
  return match?.id ?? null;
}

export async function resolveShiprocketCollectionId(externalId: string) {
  return resolveEntityId(externalId, () => prisma.category.findMany({ select: { id: true } }));
}

export async function resolveShiprocketProductId(externalId: string) {
  return resolveEntityId(externalId, () => prisma.product.findMany({ select: { id: true } }));
}

export async function resolveShiprocketVariantId(externalId: string) {
  return resolveEntityId(externalId, () => prisma.productVariant.findMany({ select: { id: true } }));
}
