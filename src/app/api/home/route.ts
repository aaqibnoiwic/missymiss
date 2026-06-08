import { NextResponse } from "next/server";
import { getHomeData } from "@/lib/cms";

export async function GET() {
  const data = await getHomeData();
  return NextResponse.json(data);
}
