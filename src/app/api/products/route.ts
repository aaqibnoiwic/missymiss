import { NextResponse } from "next/server";
import { getShopProducts } from "@/lib/cms";

export async function GET() {
  const products = await getShopProducts();
  return NextResponse.json({ products });
}
