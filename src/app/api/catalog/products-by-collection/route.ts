import { NextResponse, type NextRequest } from "next/server";
import { fetchProductsByCollection, parsePagination } from "@/lib/shiprocket-catalog";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const collectionId = request.nextUrl.searchParams.get("collection_id")?.trim();
  if (!collectionId) {
    return NextResponse.json({ error: "collection_id is required." }, { status: 400 });
  }

  const { page, limit, skip } = parsePagination(request.nextUrl.searchParams);
  const result = await fetchProductsByCollection(collectionId, page, limit, skip);
  return NextResponse.json(result, { headers: { "Cache-Control": "no-store" } });
}
