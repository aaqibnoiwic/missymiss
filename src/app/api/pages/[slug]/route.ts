import { NextResponse } from "next/server";
import { getPublishedPage } from "@/lib/cms";

type RouteProps = {
  params: Promise<{ slug: string }>;
};

export async function GET(_: Request, { params }: RouteProps) {
  const { slug } = await params;
  const page = await getPublishedPage(slug);

  if (!page) {
    return NextResponse.json({ error: "Page not found." }, { status: 404 });
  }

  return NextResponse.json({ page });
}
