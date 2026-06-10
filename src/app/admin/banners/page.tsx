import Link from "next/link";
import type { Prisma } from "@prisma/client";
import { AdminList, AdminListRow, AdminListToolbar, AdminPagination } from "@/components/admin/admin-list";
import { AdminShell } from "@/components/admin/admin-shell";
import { buttonVariants } from "@/components/ui/button-variants";
import { requireAdmin } from "@/lib/admin-auth";
import { ADMIN_PAGE_SIZE, readPage, readQuery } from "@/lib/admin-ui";
import { prisma } from "@/lib/db";

export default async function AdminBannersPage({ searchParams }: { searchParams: Promise<{ page?: string; q?: string; status?: string }> }) {
  await requireAdmin();
  const filters = await searchParams;
  const page = readPage(filters.page), query = readQuery(filters.q), status = readQuery(filters.status);
  const where: Prisma.BannerWhereInput = { ...(query ? { title: { contains: query, mode: "insensitive" } } : {}), ...(status === "enabled" ? { isEnabled: true } : status === "disabled" ? { isEnabled: false } : {}) };
  const [banners, total] = await Promise.all([prisma.banner.findMany({ where, select: { id: true, title: true, placement: true, scope: true, isEnabled: true, startsAt: true, endsAt: true }, orderBy: [{ placement: "asc" }, { sortOrder: "asc" }], skip: (page - 1) * ADMIN_PAGE_SIZE, take: ADMIN_PAGE_SIZE }), prisma.banner.count({ where })]);
  return <AdminShell eyebrow="Campaign studio" title="Banners"><AdminListToolbar actionHref="/admin/banners/new" actionLabel="Add banner" query={query} status={status} statuses={[{ label: "Enabled", value: "enabled" }, { label: "Disabled", value: "disabled" }]} /><AdminList empty={!banners.length}>{banners.map((banner) => <AdminListRow actions={<Link className={buttonVariants({ variant: "outline", size: "sm" })} href={`/admin/banners/${banner.id}`}>Edit</Link>} key={banner.id}><div><div className="flex items-center gap-2"><h2 className="font-semibold">{banner.title}</h2><span className="rounded-full bg-slate-100 px-2 py-1 text-[10px] font-bold uppercase">{banner.isEnabled ? "Enabled" : "Disabled"}</span></div><p className="mt-1 text-sm text-[color:var(--color-muted-foreground)]">{banner.scope} · {banner.placement}</p></div></AdminListRow>)}</AdminList><AdminPagination page={page} query={query} status={status} total={total} /></AdminShell>;
}
