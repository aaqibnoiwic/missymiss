import type { MediaAsset as PrismaMediaAsset } from "@prisma/client";
import { prisma } from "@/lib/db";
import { allowedFolders, type MediaAsset } from "@/types/media";

export function toMediaAsset(asset: PrismaMediaAsset): MediaAsset {
  const folder = allowedFolders.includes(
    asset.folder as (typeof allowedFolders)[number],
  )
    ? (asset.folder as (typeof allowedFolders)[number])
    : "missy-miss/products";

  return {
    id: asset.id,
    publicId: asset.publicId,
    url: asset.url,
    width: asset.width,
    height: asset.height,
    format: asset.format,
    bytes: asset.bytes,
    alt: asset.alt,
    folder,
    createdAt: asset.createdAt.toISOString(),
  };
}

export async function listMediaAssets() {
  const assets = await prisma.mediaAsset.findMany({
    orderBy: {
      createdAt: "desc",
    },
    take: 48,
  });

  return assets.map(toMediaAsset);
}

export async function saveMediaAsset(asset: MediaAsset) {
  const saved = await prisma.mediaAsset.upsert({
    where: {
      publicId: asset.publicId,
    },
    update: {
      url: asset.url,
      width: asset.width,
      height: asset.height,
      format: asset.format,
      bytes: asset.bytes,
      alt: asset.alt,
      folder: asset.folder,
    },
    create: {
      id: asset.id,
      publicId: asset.publicId,
      url: asset.url,
      width: asset.width,
      height: asset.height,
      format: asset.format,
      bytes: asset.bytes,
      alt: asset.alt,
      folder: asset.folder,
      createdAt: new Date(asset.createdAt),
    },
  });

  return toMediaAsset(saved);
}
