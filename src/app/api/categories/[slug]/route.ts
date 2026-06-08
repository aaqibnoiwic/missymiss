import { NextResponse } from "next/server";
import { getPublishedCategory } from "@/lib/cms";

type RouteProps = {
  params: Promise<{ slug: string }>;
};

export async function GET(_: Request, { params }: RouteProps) {
  const { slug } = await params;
  const category = await getPublishedCategory(slug);

  if (!category) {
    return NextResponse.json({ error: "Category not found." }, { status: 404 });
  }

  return NextResponse.json({ category });
}
