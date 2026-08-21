import Image, { type ImageProps } from "next/image";

const OPTIMIZED_CDN_HOSTS = new Set([
  "ik.imagekit.io",
  "res.cloudinary.com",
]);

export function isExternalOptimizedImage(src: ImageProps["src"]) {
  if (typeof src !== "string" || !src.startsWith("https://")) return false;

  try {
    return OPTIMIZED_CDN_HOSTS.has(new URL(src).hostname.toLowerCase());
  } catch {
    return false;
  }
}

/**
 * Keeps Next.js optimization for local assets while avoiding a second image
 * transformation for assets already delivered by the configured image CDNs.
 */
export function CdnAwareImage({ src, alt, unoptimized, ...props }: ImageProps) {
  return (
    <Image
      {...props}
      alt={alt}
      src={src}
      unoptimized={unoptimized ?? isExternalOptimizedImage(src)}
    />
  );
}
