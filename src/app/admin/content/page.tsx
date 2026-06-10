import Link from "next/link";
import { AdminList, AdminListRow, AdminListToolbar } from "@/components/admin/admin-list";
import { AdminShell } from "@/components/admin/admin-shell";
import { buttonVariants } from "@/components/ui/button-variants";
import { requireAdmin } from "@/lib/admin-auth";
import { readQuery } from "@/lib/admin-ui";
import { prisma } from "@/lib/db";

export default async function AdminContentPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  await requireAdmin();
  const query = readQuery((await searchParams).q);
  const [pages, categories, galleryCount, testimonialCount] = await Promise.all([
    prisma.sitePage.findMany({ where: query ? { title: { contains: query, mode: "insensitive" } } : {}, select: { id: true, title: true, slug: true, pageType: true, isPublished: true }, orderBy: { updatedAt: "desc" }, take: 25 }),
    prisma.category.findMany({ where: query ? { title: { contains: query, mode: "insensitive" } } : {}, select: { id: true, title: true, slug: true, collectionType: true, isPublished: true, imageUrl: true }, orderBy: { updatedAt: "desc" }, take: 25 }),
    prisma.galleryImage.count(),
    prisma.testimonial.count(),
  ]);
  return <AdminShell eyebrow="Editorial CMS" title="Content"><AdminListToolbar actionHref="/admin/content/manage" actionLabel="Open content editor" query={query} /><div className="mb-5 grid gap-4 sm:grid-cols-2"><div className="rounded-2xl border border-[color:var(--color-border)] bg-white/85 p-5"><p className="text-sm text-[color:var(--color-muted-foreground)]">Gallery images</p><p className="mt-2 font-display text-4xl">{galleryCount}</p></div><div className="rounded-2xl border border-[color:var(--color-border)] bg-white/85 p-5"><p className="text-sm text-[color:var(--color-muted-foreground)]">Testimonials</p><p className="mt-2 font-display text-4xl">{testimonialCount}</p></div></div><AdminList empty={!pages.length && !categories.length}>{pages.map((page) => <AdminListRow actions={<Link className={buttonVariants({ variant: "outline", size: "sm" })} href="/admin/content/manage">Edit</Link>} key={page.id}><div><h2 className="font-semibold">{page.title}</h2><p className="mt-1 text-sm text-[color:var(--color-muted-foreground)]">Page · {page.pageType} · {page.isPublished ? "Published" : "Draft"} · /{page.slug}</p></div></AdminListRow>)}{categories.map((category) => <AdminListRow actions={<Link className={buttonVariants({ variant: "outline", size: "sm" })} href="/admin/content/manage">Edit</Link>} key={category.id}><div><h2 className="font-semibold">{category.title}</h2><p className="mt-1 text-sm text-[color:var(--color-muted-foreground)]">Collection · {category.collectionType} · {category.isPublished ? "Published" : "Draft"} · {category.imageUrl ? "Image ready" : "Image missing"} · /{category.slug}</p></div></AdminListRow>)}</AdminList></AdminShell>;
}
