import { NextResponse, type NextRequest } from "next/server";
import { isAdminRequestAuthenticated } from "@/lib/auth";

const NVIDIA_INVOKE_URL = "https://integrate.api.nvidia.com/v1/chat/completions";
const MODEL = "moonshotai/kimi-k2.6";

type AiProductCopy = {
  productName: string;
  description: string;
  highlights: string[];
};

function extractJson(content: string) {
  const direct = JSON.parse(content) as AiProductCopy;
  return direct;
}

function parseAiCopy(content: string): AiProductCopy {
  try {
    return extractJson(content);
  } catch {
    const match = content.match(/\{[\s\S]*\}/);
    if (!match) throw new Error("AI response did not include JSON.");
    return extractJson(match[0]);
  }
}

export async function POST(request: NextRequest) {
  if (!isAdminRequestAuthenticated(request)) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const apiKey = process.env.NVIDIA_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "NVIDIA_API_KEY is not configured." },
      { status: 503 },
    );
  }

  const { imageUrl } = (await request.json()) as { imageUrl?: string };
  if (!imageUrl) {
    return NextResponse.json({ error: "Please upload a product image first." }, { status: 400 });
  }

  const absoluteImageUrl = new URL(imageUrl, request.nextUrl.origin).toString();
  const response = await fetch(NVIDIA_INVOKE_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: MODEL,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text:
                "Analyze this fashion product image and return only valid JSON with these exact keys: productName, description, highlights. productName should be concise and ecommerce-ready. description should be 2-3 polished sentences for a premium womenswear product page. highlights should be 4 short bullet-style strings. Do not include markdown.",
            },
            {
              type: "image_url",
              image_url: { url: absoluteImageUrl },
            },
          ],
        },
      ],
      max_tokens: 1200,
      temperature: 0.7,
      top_p: 1,
      stream: false,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    return NextResponse.json(
      { error: errorText || "AI analysis failed." },
      { status: response.status },
    );
  }

  const payload = await response.json() as {
    choices?: Array<{ message?: { content?: string } }>;
  };
  const content = payload.choices?.[0]?.message?.content;
  if (!content) {
    return NextResponse.json({ error: "AI did not return product copy." }, { status: 502 });
  }

  try {
    const copy = parseAiCopy(content);
    return NextResponse.json({
      productName: String(copy.productName ?? "").trim(),
      description: String(copy.description ?? "").trim(),
      highlights: Array.isArray(copy.highlights)
        ? copy.highlights.map((highlight) => String(highlight).trim()).filter(Boolean)
        : [],
    });
  } catch {
    return NextResponse.json(
      { error: "AI response could not be parsed." },
      { status: 502 },
    );
  }
}
