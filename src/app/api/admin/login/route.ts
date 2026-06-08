import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import {
  createAdminSessionToken,
  hasAdminCredentialsConfigured,
  validateAdminCredentials,
} from "@/lib/auth";
import { ADMIN_COOKIE_NAME } from "@/lib/auth-constants";

export async function POST(request: Request) {
  if (!hasAdminCredentialsConfigured()) {
    return NextResponse.json(
      {
        error:
          "Admin credentials are not configured. Add ADMIN_USERNAME and ADMIN_PASSWORD.",
      },
      { status: 503 },
    );
  }

  const { username, password } = (await request.json()) as {
    password?: string;
    username?: string;
  };

  if (!username || !password || !validateAdminCredentials(username, password)) {
    return NextResponse.json({ error: "Invalid username or password." }, { status: 401 });
  }

  const token = createAdminSessionToken(username);
  const cookieStore = await cookies();
  cookieStore.set(ADMIN_COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 12,
  });

  return NextResponse.json({ ok: true });
}
