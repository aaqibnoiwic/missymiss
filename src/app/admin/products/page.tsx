import Image from "next/image";
import Link from "next/link";
import type { Prisma } from "@prisma/client";
import { deleteProduct } from "@/app/admin/actions";
import { AdminList, AdminListRow, AdminListToolbar, AdminPagination } from "@/components/admin/admin-list";
import { AdminShell } from "@/components/admin/admin-shell";
import { Button } from "@/components/ui/button";
import { buttonVariants } from "@/components/ui/button-variants";
import { requireAdmin } from "@/lib/admin-auth";
import { ADMIN_PAGE_SIZE, readPage, readQuery } from "@/lib/admin-ui";
import { prisma } from "@/lib/db";

type PageProps = {
  searchParams: Promise<{ page?: string; q?: string; status?: string }>;
};

export default async function AdminProductsPage({ searchParams }: PageProps) {
  await requireAdmin();
  const filters = await searchParams;
  const page = readPage(filters.page);
  const query = readQuery(filters.q);
  const status = readQuery(filters.status);
  const where: Prisma.ProductWhereInput = {
    ...(query ? { OR: [{ name: { contains: query, mode: "insensitive" } }, { slug: { contains: query, mode: "insensitive" } }, { sku: { contains: query, mode: "insensitive" } }] } : {}),
    ...(status === "published" ? { isPublished: true } : status === "draft" ? { isPublished: false } : {}),
  };
  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      select: { id: true, name: true, slug: true, sku: true, price: true, inventory: true, isPublished: true, featuredImage: true, _count: { select: { variants: true, images: true } } },
      orderBy: { updatedAt: "desc" },
      skip: (page - 1) * ADMIN_PAGE_SIZE,
      take: ADMIN_PAGE_SIZE,
    }),
    prisma.product.count({ where }),
  ]);

  return <AdminShell eyebrow="Catalog" title="Products">
    <AdminListToolbar actionHref="/admin/products/new" actionLabel="Add product" query={query} status={status} statuses={[{ label: "Published", value: "published" }, { label: "Draft", value: "draft" }]} />
    <AdminList empty={!products.length}>
      {products.map((product) => <AdminListRow actions={<><Link className={buttonVariants({ variant: "outline", size: "sm" })} href={`/admin/products/${product.id}`}>Edit</Link><form action={deleteProduct}><input name="id" type="hidden" value={product.id} /><Button size="sm" type="submit" variant="ghost">Delete</Button></form></>} key={product.id}>
        <div className="flex min-w-0 items-center gap-4">
          <div className="relative size-16 shrink-0 overflow-hidden rounded-xl bg-[color:var(--color-paper)]">{product.featuredImage ? <Image alt={product.name} className="object-cover" fill sizes="64px" src={product.featuredImage} /> : null}</div>
          <div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><h2 className="truncate font-semibold">{product.name}</h2><span className={`rounded-full px-2 py-1 text-[10px] font-bold uppercase ${product.isPublished ? "bg-emerald-100 text-emerald-800" : "bg-slate-100 text-slate-700"}`}>{product.isPublished ? "Published" : "Draft"}</span></div><p className="mt-1 text-sm text-[color:var(--color-muted-foreground)]">₹{(product.price / 100).toFixed(2)} · Stock {product.inventory} · {product._count.images} images · {product._count.variants} variants</p><p className="mt-1 truncate text-xs text-[color:var(--color-muted-foreground)]">{product.slug}{product.sku ? ` · ${product.sku}` : ""}</p></div>
        </div>
      </AdminListRow>)}
    </AdminList>
    <AdminPagination page={page} query={query} status={status} total={total} />
  </AdminShell>;
}
