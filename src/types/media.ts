export const allowedFolders = [
  "missy-miss/brand",
  "missy-miss/products",
  "missy-miss/editorial",
] as const;

export type MediaAsset = {
  id: string;
  publicId: string;
  url: string;
  width: number;
  height: number;
  format: string;
  bytes: number;
  alt: string;
  folder: (typeof allowedFolders)[number];
  createdAt: string;
};

export type BrandAsset = {
  logoFull: string;
  logoSymbol: string;
};
