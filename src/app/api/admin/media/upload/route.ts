import { NextResponse, type NextRequest } from "next/server";
import { isAdminRequestAuthenticated } from "@/lib/auth";
import { getImageKitConfigError, uploadImageToImageKit } from "@/lib/imagekit";
import { saveMediaAsset } from "@/lib/media-assets";
import { allowedFolders } from "@/types/media";

const MAX_FILE_BYTES = 8 * 1024 * 1024;

export async function POST(request: NextRequest) {
  if (!isAdminRequestAuthenticated(request)) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const configurationError = getImageKitConfigError();
  if (configurationError) {
    return NextResponse.json({ error: configurationError }, { status: 503 });
  }

  const formData = await request.formData();
  const files = [
    ...formData.getAll("files"),
    ...formData.getAll("file"),
  ].filter((file): file is File => file instanceof File);
  const alt = String(formData.get("alt") || "");
  const folder = String(formData.get("folder") || "");

  if (!files.length) {
    return NextResponse.json({ error: "Please choose an image file." }, { status: 400 });
  }

  if (!allowedFolders.includes(folder as (typeof allowedFolders)[number])) {
    return NextResponse.json({ error: "Choose a valid collection folder." }, { status: 400 });
  }

  const assets = [];
  const errors = [];

  for (const file of files) {
    if (!file.type.startsWith("image/")) {
      errors.push({ fileName: file.name, error: "Only image files are supported." });
      continue;
    }
    if (file.size > MAX_FILE_BYTES) {
      errors.push({ fileName: file.name, error: "Images must be 8MB or smaller." });
      continue;
    }

    try {
      const buffer = Buffer.from(await file.arrayBuffer());
      const uploadedAsset = await uploadImageToImageKit({
        buffer,
        filename: file.name,
        folder: folder as (typeof allowedFolders)[number],
        alt,
      });
      assets.push(await saveMediaAsset(uploadedAsset));
    } catch (error) {
      errors.push({
        fileName: file.name,
        error: error instanceof Error ? error.message : "The image could not be saved.",
      });
    }
  }

  return NextResponse.json({
    assets,
    errors,
    asset: assets[0],
    error: assets.length ? undefined : errors[0]?.error,
  }, { status: assets.length ? 200 : 500 });
}
