import { v2 as cloudinary, type UploadApiResponse } from "cloudinary";
import { allowedFolders, type MediaAsset } from "@/types/media";

let configured = false;

export function isCloudinaryConfigured() {
  return Boolean(
    process.env.CLOUDINARY_CLOUD_NAME &&
      process.env.CLOUDINARY_API_KEY &&
      process.env.CLOUDINARY_API_SECRET,
  );
}

export function getCloudinaryConfigError() {
  if (isCloudinaryConfigured()) return null;
  return "Missing image storage credentials. Add the required upload environment variables.";
}

function configureCloudinary() {
  if (configured || !isCloudinaryConfigured()) return;

  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
  });

  configured = true;
}

export async function uploadImageToCloudinary({
  buffer,
  filename,
  folder,
  alt,
}: {
  alt?: string;
  buffer: Buffer;
  filename: string;
  folder: (typeof allowedFolders)[number];
}) {
  configureCloudinary();

  if (!isCloudinaryConfigured()) {
    throw new Error(getCloudinaryConfigError() ?? "Image storage is not configured.");
  }

  const result = await new Promise<UploadApiResponse>((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        resource_type: "image",
        folder,
        use_filename: true,
        unique_filename: true,
        filename_override: filename.replace(/\.[^.]+$/, ""),
        context: alt ? { alt } : undefined,
        tags: ["missy-miss", "atelier-media"],
      },
      (error, response) => {
        if (error || !response) {
          reject(error ?? new Error("Image storage did not return an upload response."));
          return;
        }
        resolve(response);
      },
    );

    uploadStream.end(buffer);
  });

  return normalizeMediaAsset(result, folder, alt);
}

export function normalizeMediaAsset(
  result: {
    asset_id?: string;
    bytes: number;
    created_at: string;
    format: string;
    height: number;
    public_id: string;
    secure_url: string;
    width: number;
  },
  folder: (typeof allowedFolders)[number],
  alt?: string,
): MediaAsset {
  return {
    id: result.asset_id ?? result.public_id,
    publicId: result.public_id,
    url: result.secure_url,
    width: result.width,
    height: result.height,
    format: result.format,
    bytes: result.bytes,
    alt: alt?.trim() ?? "",
    folder,
    createdAt: result.created_at,
  };
}
