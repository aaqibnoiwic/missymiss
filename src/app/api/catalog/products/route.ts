import { NextResponse, type NextRequest } from "next/server";
import { fetchProductCatalog, parsePagination } from "@/lib/shiprocket-catalog";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const { page, limit, skip } = parsePagination(request.nextUrl.searchParams);
  const result = await fetchProductCatalog(page, limit, skip);
  return NextResponse.json(result, { headers: { "Cache-Control": "no-store" } });
}
