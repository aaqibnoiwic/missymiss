import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { verifyAdminSessionToken } from "@/lib/auth";
import { ADMIN_COOKIE_NAME } from "@/lib/auth-constants";

export async function requireAdmin() {
  const cookieStore = await cookies();
  if (!verifyAdminSessionToken(cookieStore.get(ADMIN_COOKIE_NAME)?.value)) {
    redirect("/admin/login");
  }
}
