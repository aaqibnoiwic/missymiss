import { createHmac, timingSafeEqual } from "crypto";
import type { NextRequest } from "next/server";
import { ADMIN_COOKIE_NAME } from "@/lib/auth-constants";
const SESSION_DURATION_MS = 1000 * 60 * 60 * 12;

function getAdminSecret() {
  return process.env.ADMIN_SECRET || process.env.ADMIN_PASSWORD || "missy-miss-dev-secret";
}

export function hasAdminCredentialsConfigured() {
  return Boolean(process.env.ADMIN_USERNAME && process.env.ADMIN_PASSWORD);
}

export function validateAdminCredentials(username: string, password: string) {
  return (
    username === process.env.ADMIN_USERNAME &&
    password === process.env.ADMIN_PASSWORD
  );
}

function signPayload(payload: string) {
  return createHmac("sha256", getAdminSecret()).update(payload).digest("hex");
}

export function createAdminSessionToken(username: string) {
  const expiresAt = Date.now() + SESSION_DURATION_MS;
  const payload = `${username}:${expiresAt}`;
  return `${payload}:${signPayload(payload)}`;
}

export function verifyAdminSessionToken(token: string | undefined) {
  if (!token) return false;

  const parts = token.split(":");
  if (parts.length < 3) return false;

  const signature = parts.pop()!;
  const expiresAt = Number(parts.pop());
  const username = parts.join(":");

  if (!username || Number.isNaN(expiresAt) || expiresAt < Date.now()) {
    return false;
  }

  const payload = `${username}:${expiresAt}`;
  const expected = signPayload(payload);

  try {
    return timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
  } catch {
    return false;
  }
}

export function isAdminRequestAuthenticated(request: NextRequest) {
  return verifyAdminSessionToken(request.cookies.get(ADMIN_COOKIE_NAME)?.value);
}
