import { allowedFolders, type MediaAsset } from "@/types/media";

type ImageKitUploadResponse = {
  fileId: string;
  filePath: string;
  height: number;
  name: string;
  size: number;
  url: string;
  width: number;
};

export function isImageKitConfigured() {
  return Boolean(process.env.IMAGEKIT_PRIVATE_KEY && process.env.IMAGEKIT_URL_ENDPOINT);
}

export function getImageKitConfigError() {
  if (isImageKitConfigured()) return null;
  return "Missing ImageKit credentials. Add IMAGEKIT_PRIVATE_KEY and IMAGEKIT_URL_ENDPOINT.";
}

export async function uploadImageToImageKit({
  buffer,
  filename,
  folder,
  alt,
}: {
  alt?: string;
  buffer: Buffer;
  filename: string;
  folder: (typeof allowedFolders)[number];
}): Promise<MediaAsset> {
  if (!isImageKitConfigured()) {
    throw new Error(getImageKitConfigError() ?? "ImageKit is not configured.");
  }

  const formData = new FormData();
  const fileBytes = new Uint8Array(buffer.byteLength);
  fileBytes.set(buffer);
  formData.set("file", new Blob([fileBytes.buffer]));
  formData.set("fileName", filename);
  formData.set("folder", `/${folder}`);
  formData.set("useUniqueFileName", "true");
  formData.set("tags", "missy-miss,atelier-media");

  const authorization = Buffer.from(`${process.env.IMAGEKIT_PRIVATE_KEY}:`).toString("base64");
  const response = await fetch("https://upload.imagekit.io/api/v1/files/upload", {
    method: "POST",
    headers: { Authorization: `Basic ${authorization}` },
    body: formData,
  });

  if (!response.ok) {
    const payload = await response.json().catch(() => null) as { message?: string } | null;
    throw new Error(payload?.message ?? `ImageKit upload failed (${response.status}).`);
  }

  const result = await response.json() as ImageKitUploadResponse;
  const format = result.name.includes(".") ? result.name.split(".").pop() ?? "" : "";

  return {
    id: result.fileId,
    publicId: result.filePath,
    url: result.url,
    width: result.width,
    height: result.height,
    format,
    bytes: result.size,
    alt: alt?.trim() ?? "",
    folder,
    createdAt: new Date().toISOString(),
  };
}
