import { NextResponse, type NextRequest } from "next/server";
import { isAdminRequestAuthenticated } from "@/lib/auth";
import { listMediaAssets } from "@/lib/media-assets";

export async function GET(request: NextRequest) {
  if (!isAdminRequestAuthenticated(request)) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  try {
    const assets = await listMediaAssets();
    return NextResponse.json({ assets });
  } catch {
    return NextResponse.json(
      { error: "The media library could not be loaded." },
      { status: 500 },
    );
  }
}
