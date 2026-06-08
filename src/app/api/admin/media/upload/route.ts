import { NextResponse, type NextRequest } from "next/server";
import { isAdminRequestAuthenticated } from "@/lib/auth";
import { getCloudinaryConfigError, uploadImageToCloudinary } from "@/lib/cloudinary";
import { saveMediaAsset } from "@/lib/media-assets";
import { allowedFolders } from "@/types/media";

const MAX_FILE_BYTES = 8 * 1024 * 1024;

export async function POST(request: NextRequest) {
  if (!isAdminRequestAuthenticated(request)) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const configurationError = getCloudinaryConfigError();
  if (configurationError) {
    return NextResponse.json({ error: configurationError }, { status: 503 });
  }

  const formData = await request.formData();
  const file = formData.get("file");
  const alt = String(formData.get("alt") || "");
  const folder = String(formData.get("folder") || "");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Please choose an image file." }, { status: 400 });
  }

  if (!file.type.startsWith("image/")) {
    return NextResponse.json({ error: "Only image files are supported." }, { status: 400 });
  }

  if (file.size > MAX_FILE_BYTES) {
    return NextResponse.json(
      { error: "Images must be 8MB or smaller." },
      { status: 400 },
    );
  }

  if (!allowedFolders.includes(folder as (typeof allowedFolders)[number])) {
    return NextResponse.json({ error: "Choose a valid collection folder." }, { status: 400 });
  }

  try {
    const buffer = Buffer.from(await file.arrayBuffer());
    const uploadedAsset = await uploadImageToCloudinary({
      buffer,
      filename: file.name,
      folder: folder as (typeof allowedFolders)[number],
      alt,
    });
    const asset = await saveMediaAsset(uploadedAsset);

    return NextResponse.json({ asset });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "The image could not be saved.",
      },
      { status: 500 },
    );
  }
}
