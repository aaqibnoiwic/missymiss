import Link from "next/link";
import { AdminShell } from "@/components/admin/admin-shell";
import { requireAdmin } from "@/lib/admin-auth";
import { prisma } from "@/lib/db";

const sections = [
  ["/admin/products", "Products & variants", "Catalog details, stock, dimensions, and gallery images."],
  ["/admin/orders", "Orders & fulfillment", "Approve orders, assign AWBs, schedule pickups, and track status."],
  ["/admin/reviews", "Product reviews", "Create and publish professional product-specific reviews."],
  ["/admin/banners", "Homepage banners", "Manage responsive hero carousel and promotional placements."],
  ["/admin/content", "Content CMS", "Pages, categories, gallery, testimonials, and SEO."],
  ["/admin/settings", "Integration settings", "Check Shiprocket Checkout, Shipping API, and media readiness."],
];

export default async function AdminPage() {
  await requireAdmin();
  const [products, orders, pendingOrders, reviews] = await Promise.all([
    prisma.product.count(),
    prisma.order.count(),
    prisma.order.count({ where: { status: "pending" } }),
    prisma.productReview.count({ where: { isPublished: true } }),
  ]);
  return <AdminShell eyebrow="Protected operations" title="Commerce dashboard">
    <div className="grid gap-4 md:grid-cols-4">{[["Products", products], ["Orders", orders], ["Pending", pendingOrders], ["Published reviews", reviews]].map(([label, value]) => <div className="rounded-[1.75rem] border border-[color:var(--color-border)] bg-white/85 p-5" key={label}><p className="text-xs font-bold uppercase tracking-[.2em] text-[color:var(--color-muted-foreground)]">{label}</p><p className="mt-3 font-display text-4xl">{value}</p></div>)}</div>
    <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">{sections.map(([href, title, copy]) => <Link className="rounded-[2rem] border border-[color:var(--color-border)] bg-white/85 p-6 transition hover:-translate-y-1 hover:border-[color:var(--color-gold-deep)]" href={href} key={href}><h2 className="font-display text-3xl">{title}</h2><p className="mt-3 text-sm leading-7 text-[color:var(--color-muted-foreground)]">{copy}</p></Link>)}</div>
  </AdminShell>;
}
